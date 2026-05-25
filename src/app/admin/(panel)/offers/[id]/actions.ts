'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';
import { searchProducts, type SearchFilters } from '@/lib/search/productSearch';

// ============================================
// SEARCH CLIENTS (dla ClientSelector)
// ============================================
export async function searchClientsAction(query: string) {
  const q = query.trim();
  if (!q) return [];

  const supabase = supabaseServer;
  const { data } = await supabase
    .from('clients')
    .select('id, company_name, nip, contact_person, email')
    .or(
      `company_name.ilike.%${q}%,contact_person.ilike.%${q}%,email.ilike.%${q}%,nip.ilike.%${q}%`,
    )
    .limit(10);

  return data || [];
}

// ============================================
// SEARCH PRODUCTS (dla ProductSearch w kreatorze oferty)
// ============================================
interface SearchProductsParams {
  query: string;
  brandId?: string;
  categorySlug?: string;
}

export async function searchProductsAction(params: SearchProductsParams | string) {
  const normalized: SearchProductsParams =
    typeof params === 'string' ? { query: params } : params;

  const q = normalized.query.trim();
  const hasFilters = !!(normalized.brandId || normalized.categorySlug);

  if (!q && !hasFilters) return [];

  const filters: SearchFilters = { onlyActive: true };
  if (normalized.brandId) filters.brandIds = [normalized.brandId];
  if (normalized.categorySlug) filters.categorySlugs = [normalized.categorySlug];

  try {
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
    }>(supabaseServer, {
      query: q,
      filters,
      limit: 30,
      select: 'id, name, brand_name, code, description, image_url, colors, price, moq',
    });
    return result.products;
  } catch (err) {
    console.error('[searchProductsAction]', err);
    return [];
  }
}

// ============================================
// GET BRANDS + CATEGORIES (dla dropdownów w ProductSearch)
// ============================================
export async function getBrandsAndCategoriesAction() {
  const supabase = supabaseServer;

  const [{ data: brands }, { data: categories }] = await Promise.all([
    supabase
      .from('brands')
      .select('id, name, slug')
      .eq('active', true)
      .order('name', { ascending: true }),
    supabase
      .from('categories')
      .select('slug, name')
      .eq('active', true)
      .order('name', { ascending: true }),
  ]);

  return {
    brands: brands || [],
    categories: categories || [],
  };
}

// ============================================
// GET CLIENT CONTACTS (dla dropdown osoby kontaktowej)
// ============================================
export async function getClientContactsAction(clientId: string) {
  const supabase = supabaseServer;
  const { data } = await supabase
    .from('client_contacts')
    .select('id, name, position, email, phone, is_primary')
    .eq('client_id', clientId)
    .order('is_primary', { ascending: false })
    .order('created_at', { ascending: true });

  return data || [];
}

// ============================================
// UPDATE OFFER
// ============================================
export async function updateOfferAction(
  offerId: string,
  data: Record<string, string | null>,
) {
  const supabase = supabaseServer;
  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v]),
  );

  const { error } = await supabase.from('offers').update(clean).eq('id', offerId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}

// ============================================
// SET CLIENT
// ============================================
interface SelectedContact {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export async function setOfferClientAction(
  offerId: string,
  clientId: string,
  contact: SelectedContact,
) {
  const supabase = supabaseServer;

  const { data: client } = await supabase
    .from('clients')
    .select('company_name, nip')
    .eq('id', clientId)
    .single();

  if (!client) return { ok: false, error: 'Klient nie znaleziony' };

  const { error } = await supabase
    .from('offers')
    .update({
      client_id: clientId,
      client_company: client.company_name,
      client_nip: client.nip,
      client_person: contact.name,
      client_email: contact.email || null,
      client_phone: contact.phone || null,
    })
    .eq('id', offerId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}

// ============================================
// ADD OFFER ITEM (z bazy lub manualnie)
// ============================================
interface NewItemData {
  product_id?: string | null;
  product_name: string;
  product_brand?: string;
  product_description?: string;
  product_image_url?: string;
  product_color_name?: string;
  product_color_hex?: string;
  product_code?: string;
  quantity?: number;
}

export async function addOfferItemAction(offerId: string, data: NewItemData) {
  const supabase = supabaseServer;

  const { data: existing } = await supabase
    .from('offer_items')
    .select('sort_order')
    .eq('offer_id', offerId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing[0] ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data: created, error } = await supabase
    .from('offer_items')
    .insert({
      offer_id: offerId,
      product_id: data.product_id || null,
      product_name: data.product_name,
      product_brand: data.product_brand || null,
      product_description: data.product_description || null,
      product_image_url: data.product_image_url || null,
      product_color_name: data.product_color_name || null,
      product_color_hex: data.product_color_hex || null,
      product_code: data.product_code || null,
      quantity: data.quantity || 1,
      sort_order: nextSort,
    })
    .select('*')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true, item: created };
}

// ============================================
// ADD OFFER VARIANT (B1)
// Duplikuje istniejącą pozycję jako nowy wariant cenowy.
// Klucz grupowania: (product_id, product_color_name) — wariant kopiuje
// te 2 pola + wszystkie pola produktu, ale quantity = 1 (user zmieni).
// Marża, koszty, VAT są kopiowane z source (user może edytować potem).
// ============================================
export async function addOfferVariantAction(sourceItemId: string) {
  const supabase = supabaseServer;

  // Pobierz source item
  const { data: source, error: sourceErr } = await supabase
    .from('offer_items')
    .select('*')
    .eq('id', sourceItemId)
    .single();

  if (sourceErr || !source) {
    return { ok: false, error: 'Pozycja źródłowa nie znaleziona' };
  }

  // Znajdź max sort_order w ramach oferty
  const { data: existing } = await supabase
    .from('offer_items')
    .select('sort_order')
    .eq('offer_id', source.offer_id)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing[0] ? (existing[0].sort_order ?? 0) + 1 : 0;

  // Insert kopia z domyślną quantity = 1 + nowy sort_order
  const { data: created, error } = await supabase
    .from('offer_items')
    .insert({
      offer_id: source.offer_id,
      product_id: source.product_id,
      product_name: source.product_name,
      product_brand: source.product_brand,
      product_description: source.product_description,
      product_image_url: source.product_image_url,
      product_color_name: source.product_color_name,
      product_color_hex: source.product_color_hex,
      product_code: source.product_code,
      quantity: 1,
      purchase_price: source.purchase_price,
      margin_percent: source.margin_percent,
      extra_costs_per_unit: source.extra_costs_per_unit,
      transport_cost_total: source.transport_cost_total,
      vat_rate: source.vat_rate,
      sort_order: nextSort,
    })
    .select('*')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${source.offer_id}`);
  return { ok: true, item: created };
}

// ============================================
// UPDATE OFFER ITEM
// ============================================
interface UpdateItemData {
  quantity?: number;
  purchase_price?: number;
  margin_percent?: number;
  extra_costs_per_unit?: number;
  transport_cost_total?: number;
  vat_rate?: number;
  product_name?: string;
  product_description?: string;
}

export async function updateOfferItemAction(itemId: string, data: UpdateItemData) {
  const supabase = supabaseServer;
  const { error, data: updated } = await supabase
    .from('offer_items')
    .update(data)
    .eq('id', itemId)
    .select('offer_id, unit_price, total_price, unit_price_gross, total_price_gross, profit_total')
    .single();

  if (error) return { ok: false, error: error.message };

  if (updated?.offer_id) revalidatePath(`/admin/offers/${updated.offer_id}`);
  return { ok: true, calculated: updated };
}

// ============================================
// DELETE OFFER ITEM (single)
// ============================================
export async function deleteOfferItemAction(itemId: string, offerId: string) {
  const supabase = supabaseServer;
  const { error } = await supabase.from('offer_items').delete().eq('id', itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}

// ============================================
// DELETE OFFER ITEMS (batch — przy usuwaniu całej grupy wariantów)
// ============================================
export async function deleteOfferItemsAction(itemIds: string[], offerId: string) {
  if (itemIds.length === 0) return { ok: true };

  const supabase = supabaseServer;
  const { error } = await supabase.from('offer_items').delete().in('id', itemIds);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}
