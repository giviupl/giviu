// src/lib/search/productSearch.ts
// ============================================
// Giviu — uniwersalny silnik wyszukiwania produktów
// Reusable: admin (kreator oferty, lista produktów) + front giviu.pl (katalog)
// ============================================
// Wymaga: migracja 007_pg_trgm_search.sql (pg_trgm + GIN indexes)
// ============================================

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Product } from '@/types';

// ============================================
// Typy
// ============================================

export interface SearchFilters {
  /** ID marek - jeśli pusty/undefined, bez filtra */
  brandIds?: string[];
  /** Slugi kategorii - jeśli pusty/undefined, bez filtra */
  categorySlugs?: string[];
  /** Slugi podkategorii - jeśli pusty/undefined, bez filtra */
  subcategorySlugs?: string[];
  /** Tylko aktywne produkty (domyślnie true) */
  onlyActive?: boolean;
  /** Tylko featured_recommendation = true */
  onlyFeatured?: boolean;
  /** Tylko is_new = true */
  onlyNew?: boolean;
  /** Minimalne MOQ (np. >= 50) */
  minMoq?: number;
  /** Maksymalne MOQ (np. <= 100) */
  maxMoq?: number;
}

export interface SearchOptions {
  /** Tekst do wyszukania - po name, brand_name, code, description */
  query?: string;
  /** Filtry strukturalne */
  filters?: SearchFilters;
  /** Limit wyników (domyślnie 50, max 500) */
  limit?: number;
  /** Offset paginacji (domyślnie 0) */
  offset?: number;
  /** Sortowanie - domyślnie 'name_asc' */
  sort?: 'name_asc' | 'name_desc' | 'newest' | 'brand_asc';
  /** Konkretne kolumny do pobrania (domyślnie '*'). Dla autocomplete można ograniczyć. */
  select?: string;
}

export interface SearchResult<T = Product> {
  products: T[];
  /** Całkowita liczba pasujących produktów (przed limit/offset) */
  totalCount: number;
  /** Czy są kolejne strony */
  hasMore: boolean;
  /** Czas wykonania query w ms (debugging/telemetry) */
  durationMs: number;
}

// ============================================
// Główna funkcja wyszukiwania
// ============================================

/**
 * Wyszukuje produkty z filtrami i fuzzy matchingiem (ILIKE + pg_trgm).
 *
 * Przykład użycia (admin):
 * ```ts
 * import { supabaseServer } from '@/lib/supabase-server';
 * import { searchProducts } from '@/lib/search/productSearch';
 *
 * const result = await searchProducts(supabaseServer, {
 *   query: 'kubek',
 *   filters: { brandIds: ['uuid-1'], onlyActive: true },
 *   limit: 20,
 * });
 * console.log(result.products);
 * ```
 *
 * @param client - instancja Supabase (server lub client - DI dla reusability)
 * @param options - parametry wyszukiwania
 */
export async function searchProducts<T = Product>(
  client: SupabaseClient,
  options: SearchOptions = {}
): Promise<SearchResult<T>> {
  const startedAt = Date.now();

  const {
    query = '',
    filters = {},
    limit = 50,
    offset = 0,
    sort = 'name_asc',
    select = '*',
  } = options;

  const safeLimit = Math.min(Math.max(limit, 1), 500);
  const safeOffset = Math.max(offset, 0);

  let q = client.from('products').select(select, { count: 'exact' });

  // --- Filtry strukturalne ---
  const onlyActive = filters.onlyActive !== false; // domyślnie true
  if (onlyActive) {
    q = q.eq('active', true);
  }

  if (filters.brandIds && filters.brandIds.length > 0) {
    q = q.in('brand_id', filters.brandIds);
  }

  if (filters.categorySlugs && filters.categorySlugs.length > 0) {
    q = q.in('category_slug', filters.categorySlugs);
  }

  if (filters.subcategorySlugs && filters.subcategorySlugs.length > 0) {
    q = q.in('subcategory_slug', filters.subcategorySlugs);
  }

  if (filters.onlyFeatured) {
    q = q.eq('featured_recommendation', true);
  }

  if (filters.onlyNew) {
    q = q.eq('is_new', true);
  }

  if (typeof filters.minMoq === 'number') {
    q = q.gte('moq', filters.minMoq);
  }

  if (typeof filters.maxMoq === 'number') {
    q = q.lte('moq', filters.maxMoq);
  }

  // --- Wyszukiwanie tekstowe (multi-column ILIKE z trgm indexes) ---
  const trimmed = query.trim();
  if (trimmed.length > 0) {
    const safe = escapeForOr(trimmed);
    q = q.or(
      `name.ilike.%${safe}%,brand_name.ilike.%${safe}%,code.ilike.%${safe}%,description.ilike.%${safe}%`
    );
  }

  // --- Sortowanie ---
  switch (sort) {
    case 'name_desc':
      q = q.order('name', { ascending: false });
      break;
    case 'newest':
      q = q.order('created_at', { ascending: false, nullsFirst: false });
      break;
    case 'brand_asc':
      q = q.order('brand_name', { ascending: true }).order('name', { ascending: true });
      break;
    case 'name_asc':
    default:
      q = q.order('name', { ascending: true });
      break;
  }

  // --- Paginacja ---
  q = q.range(safeOffset, safeOffset + safeLimit - 1);

  const { data, error, count } = await q;

  if (error) {
    throw new Error(`searchProducts: ${error.message}`);
  }

  const products = (data || []) as T[];
  const totalCount = count ?? products.length;
  const durationMs = Date.now() - startedAt;

  return {
    products,
    totalCount,
    hasMore: safeOffset + products.length < totalCount,
    durationMs,
  };
}

// ============================================
// Helper: szybkie wyszukiwanie do autocomplete
// ============================================

/**
 * Wygodny helper dla ProductSearch w kreatorze oferty.
 * Zwraca minimalny subset pól potrzebny do autocomplete.
 */
export async function quickSearchProducts(
  client: SupabaseClient,
  query: string,
  limit = 15
) {
  const result = await searchProducts<{
    id: string;
    name: string;
    brand_name: string;
    code: string | null;
    description: string | null;
    image_url: string | null;
    colors: unknown;
    price: string | null;
    moq: number | null;
  }>(client, {
    query,
    filters: { onlyActive: true },
    limit,
    select: 'id, name, brand_name, code, description, image_url, colors, price, moq',
  });

  return result.products;
}

// ============================================
// Helpery wewnętrzne
// ============================================

/**
 * Escape znaków zarezerwowanych w PostgREST `.or()` filtrach.
 * Przecinek rozdziela filtry, nawiasy są strukturalne.
 */
function escapeForOr(input: string): string {
  return input
    .replace(/[,()]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
