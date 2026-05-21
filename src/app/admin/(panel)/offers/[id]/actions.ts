'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';

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
// SEARCH PRODUCTS (dla ProductSearch)
// ============================================
export async function searchProductsAction(query: string) {
  const q = query.trim();
  if (!q) return [];

  const supabase = supabaseServer;
  const { data } = await supabase
    .from('products')
    .select(
      'id, name, brand_name, code, description, image_url, colors, price',
    )
    .or(`name.ilike.%${q}%,brand_name.ilike.%${q}%,code.ilike.%${q}%`)
    .eq('active', true)
    .limit(15);

  return data || [];
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
// UPDATE OFFER (auto-save oferty głównej)
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
// SET CLIENT (po wyborze z bazy → kopiuje dane do oferty)
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

  // Pobierz dane firmy
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

  // Sort_order = max(existing) + 1
  const { data: existing } = await supabase
    .from('offer_items')
    .select('sort_order')
    .eq('offer_id', offerId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing[0] ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { error } = await supabase.from('offer_items').insert({
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
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}

// ============================================
// UPDATE OFFER ITEM (auto-save pojedynczej pozycji)
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
// DELETE OFFER ITEM
// ============================================
export async function deleteOfferItemAction(itemId: string, offerId: string) {
  const supabase = supabaseServer;
  const { error } = await supabase.from('offer_items').delete().eq('id', itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/offers/${offerId}`);
  return { ok: true };
}
