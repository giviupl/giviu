import type { Metadata } from 'next';
import { supabaseServer } from '@/lib/supabase-server';
import SearchClient from './SearchClient';
import styles from '@/styles/CategoryPages.module.css';

// ============================================
// /szukaj — server-side search page
// URL: /szukaj?q=czarne+kubki&brand=stanley&color=Czarny&page=2
//
// Architektura:
// - Full scan active products + in-memory STRICT match
// - 6 pól tekstowych + colors[].name (JSONB)
// - Bez soft fallback (Algolia/Bloomreach best practice)
// - "Did you mean?" gdy multi-word zwraca zero
// - meta robots: noindex, follow
//
// Future: Postgres FTS z polish dictionary lub pgvector (Tura post-deploy)
// gdy baza przekroczy ~5k produktów lub trzeba lematyzacji "kubki" → "kubek"
// ============================================

const PAGE_SIZE = 24;
const SCAN_LIMIT = 1000;

const SELECT_FIELDS =
  'id, slug, name, brand_name, brand_id, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, image_url';

interface ProductColor {
  name?: string;
  hex?: string;
  images?: string[];
}

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand_name: string;
  brand_id: string | null;
  code: string | null;
  price: string | null;
  category: string | null;
  category_slug: string | null;
  subcategory: string | null;
  subcategory_slug: string | null;
  description: string | null;
  colors: ProductColor[] | null;
  views: string[] | null;
  emoji: string | null;
  is_new: boolean | null;
  image_url: string | null;
}

type SearchParamsPromise = Promise<{
  q?: string;
  brand?: string;
  color?: string;
  page?: string;
}>;

// ============================================
// Match: czy produkt zawiera słowo w 6 polach lub colors[].name
// ============================================
function productMatchesWord(p: ProductRow, word: string): boolean {
  const w = word.toLowerCase();
  if (!w) return false;

  const text =
    `${p.name ?? ''} ${p.brand_name ?? ''} ${p.code ?? ''} ${p.description ?? ''} ${p.category ?? ''} ${p.subcategory ?? ''}`.toLowerCase();

  if (text.includes(w)) return true;

  const colors = Array.isArray(p.colors) ? p.colors : [];
  return colors.some((c) => (c?.name ?? '').toLowerCase().includes(w));
}

// ============================================
// Metadata
// ============================================
export async function generateMetadata({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}): Promise<Metadata> {
  const { q = '' } = await searchParams;
  const trimmed = q.trim();
  const title = trimmed
    ? `Wyniki dla „${trimmed}" — Giviu`
    : 'Wyszukiwanie — Giviu';
  return {
    title,
    description: trimmed
      ? `Wyniki wyszukiwania dla „${trimmed}" w katalogu Giviu — prezenty firmowe premium.`
      : 'Wyszukiwanie produktów w katalogu Giviu — prezenty firmowe premium.',
    robots: { index: false, follow: true },
    alternates: { canonical: '/szukaj' },
  };
}

// ============================================
// Fetch wszystkie active products (single query, full scan)
// ============================================
async function fetchAllActiveProducts(): Promise<ProductRow[]> {
  const { data, error } = await supabaseServer
    .from('products')
    .select(SELECT_FIELDS)
    .eq('active', true)
    .limit(SCAN_LIMIT);

  if (error) {
    console.error('[fetchAllActiveProducts]', error);
    return [];
  }
  return (data || []) as ProductRow[];
}

// ============================================
// "Did you mean?" — gdy multi-word zwraca zero,
// sprawdź każde słowo osobno, zwróć te z wynikami
// ============================================
function buildSuggestions(
  allProducts: ProductRow[],
  words: string[],
): Array<{ query: string; count: number }> {
  if (words.length < 2) return [];
  const results = words.map((word) => ({
    query: word,
    count: allProducts.filter((p) => productMatchesWord(p, word)).length,
  }));
  return results
    .filter((r) => r.count > 0)
    .sort((a, b) => b.count - a.count);
}

// ============================================
// Page component
// ============================================
export default async function SearchPage({
  searchParams,
}: {
  searchParams: SearchParamsPromise;
}) {
  const params = await searchParams;
  const q = (params.q || '').trim();
  const selectedBrands = (params.brand || '').split(',').filter(Boolean);
  const selectedColors = (params.color || '').split(',').filter(Boolean);
  const page = Math.max(1, parseInt(params.page || '1', 10) || 1);

  const words = q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  // Single fetch — pełna lista active products
  const allActive = q ? await fetchAllActiveProducts() : [];

  // STRICT AND match — każde słowo musi pasować
  const allMatches =
    q && words.length > 0
      ? allActive.filter((p) => words.every((w) => productMatchesWord(p, w)))
      : [];

  // "Did you mean?" gdy multi-word zwraca zero
  const suggestions =
    q && allMatches.length === 0 && words.length > 1
      ? buildSuggestions(allActive, words)
      : [];

  // Smart aggregations
  const colorFiltered =
    selectedColors.length === 0
      ? allMatches
      : allMatches.filter((p) => {
          const cs = Array.isArray(p.colors) ? p.colors : [];
          return cs.some(
            (c) => c.name && selectedColors.includes(c.name),
          );
        });

  const brandFiltered =
    selectedBrands.length === 0
      ? allMatches
      : allMatches.filter((p) => selectedBrands.includes(p.brand_name));

  const brandCountsMap: Record<string, number> = {};
  for (const p of colorFiltered) {
    if (p.brand_name) {
      brandCountsMap[p.brand_name] = (brandCountsMap[p.brand_name] || 0) + 1;
    }
  }

  const colorCountsMap: Record<string, { hex: string; count: number }> = {};
  for (const p of brandFiltered) {
    const cs = Array.isArray(p.colors) ? p.colors : [];
    for (const c of cs) {
      if (!c.name) continue;
      if (!colorCountsMap[c.name]) {
        colorCountsMap[c.name] = { hex: c.hex || '#cccccc', count: 0 };
      }
      colorCountsMap[c.name].count++;
    }
  }

  const brandsWithCounts = Object.entries(brandCountsMap)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  const colorsWithCounts = Object.entries(colorCountsMap)
    .map(([name, { hex, count }]) => ({ name, hex, count }))
    .sort((a, b) => a.name.localeCompare(b.name, 'pl'));

  // Apply WSZYSTKIE filtry
  const finalFiltered = allMatches.filter((p) => {
    const brandOk =
      selectedBrands.length === 0 || selectedBrands.includes(p.brand_name);
    const cs = Array.isArray(p.colors) ? p.colors : [];
    const colorOk =
      selectedColors.length === 0 ||
      cs.some((c) => c.name && selectedColors.includes(c.name));
    return brandOk && colorOk;
  });

  // Paginacja
  const totalCount = finalFiltered.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const pageProducts = finalFiltered.slice(start, start + PAGE_SIZE);

  return (
    <main className={styles['subcategory-page']}>
      <div className="subcategory-spacer"></div>
      <SearchClient
        query={q}
        brandsWithCounts={brandsWithCounts}
        colorsWithCounts={colorsWithCounts}
        selectedBrands={selectedBrands}
        selectedColors={selectedColors}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        products={pageProducts as any[]}
        totalCount={totalCount}
        currentPage={safePage}
        totalPages={totalPages}
        suggestions={suggestions}
      />
    </main>
  );
}
