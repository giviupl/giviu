'use server';

// ============================================
// SERVER ACTION dla formularza wyceny na /wycena/dane
// ============================================
// Jeśli już masz własny handler — porównaj i zostaw swój.
// To jest REFERENCJA którą admin będzie czytał.
// ============================================
import { supabaseServer } from '@/lib/supabase-server';

interface QuoteItemPayload {
  productId: string;
  colorName?: string | null;
  colorHex?: string | null;
  quantities: string[]; // wpisane przez klienta jako tekst
}

interface SubmitInquiryParams {
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  email: string;
  nip?: string;
  addressStreet?: string;
  addressCity?: string;
  addressPostalCode?: string;
  notes?: string;
  attachedLogoUrl?: string; // upload osobno do Supabase Storage, tu tylko URL
  items: QuoteItemPayload[];
}

export async function submitInquiryAction(params: SubmitInquiryParams) {
  // Walidacja minimalna
  if (!params.firstName.trim() || !params.lastName.trim()) {
    return { ok: false, error: 'Imię i nazwisko są wymagane' };
  }
  if (!params.company.trim()) {
    return { ok: false, error: 'Nazwa firmy jest wymagana' };
  }
  if (!params.email.trim() || !params.email.includes('@')) {
    return { ok: false, error: 'Prawidłowy email jest wymagany' };
  }
  if (!params.phone.trim()) {
    return { ok: false, error: 'Telefon jest wymagany' };
  }
  if (params.items.length === 0) {
    return { ok: false, error: 'Zapytanie musi zawierać co najmniej 1 produkt' };
  }

  const supabase = supabaseServer;

  // Insert inquiry
  const { data: inquiry, error: inquiryErr } = await supabase
    .from('inquiries')
    .insert({
      company_name: params.company.trim(),
      contact_person: `${params.firstName.trim()} ${params.lastName.trim()}`,
      email: params.email.trim(),
      phone: params.phone.trim(),
      nip: params.nip?.trim() || null,
      address_street: params.addressStreet?.trim() || null,
      address_city: params.addressCity?.trim() || null,
      address_postal_code: params.addressPostalCode?.trim() || null,
      notes: params.notes?.trim() || null,
      attached_logo_url: params.attachedLogoUrl || null,
      status: 'new',
    })
    .select('id')
    .single();

  if (inquiryErr || !inquiry) {
    return {
      ok: false,
      error: `Nie udało się zapisać zapytania: ${inquiryErr?.message}`,
    };
  }

  // Insert pozycji — quantities zostają jako string[] w jsonb
  const itemsPayload = params.items.map((item) => ({
    inquiry_id: inquiry.id,
    product_id: item.productId,
    color_name: item.colorName || null,
    color_hex: item.colorHex || null,
    quantities: item.quantities, // jsonb array of strings (klient wpisywał tekst)
  }));

  const { error: itemsErr } = await supabase.from('inquiry_items').insert(itemsPayload);

  if (itemsErr) {
    // Rollback inquiry — żeby nie zostawić "pustego" rekordu
    await supabase.from('inquiries').delete().eq('id', inquiry.id);
    return {
      ok: false,
      error: `Nie udało się zapisać pozycji: ${itemsErr.message}`,
    };
  }

  return { ok: true, inquiryId: inquiry.id };
}
