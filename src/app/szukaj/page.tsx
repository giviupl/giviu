import type { Metadata } from 'next';
import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import SearchClient from './SearchClient';
import styles from '@/styles/CategoryPages.module.css';

// ============================================
// /szukaj — server-side search page
// URL: /szukaj?q=czarny+kubek&brand=stanley,camelbak&color=Czarny&page=2
//
// Architektura:
// - URL state = source of truth (shareable, back button)
// - Fetch wszystkich matchów (limit 1000) raz, agregacje + paginacja in-memory
// - Smart counts: brand counts uwzględniają color filter, color counts uwzględniają brand filter
// - meta robots: noindex, follow (standard dla internal search)
// ============================================

const PAGE_SIZE = 24;
const MATCH_LIMIT = 1000;

const SELECT_FIELDS =
  'id, slug, name, brand_name, brand_id, code, price, category, category_slug, subcategory, subcategory_slug, description, colors, views, emoji, is_new, image_url';

interface ProductColor {
  name: string;
  hex: string;
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
      ? `Wyniki wyszukiwania dla „${trimmed}" w katalogu Giviu — prezenty firmowe premium z personalizacją.`
      : 'Wyszukiwanie produktów w katalogu Giviu — prezenty firmowe premium.',
    robots: { index: false, follow: true }, // noindex, follow — best practice dla internal search
    alternates: { canonical: '/szukaj' },
  };
}

// ============================================
// Fetch produktów matchujących query
// Multi-word: per-word ILIKE (6 pól) + intersect in-memory
// 6 pól: name, brand_name, code, description, category, subcategory
// + in-memory: colors[].name
// ============================================
async function fetchMatchingProducts(query: string): Promise<ProductRow[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const words = q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2);
  if (words.length === 0) return [];

  // Helper: ILIKE search po 6 polach dla jednego słowa
  const fetchForWord = async (word: string): Promise<ProductRow[]> => {
    const w = word.replace(/[%_,()]/g, ' ').trim();
    if (!w) return [];

    const { data, error } = await supabaseServer
      .from('products')
      .select(SELECT_FIELDS)
      .eq('active', true)
      .or(
        `name.ilike.%${w}%,brand_name.ilike.%${w}%,description.ilike.%${w}%,code.ilike.%${w}%,category.ilike.%${w}%,subcategory.ilike.%${w}%`,
      )
      .limit(MATCH_LIMIT);

    if (error) {
      console.error('[fetchMatchingProducts]', word, error);
      return [];
    }
    return (data || []) as ProductRow[];
  };

  // 1 słowo — szybka ścieżka
  if (words.length === 1) {
    const single = await fetchForWord(words[0]);
    // In-memory dopasowanie po colors[].name (na wypadek gdyby user szukał koloru)
    const w = words[0];
    if (single.length > 0) return single;
    // Jeśli żaden produkt nie złapał — może użytkownik szuka koloru?
    // Fetch wszystkie active, filtruj po colors[].name (ostatnia deska ratunku)
    const { data: byColor } = await supabaseServer
      .from('products')
      .select(SELECT_FIELDS)
      .eq('active', true)
      .limit(MATCH_LIMIT);
    return (byColor || []).filter((p) => {
      const cs = Array.isArray(p.colors) ? (p.colors as ProductColor[]) : [];
      return cs.some((c) => (c.name ?? '').toLowerCase().includes(w));
    }) as ProductRow[];
  }

  // Wiele słów — fetch równolegle, union, intersect in-memory
  const perWord = await Promise.all(words.map(fetchForWord));

  const all = new Map<string, ProductRow>();
  for (const result of perWord) {
    for (const p of result) {
      if (!all.has(p.id)) all.set(p.id, p);
    }
  }

  const matchesWord = (p: ProductRow, w: string): boolean => {
    const text =
      `${p.name} ${p.brand_name} ${p.code ?? ''} ${p.description ?? ''} ${p.category ?? ''} ${p.subcategory ?? ''}`.toLowerCase();
    if (text.includes(w)) return true;
    const cs = Array.isArray(p.colors) ? p.colors : [];
    return cs.some((c) => (c.name ?? '').toLowerCase().includes(w));
  };

  const strict = Array.from(all.values()).filter((p) =>
    words.every((w) => matchesWord(p, w)),
  );

  // Soft fallback gdy strict pusty
  if (strict.length === 0) {
    return Array.from(all.values())
      .map((p) => ({
        product: p,
        matchCount: words.filter((w) => matchesWord(p, w)).length,
      }))
      .filter((x) => x.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount)
      .map((x) => x.product);
  }

  return strict;
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

  // Fetch all matches (raz, in-memory dalej)
  const allMatches = q ? await fetchMatchingProducts(q) : [];

  // Smart aggregations:
  // - brandCounts agreguje po color-filtered set (żeby pokazać dostępne marki dla wybranych kolorów)
  // - colorCounts agreguje po brand-filtered set (analogicznie)
  const colorFiltered =
    selectedColors.length === 0
      ? allMatches
      : allMatches.filter((p) => {
          const cs = Array.isArray(p.colors) ? p.colors : [];
          return cs.some((c) => selectedColors.includes(c.name));
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

  // Apply WSZYSTKIE filtry (brand AND color)
  const finalFiltered = allMatches.filter((p) => {
    const brandOk =
      selectedBrands.length === 0 || selectedBrands.includes(p.brand_name);
    const cs = Array.isArray(p.colors) ? p.colors : [];
    const colorOk =
      selectedColors.length === 0 ||
      cs.some((c) => selectedColors.includes(c.name));
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
      />
    </main>
  );
}
