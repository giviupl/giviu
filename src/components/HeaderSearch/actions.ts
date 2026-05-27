'use server';

import { supabaseServer } from '@/lib/supabase-server';

// ============================================
// HeaderSearch — autocomplete produktów dla giviu.pl
// Architektura: full scan active products + in-memory STRICT match
// (jeden query, JSONB colors[] uwzględniany od razu)
//
// STRICT matching: każde słowo musi pasować w którymkolwiek z 6 pól
// lub w colors[].name. Bez soft fallback.
//
// Future: gdy baza > 10k produktów, refactor na Postgres FTS z polish
// dictionary lub pgvector (Tura post-deploy).
// ============================================

const SELECT_FIELDS =
  'id, slug, name, brand_name, image_url, price, category, category_slug, subcategory, code, description, colors';

const MAX_RESULTS = 8;
const SCAN_LIMIT = 1000;

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
  image_url: string | null;
  price: string | null;
  category: string | null;
  category_slug: string | null;
  subcategory: string | null;
  code: string | null;
  description: string | null;
  colors: ProductColor[] | null;
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
// Match: czy produkt zawiera dane słowo w jednym z pól?
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

function toResult(p: ProductRow): HeaderSearchResult {
  const colorsArr = Array.isArray(p.colors) ? p.colors : [];
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
// Search produktów dla autocomplete w headerze
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
    const { data, error } = await supabaseServer
      .from('products')
      .select(SELECT_FIELDS)
      .eq('active', true)
      .limit(SCAN_LIMIT);

    if (error) {
      console.error('[searchHeaderProductsAction]', error);
      return [];
    }

    const products = (data || []) as ProductRow[];

    // STRICT AND matching — każde słowo musi pasować
    const matched = products.filter((p) =>
      words.every((w) => productMatchesWord(p, w)),
    );

    return matched.slice(0, MAX_RESULTS).map(toResult);
  } catch (err) {
    console.error('[searchHeaderProductsAction]', err);
    return [];
  }
}
