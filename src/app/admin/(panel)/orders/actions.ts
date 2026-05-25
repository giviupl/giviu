'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

// ============================================
// CREATE EMPTY ORDER (z "+ Nowe zamówienie")
// ============================================
export async function createEmptyOrderAction() {
  const supabase = supabaseServer;

  const { data: created, error } = await supabase
    .from('orders')
    .insert({
      status: 'new',
      order_date: new Date().toISOString().slice(0, 10),
    })
    .select('id')
    .single();

  if (error || !created) {
    throw new Error(`Nie udało się utworzyć zamówienia: ${error?.message}`);
  }

  revalidatePath('/admin/orders');
  redirect(`/admin/orders/${created.id}`);
}

// ============================================
// CONVERT OFFER → ORDER
// B3: kopiuje product_image_url + product_description z oferty
//     + auto-tworzy 1 pod-pozycję kosztową typu 'product'
// ============================================
interface ConvertParams {
  offerId: string;
  includeItemIds: string[];
  productionDeadline?: string | null;
  deliveryDeadline?: string | null;
  itemOverrides?: Record<string, { quantity?: number; unit_price?: number }>;
}

export async function convertOfferToOrderAction(params: ConvertParams) {
  const supabase = supabaseServer;

  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .select('*')
    .eq('id', params.offerId)
    .single();

  if (offerErr || !offer) {
    return { ok: false, error: 'Oferta nie znaleziona' };
  }

  const { data: offerItems, error: itemsErr } = await supabase
    .from('offer_items')
    .select('*')
    .in('id', params.includeItemIds);

  if (itemsErr) {
    return { ok: false, error: `Błąd pobierania pozycji: ${itemsErr.message}` };
  }

  if (!offerItems || offerItems.length === 0) {
    return { ok: false, error: 'Nie wybrano żadnych pozycji' };
  }

  const { data: order, error: createErr } = await supabase
    .from('orders')
    .insert({
      offer_id: offer.id,
      client_id: offer.client_id,
      client_company: offer.client_company,
      client_person: offer.client_person,
      client_email: offer.client_email,
      client_phone: offer.client_phone,
      client_nip: offer.client_nip,
      status: 'new',
      order_date: new Date().toISOString().slice(0, 10),
      production_deadline: params.productionDeadline || null,
      delivery_deadline: params.deliveryDeadline || null,
      assigned_to: offer.assigned_to,
      notes: offer.notes,
    })
    .select('id, order_number')
    .single();

  if (createErr || !order) {
    return {
      ok: false,
      error: `Nie udało się utworzyć zamówienia: ${createErr?.message}`,
    };
  }

  // Snapshoty pozycji + zdjęć i opisów
  const orderItemsPayload = offerItems.map((it, idx) => {
    const override = params.itemOverrides?.[it.id] || {};
    return {
      order_id: order.id,
      product_id: it.product_id,
      product_name: it.product_name,
      product_brand: it.product_brand,
      product_code: it.product_code,
      product_color_name: it.product_color_name,
      product_color_hex: it.product_color_hex,
      product_image_url: it.product_image_url, // B3: kopiujemy zdjęcie
      product_description: it.product_description, // B3: i opis
      quantity: override.quantity ?? it.quantity,
      unit_price: override.unit_price ?? Number(it.unit_price || 0),
      purchase_price: Number(it.purchase_price || 0),
      extra_costs_per_unit: Number(it.extra_costs_per_unit || 0),
      transport_cost_total: Number(it.transport_cost_total || 0),
      vat_rate: Number(it.vat_rate || 23),
      sort_order: idx,
    };
  });

  const { data: createdItems, error: insertErr } = await supabase
    .from('order_items')
    .insert(orderItemsPayload)
    .select('id, purchase_price, quantity');

  if (insertErr || !createdItems) {
    await supabase.from('orders').delete().eq('id', order.id);
    return {
      ok: false,
      error: `Nie udało się skopiować pozycji: ${insertErr?.message}`,
    };
  }

  // B3: auto-tworzenie 1 pod-pozycji kosztowej typu 'product' per pozycja
  // (gdy purchase_price > 0 — żeby zysk od razu się liczył)
  const initialCosts = createdItems
    .filter((it) => Number(it.purchase_price || 0) > 0)
    .map((it, idx) => ({
      order_item_id: it.id,
      supplier_id: null,
      cost_type: 'product',
      description: 'Zakup produktu',
      quantity: it.quantity,
      unit_cost: Number(it.purchase_price),
      vat_rate: 23,
      sort_order: 0,
    }));

  if (initialCosts.length > 0) {
    await supabase.from('order_item_costs').insert(initialCosts);
  }

  await supabase.from('offers').update({ status: 'accepted' }).eq('id', offer.id);

  revalidatePath('/admin/orders');
  revalidatePath(`/admin/offers/${offer.id}`);

  return {
    ok: true,
    orderId: order.id,
    orderNumber: order.order_number,
  };
}

// ============================================
// UPDATE ORDER (auto-save)
// ============================================
export async function updateOrderAction(
  orderId: string,
  data: Record<string, string | null>,
) {
  const supabase = supabaseServer;
  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v]),
  );

  const { error } = await supabase.from('orders').update(clean).eq('id', orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { ok: true };
}

// ============================================
// CHANGE ORDER STATUS — B1: tylko 4 statusy
// ============================================
const ALLOWED_STATUSES = ['new', 'in_production', 'completed', 'cancelled'];

export async function changeOrderStatusAction(orderId: string, newStatus: string) {
  if (!ALLOWED_STATUSES.includes(newStatus)) {
    return { ok: false, error: 'Nieprawidłowy status' };
  }

  const supabase = supabaseServer;
  const updates: Record<string, string | null> = { status: newStatus };

  if (newStatus === 'completed') {
    const { data: existing } = await supabase
      .from('orders')
      .select('delivered_at')
      .eq('id', orderId)
      .single();

    if (existing && !existing.delivered_at) {
      updates.delivered_at = new Date().toISOString();
    }
  }

  const { error } = await supabase.from('orders').update(updates).eq('id', orderId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  revalidatePath('/admin/orders');
  return { ok: true };
}

// ============================================
// SET ORDER CLIENT
// ============================================
interface SelectedContact {
  name: string;
  email?: string | null;
  phone?: string | null;
}

export async function setOrderClientAction(
  orderId: string,
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
    .from('orders')
    .update({
      client_id: clientId,
      client_company: client.company_name,
      client_nip: client.nip,
      client_person: contact.name,
      client_email: contact.email || null,
      client_phone: contact.phone || null,
    })
    .eq('id', orderId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

// ============================================
// ADD ORDER ITEM
// B3: kopiuje też image_url i description (gdy dodajemy z bazy produktów)
// ============================================
interface NewOrderItemData {
  product_id?: string | null;
  product_name: string;
  product_brand?: string;
  product_code?: string;
  product_color_name?: string;
  product_color_hex?: string;
  product_image_url?: string;
  product_description?: string;
  quantity?: number;
}

export async function addOrderItemAction(orderId: string, data: NewOrderItemData) {
  const supabase = supabaseServer;

  const { data: existing } = await supabase
    .from('order_items')
    .select('sort_order')
    .eq('order_id', orderId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing[0] ? (existing[0].sort_order ?? 0) + 1 : 0;

  const { data: created, error } = await supabase
    .from('order_items')
    .insert({
      order_id: orderId,
      product_id: data.product_id || null,
      product_name: data.product_name,
      product_brand: data.product_brand || null,
      product_code: data.product_code || null,
      product_color_name: data.product_color_name || null,
      product_color_hex: data.product_color_hex || null,
      product_image_url: data.product_image_url || null,
      product_description: data.product_description || null,
      quantity: data.quantity || 1,
      sort_order: nextSort,
    })
    .select('*')
    .single();

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true, item: created };
}

// ============================================
// UPDATE ORDER ITEM
// ============================================
interface UpdateOrderItemData {
  quantity?: number;
  unit_price?: number;
  purchase_price?: number;
  extra_costs_per_unit?: number;
  transport_cost_total?: number;
  vat_rate?: number;
}

export async function updateOrderItemAction(itemId: string, data: UpdateOrderItemData) {
  const supabase = supabaseServer;
  const { error, data: updated } = await supabase
    .from('order_items')
    .update(data)
    .eq('id', itemId)
    .select('order_id, unit_price, total_price, unit_price_gross, total_price_gross')
    .single();

  if (error) return { ok: false, error: error.message };

  if (updated?.order_id) revalidatePath(`/admin/orders/${updated.order_id}`);
  return { ok: true, calculated: updated };
}

// ============================================
// DELETE ORDER ITEM
// ============================================
export async function deleteOrderItemAction(itemId: string, orderId: string) {
  const supabase = supabaseServer;
  const { error } = await supabase.from('order_items').delete().eq('id', itemId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}

// ============================================
// DELETE ORDER
// ============================================
export async function deleteOrderAction(formData: FormData) {
  const orderId = formData.get('order_id')?.toString();
  if (!orderId) throw new Error('Brak ID zamówienia');

  const supabase = supabaseServer;
  const { error } = await supabase.from('orders').delete().eq('id', orderId);
  if (error) throw new Error(`Nie udało się usunąć zamówienia: ${error.message}`);

  revalidatePath('/admin/orders');
  redirect('/admin/orders');
}

// ============================================
// ORDER ITEM COSTS (B3) — CRUD pod-pozycji kosztowych
// ============================================

// LIST kosztów per pozycja (do hydratacji w komponencie)
export async function listOrderItemCostsAction(orderItemId: string) {
  const supabase = supabaseServer;
  const { data, error } = await supabase
    .from('order_item_costs')
    .select('*')
    .eq('order_item_id', orderItemId)
    .order('sort_order', { ascending: true })
    .order('created_at', { ascending: true });

  if (error) return [];
  return data || [];
}

// ADD pod-pozycji
interface NewCostData {
  supplier_id?: string | null;
  cost_type?: string;
  description?: string;
  quantity?: number;
  unit_cost?: number;
  vat_rate?: number;
}

export async function addOrderItemCostAction(orderItemId: string, data: NewCostData) {
  const supabase = supabaseServer;

  // Sort order na końcu
  const { data: existing } = await supabase
    .from('order_item_costs')
    .select('sort_order')
    .eq('order_item_id', orderItemId)
    .order('sort_order', { ascending: false })
    .limit(1);

  const nextSort = existing && existing[0] ? (existing[0].sort_order ?? 0) + 1 : 0;

  // Pobierz order_id (do revalidatePath)
  const { data: itemRow } = await supabase
    .from('order_items')
    .select('order_id')
    .eq('id', orderItemId)
    .single();

  const { data: created, error } = await supabase
    .from('order_item_costs')
    .insert({
      order_item_id: orderItemId,
      supplier_id: data.supplier_id || null,
      cost_type: data.cost_type || 'other',
      description: data.description || '',
      quantity: data.quantity ?? 1,
      unit_cost: data.unit_cost ?? 0,
      vat_rate: data.vat_rate ?? 23,
      sort_order: nextSort,
    })
    .select('*')
    .single();

  if (error) return { ok: false, error: error.message };

  if (itemRow?.order_id) revalidatePath(`/admin/orders/${itemRow.order_id}`);
  return { ok: true, cost: created };
}

// UPDATE pod-pozycji
interface UpdateCostData {
  supplier_id?: string | null;
  cost_type?: string;
  description?: string;
  quantity?: number;
  unit_cost?: number;
  vat_rate?: number;
  ordered_at?: string | null;
  received_at?: string | null;
  invoice_number?: string | null;
}

export async function updateOrderItemCostAction(costId: string, data: UpdateCostData) {
  const supabase = supabaseServer;
  const clean: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(data)) {
    clean[k] = v === '' ? null : v;
  }

  const { data: updated, error } = await supabase
    .from('order_item_costs')
    .update(clean)
    .eq('id', costId)
    .select('id, total_net, total_gross, order_item_id')
    .single();

  if (error) return { ok: false, error: error.message };

  if (updated?.order_item_id) {
    const { data: itemRow } = await supabase
      .from('order_items')
      .select('order_id')
      .eq('id', updated.order_item_id)
      .single();
    if (itemRow?.order_id) revalidatePath(`/admin/orders/${itemRow.order_id}`);
  }

  return { ok: true, calculated: updated };
}

// DELETE pod-pozycji
export async function deleteOrderItemCostAction(costId: string, orderId: string) {
  const supabase = supabaseServer;
  const { error } = await supabase.from('order_item_costs').delete().eq('id', costId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/orders/${orderId}`);
  return { ok: true };
}
