'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

// ============================================
// COUNT NEW INQUIRIES (dla badge w sidebarze)
// ============================================
export async function countNewInquiriesAction() {
  const supabase = supabaseServer;
  const { count } = await supabase
    .from('inquiries')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'new');
  return count || 0;
}

// ============================================
// CHANGE INQUIRY STATUS — manualne
// ============================================
const ALLOWED_STATUSES = ['new', 'in_progress', 'quoted', 'rejected'];

export async function changeInquiryStatusAction(inquiryId: string, newStatus: string) {
  if (!ALLOWED_STATUSES.includes(newStatus)) {
    return { ok: false, error: 'Nieprawidłowy status' };
  }
  const supabase = supabaseServer;
  const { error } = await supabase
    .from('inquiries')
    .update({ status: newStatus })
    .eq('id', inquiryId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/inquiries');
  return { ok: true };
}

// ============================================
// UPDATE INQUIRY (notatki, dane kontaktowe — auto-save)
// ============================================
export async function updateInquiryAction(
  inquiryId: string,
  data: Record<string, string | null>,
) {
  const supabase = supabaseServer;
  const clean = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v]),
  );
  const { error } = await supabase.from('inquiries').update(clean).eq('id', inquiryId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { ok: true };
}

// ============================================
// LINK INQUIRY → EXISTING CLIENT
// ============================================
export async function linkInquiryToClientAction(inquiryId: string, clientId: string) {
  const supabase = supabaseServer;
  const { error } = await supabase
    .from('inquiries')
    .update({ client_id: clientId })
    .eq('id', inquiryId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  return { ok: true };
}

// ============================================
// CREATE CLIENT FROM INQUIRY DATA
// Tworzy klienta z danych zapytania, zapisuje client_id na zapytaniu,
// dodaje primary contact z imienia osoby kontaktowej + email + telefon.
// ============================================
export async function createClientFromInquiryAction(inquiryId: string) {
  const supabase = supabaseServer;

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single();

  if (!inquiry) return { ok: false, error: 'Zapytanie nie znalezione' };

  if (inquiry.client_id) {
    return { ok: false, error: 'Zapytanie jest już powiązane z klientem' };
  }

  // Walidacja duplikatu po NIP (jeśli jest)
  if (inquiry.nip && inquiry.nip.trim()) {
    const { data: existing } = await supabase
      .from('clients')
      .select('id, company_name')
      .eq('nip', inquiry.nip)
      .maybeSingle();

    if (existing) {
      // Link do istniejącego klienta zamiast tworzenia duplikatu
      await supabase
        .from('inquiries')
        .update({ client_id: existing.id })
        .eq('id', inquiryId);
      revalidatePath(`/admin/inquiries/${inquiryId}`);
      return {
        ok: true,
        existed: true,
        clientId: existing.id,
        clientName: existing.company_name,
      };
    }
  }

  // Stwórz nowego klienta
  const { data: client, error: clientErr } = await supabase
    .from('clients')
    .insert({
      company_name: inquiry.company_name,
      nip: inquiry.nip,
      contact_person: inquiry.contact_person,
      email: inquiry.email,
      phone: inquiry.phone,
      address_street: inquiry.address_street,
      address_city: inquiry.address_city,
      address_postal_code: inquiry.address_postal_code,
      notes: `Utworzony automatycznie z zapytania z ${new Date(inquiry.created_at).toLocaleDateString('pl-PL')}`,
    })
    .select('id')
    .single();

  if (clientErr || !client) {
    return { ok: false, error: `Nie udało się utworzyć klienta: ${clientErr?.message}` };
  }

  // Dodaj primary contact
  await supabase.from('client_contacts').insert({
    client_id: client.id,
    name: inquiry.contact_person,
    email: inquiry.email,
    phone: inquiry.phone,
    is_primary: true,
  });

  // Link zapytania do klienta
  await supabase
    .from('inquiries')
    .update({ client_id: client.id })
    .eq('id', inquiryId);

  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/clients');
  return { ok: true, existed: false, clientId: client.id };
}

// ============================================
// CONVERT INQUIRY → OFFER
// Tworzy ofertę z zapytania. Dla każdej pozycji z `quantities` array tworzy
// N osobnych offer_items (warianty cenowe), żeby UI ofert je zgrupował.
// ============================================
export async function convertInquiryToOfferAction(inquiryId: string) {
  const supabase = supabaseServer;

  const { data: inquiry } = await supabase
    .from('inquiries')
    .select('*')
    .eq('id', inquiryId)
    .single();

  if (!inquiry) return { ok: false, error: 'Zapytanie nie znalezione' };

  if (!inquiry.client_id) {
    return {
      ok: false,
      error: 'Powiąż zapytanie z klientem zanim utworzysz ofertę.',
    };
  }

  // Pobierz pozycje zapytania
  const { data: inquiryItems } = await supabase
    .from('inquiry_items')
    .select('*')
    .eq('inquiry_id', inquiryId);

  if (!inquiryItems || inquiryItems.length === 0) {
    return { ok: false, error: 'Zapytanie nie ma pozycji' };
  }

  // Numer oferty — najprostszy schemat OFR-YYYY-NNN (do refaktoru w przyszłości
  // przez DB trigger jak orders)
  const year = new Date().getFullYear();
  const { data: lastOffer } = await supabase
    .from('offers')
    .select('offer_number')
    .like('offer_number', `OFR-${year}-%`)
    .order('offer_number', { ascending: false })
    .limit(1)
    .maybeSingle();

  let nextNum = 1;
  if (lastOffer) {
    const match = lastOffer.offer_number.match(/OFR-\d{4}-(\d+)/);
    if (match) nextNum = parseInt(match[1]) + 1;
  }
  const offerNumber = `OFR-${year}-${String(nextNum).padStart(3, '0')}`;

  // Pobierz pełne dane klienta
  const { data: client } = await supabase
    .from('clients')
    .select('company_name, nip, contact_person, email, phone')
    .eq('id', inquiry.client_id)
    .single();

  // Utwórz ofertę
  const { data: offer, error: offerErr } = await supabase
    .from('offers')
    .insert({
      offer_number: offerNumber,
      inquiry_id: inquiry.id,
      client_id: inquiry.client_id,
      client_company: client?.company_name || inquiry.company_name,
      client_nip: client?.nip || inquiry.nip,
      client_person: client?.contact_person || inquiry.contact_person,
      client_email: client?.email || inquiry.email,
      client_phone: client?.phone || inquiry.phone,
      status: 'draft',
      notes: inquiry.notes,
    })
    .select('id')
    .single();

  if (offerErr || !offer) {
    return {
      ok: false,
      error: `Nie udało się utworzyć oferty: ${offerErr?.message}`,
    };
  }

  // Pobierz produkty z bazy żeby dograć name/brand/code/image_url do snapshotu
  const productIds = inquiryItems
    .map((it) => it.product_id)
    .filter((id): id is string => !!id);

  let productMap: Record<
    string,
    { name: string; brand_name: string; code: string | null; image_url: string | null; description: string | null }
  > = {};

  if (productIds.length > 0) {
    const { data: products } = await supabase
      .from('products')
      .select('id, name, brand_name, code, image_url, description')
      .in('id', productIds);

    if (products) {
      productMap = products.reduce<typeof productMap>((acc, p) => {
        acc[p.id] = {
          name: p.name,
          brand_name: p.brand_name,
          code: p.code,
          image_url: p.image_url,
          description: p.description,
        };
        return acc;
      }, {});
    }
  }

  // Rozwijamy quantities[] na N rekordów offer_items
  // Każdy wariant = osobny offer_item z tym samym product_id+color
  // (UI ofert zgrupuje je automatycznie po (product_id, color_name))
  let sortOrder = 0;
  const offerItemsPayload: Array<Record<string, unknown>> = [];

  for (const inqItem of inquiryItems) {
    const product = inqItem.product_id ? productMap[inqItem.product_id] : null;
    const quantities: unknown = inqItem.quantities;
    const qtyArray: number[] = Array.isArray(quantities)
      ? quantities
          .map((q) => (typeof q === 'string' ? parseInt(q) : Number(q)))
          .filter((n) => Number.isFinite(n) && n > 0)
      : [];

    // Jeśli nie ma żadnej ilości — wstaw 1 wariant z quantity=1 (klient nie wpisał)
    const finalQuantities = qtyArray.length > 0 ? qtyArray : [1];

    for (const qty of finalQuantities) {
      offerItemsPayload.push({
        offer_id: offer.id,
        product_id: inqItem.product_id,
        product_name: product?.name || 'Produkt z zapytania',
        product_brand: product?.brand_name || null,
        product_code: product?.code || null,
        product_image_url: product?.image_url || null,
        product_description: product?.description || null,
        product_color_name: inqItem.color_name,
        product_color_hex: inqItem.color_hex,
        quantity: qty,
        sort_order: sortOrder++,
      });
    }
  }

  if (offerItemsPayload.length > 0) {
    const { error: insertErr } = await supabase
      .from('offer_items')
      .insert(offerItemsPayload);

    if (insertErr) {
      // Rollback oferty
      await supabase.from('offers').delete().eq('id', offer.id);
      return { ok: false, error: `Nie udało się skopiować pozycji: ${insertErr.message}` };
    }
  }

  // Update zapytania: status quoted + link do oferty
  await supabase
    .from('inquiries')
    .update({ status: 'quoted', converted_offer_id: offer.id })
    .eq('id', inquiryId);

  revalidatePath('/admin/inquiries');
  revalidatePath(`/admin/inquiries/${inquiryId}`);
  revalidatePath('/admin/offers');

  return { ok: true, offerId: offer.id, offerNumber };
}

// ============================================
// DELETE INQUIRY
// ============================================
export async function deleteInquiryAction(formData: FormData) {
  const inquiryId = formData.get('inquiry_id')?.toString();
  if (!inquiryId) throw new Error('Brak ID zapytania');

  const supabase = supabaseServer;
  const { error } = await supabase.from('inquiries').delete().eq('id', inquiryId);
  if (error) throw new Error(`Nie udało się usunąć zapytania: ${error.message}`);

  revalidatePath('/admin/inquiries');
  redirect('/admin/inquiries');
}
