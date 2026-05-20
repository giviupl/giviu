'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

interface ClientFormData {
  company_name?: string;
  nip?: string;
  contact_person: string;
  email: string;
  phone?: string;
  address_street?: string;
  address_city?: string;
  address_postal_code?: string;
  address_country?: string;
  notes?: string;
}

export async function createClientAction(formData: FormData) {
  const data: ClientFormData = {
    company_name: formData.get('company_name')?.toString() || undefined,
    nip: formData.get('nip')?.toString() || undefined,
    contact_person: formData.get('contact_person')?.toString() || '',
    email: formData.get('email')?.toString() || '',
    phone: formData.get('phone')?.toString() || undefined,
    address_street: formData.get('address_street')?.toString() || undefined,
    address_city: formData.get('address_city')?.toString() || undefined,
    address_postal_code: formData.get('address_postal_code')?.toString() || undefined,
    notes: formData.get('notes')?.toString() || undefined,
  };

  if (!data.contact_person || !data.email) {
    return { error: 'Imię i nazwisko oraz email są wymagane' };
  }

  const supabase = supabaseServer;
  const { data: client, error } = await supabase
    .from('clients')
    .insert(data)
    .select('id')
    .single();

  if (error || !client) {
    return { error: error?.message || 'Nie udało się utworzyć klienta' };
  }

  revalidatePath('/admin/clients');
  redirect(`/admin/clients/${client.id}`);
}

export async function deleteClientAction(formData: FormData) {
  const clientId = formData.get('client_id')?.toString();
  if (!clientId) throw new Error('Brak ID klienta');

  const supabase = supabaseServer;
  const { error } = await supabase.from('clients').delete().eq('id', clientId);
  if (error) throw new Error(`Nie udało się usunąć klienta: ${error.message}`);

  revalidatePath('/admin/clients');
}
