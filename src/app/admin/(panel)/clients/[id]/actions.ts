'use server';

import { revalidatePath } from 'next/cache';
import { supabaseServer } from '@/lib/supabase-server';

// ============================================
// EDYCJA KLIENTA — auto-save
// ============================================
export async function updateClientAction(
  clientId: string,
  data: Record<string, string | null>,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = supabaseServer;

  // Sanitize - puste stringi → null
  const cleanData = Object.fromEntries(
    Object.entries(data).map(([k, v]) => [k, v === '' ? null : v]),
  );

  const { error } = await supabase.from('clients').update(cleanData).eq('id', clientId);
  if (error) {
    return { ok: false, error: error.message };
  }

  revalidatePath(`/admin/clients/${clientId}`);
  revalidatePath('/admin/clients');
  return { ok: true };
}

// ============================================
// CHECK NIP — przy tworzeniu nowego klienta
// ============================================
export async function checkNipAction(nip: string): Promise<{
  exists: boolean;
  client?: { id: string; company_name: string | null; contact_person: string };
}> {
  const cleanNip = nip.trim();
  if (!cleanNip) return { exists: false };

  const supabase = supabaseServer;
  const { data } = await supabase
    .from('clients')
    .select('id, company_name, contact_person')
    .eq('nip', cleanNip)
    .maybeSingle();

  if (data) {
    return { exists: true, client: data };
  }
  return { exists: false };
}

// ============================================
// KONTAKTY — CRUD
// ============================================
interface ContactData {
  name: string;
  position?: string;
  email?: string;
  phone?: string;
  is_primary?: boolean;
  notes?: string;
}

export async function addContactAction(
  clientId: string,
  data: ContactData,
): Promise<{ ok: boolean; error?: string }> {
  if (!data.name || !data.name.trim()) {
    return { ok: false, error: 'Imię i nazwisko są wymagane' };
  }

  const supabase = supabaseServer;

  // Jeśli ustawiamy jako primary, najpierw odznacz inne
  if (data.is_primary) {
    await supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', clientId);
  }

  const { error } = await supabase.from('client_contacts').insert({
    client_id: clientId,
    name: data.name.trim(),
    position: data.position?.trim() || null,
    email: data.email?.trim() || null,
    phone: data.phone?.trim() || null,
    is_primary: data.is_primary ?? false,
    notes: data.notes?.trim() || null,
  });

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true };
}

export async function updateContactAction(
  contactId: string,
  clientId: string,
  data: ContactData,
): Promise<{ ok: boolean; error?: string }> {
  if (!data.name || !data.name.trim()) {
    return { ok: false, error: 'Imię i nazwisko są wymagane' };
  }

  const supabase = supabaseServer;

  if (data.is_primary) {
    await supabase
      .from('client_contacts')
      .update({ is_primary: false })
      .eq('client_id', clientId)
      .neq('id', contactId);
  }

  const { error } = await supabase
    .from('client_contacts')
    .update({
      name: data.name.trim(),
      position: data.position?.trim() || null,
      email: data.email?.trim() || null,
      phone: data.phone?.trim() || null,
      is_primary: data.is_primary ?? false,
      notes: data.notes?.trim() || null,
    })
    .eq('id', contactId);

  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true };
}

export async function deleteContactAction(
  contactId: string,
  clientId: string,
): Promise<{ ok: boolean; error?: string }> {
  const supabase = supabaseServer;
  const { error } = await supabase.from('client_contacts').delete().eq('id', contactId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/clients/${clientId}`);
  return { ok: true };
}
