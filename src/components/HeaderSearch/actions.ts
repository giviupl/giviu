'use server';

import { supabaseServer } from '@/lib/supabase-server';

// ============================================
// HeaderSearch — własna implementacja (bypass searchProducts)
// Rozszerza zakres search o category + subcategory + in-memory colors filter
// Nie wymaga modyfikacji productSearch.ts (admin używa starej wersji)
// ============================================

const SELECT_FIELDS =
  'id, slug, name, brand_name, image_url, price, category, category_slug, subcategory, code, description, colors';

const MAX_RESULTS = 8;
const PER_WORD_LIMIT = 80;

interface ProductRow {
  id: string;
  slug: string;
  name: string;
  brand_name: string;
  image_url: string | null;
  price: string | null;
  category: string | null;
  category_slug: string | null;
  subcategory: string | null;
  code: string | null;
  description: string | null;
  colors: unknown;
}

export interface HeaderSearchResult {
  id: string;
  slug: string;
  name: string;
  brand_name: string;
  thumb: string | null;
  price: string | null;
  category_slug: string | null;
}

// ============================================
// Util: czy produkt matchuje słowo
// (sprawdza wszystkie tekstowe pola + nazwy kolorów)
// ============================================
function productMatchesWord(p: ProductRow, word: string): boolean {
  const w = word.toLowerCase();
  const textBlob =
    `${p.name} ${p.brand_name} ${p.code ?? ''} ${p.description ?? ''} ${p.category ?? ''} ${p.subcategory ?? ''}`.toLowerCase();
  if (textBlob.includes(w)) return true;

  const colorsArr = Array.isArray(p.colors)
    ? (p.colors as Array<{ name?: string }>)
    : [];
  return colorsArr.some((c) => (c.name ?? '').toLowerCase().includes(w));
}

function toResult(p: ProductRow): HeaderSearchResult {
  const colorsArr = Array.isArray(p.colors)
    ? (p.colors as Array<{ images?: string[] }>)
    : [];
  const firstColorImage = colorsArr[0]?.images?.[0] || null;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    brand_name: p.brand_name,
    thumb: p.image_url || firstColorImage,
    price: p.price,
    category_slug: p.category_slug,
  };
}

// ============================================
// Pre-fetch produktów pasujących do JEDNEGO słowa
// Po: name, brand_name, code, description, category, subcategory
// (colors nie da się prosto w ILIKE bo JSONB — filtrujemy in-memory później)
// ============================================
async function fetchProductsForWord(word: string): Promise<ProductRow[]> {
  const w = word.replace(/[%_,()]/g, ' ').trim();
  if (!w) return [];

  const { data, error } = await supabaseServer
    .from('products')
    .select(SELECT_FIELDS)
    .eq('active', true)
    .or(
      `name.ilike.%${w}%,brand_name.ilike.%${w}%,description.ilike.%${w}%,code.ilike.%${w}%,category.ilike.%${w}%,subcategory.ilike.%${w}%`,
    )
    .limit(PER_WORD_LIMIT);

  if (error) {
    console.error('[fetchProductsForWord]', word, error);
    return [];
  }
  return (data || []) as ProductRow[];
}

// ============================================
// Search produktów dla autocomplete w headerze giviu.pl
// ============================================
export async function searchHeaderProductsAction(
  query: string,
): Promise<HeaderSearchResult[]> {
  const q = query.trim();
  if (q.length < 2) return [];

  const words = q
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length >= 2);

  if (words.length === 0) return [];

  try {
    // Pre-fetch dla każdego słowa równolegle
    const perWordResults = await Promise.all(words.map(fetchProductsForWord));

    // Union produktów (po id)
    const allProducts = new Map<string, ProductRow>();
    for (const result of perWordResults) {
      for (const p of result) {
        if (!allProducts.has(p.id)) allProducts.set(p.id, p);
      }
    }

    if (allProducts.size === 0) return [];

    // 1 słowo: zwróć wszystko (limit 8)
    if (words.length === 1) {
      return Array.from(allProducts.values())
        .slice(0, MAX_RESULTS)
        .map(toResult);
    }

    // Wiele słów: każdy produkt musi matchować WSZYSTKIE słowa
    // (w name/brand/code/description/category/subcategory/colors[].name)
    const strict: ProductRow[] = [];
    for (const p of allProducts.values()) {
      const allMatch = words.every((w) => productMatchesWord(p, w));
      if (allMatch) strict.push(p);
    }

    if (strict.length > 0) {
      return strict.slice(0, MAX_RESULTS).map(toResult);
    }

    // Soft fallback: sortuj po liczbie matchowanych słów
    const soft = Array.from(allProducts.values())
      .map((p) => ({
        product: p,
        matchCount: words.filter((w) => productMatchesWord(p, w)).length,
      }))
      .filter((x) => x.matchCount > 0)
      .sort((a, b) => b.matchCount - a.matchCount);

    return soft.slice(0, MAX_RESULTS).map((x) => toResult(x.product));
  } catch (err) {
    console.error('[searchHeaderProductsAction]', err);
    return [];
  }
}
