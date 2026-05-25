'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

// ============================================
// CREATE SUPPLIER
// ============================================
export async function createSupplierAction(formData: FormData) {
  const name = formData.get('name')?.toString().trim();
  if (!name) throw new Error('Nazwa dostawcy jest wymagana');

  const supabase = supabaseServer;
  const { data: created, error } = await supabase
    .from('suppliers')
    .insert({ name, active: true })
    .select('id')
    .single();

  if (error || !created) {
    throw new Error(`Nie udało się utworzyć dostawcy: ${error?.message}`);
  }

  revalidatePath('/admin/suppliers');
  redirect(`/admin/suppliers/${created.id}`);
}

// ============================================
// CREATE SUPPLIER QUICK (z inline'a w karcie zamówienia / pod-pozycji)
// Zwraca {ok, supplier} zamiast redirect.
// ============================================
export async function createSupplierQuickAction(name: string) {
  const trimmed = name.trim();
  if (!trimmed) return { ok: false as const, error: 'Nazwa wymagana' };

  const supabase = supabaseServer;
  const { data: created, error } = await supabase
    .from('suppliers')
    .insert({ name: trimmed, short_name: trimmed, active: true })
    .select('id, name, short_name')
    .single();

  if (error || !created) {
    return { ok: false as const, error: error?.message || 'Błąd' };
  }

  revalidatePath('/admin/suppliers');
  return { ok: true as const, supplier: created };
}

// ============================================
// UPDATE SUPPLIER (auto-save z karty dostawcy)
// ============================================
export async function updateSupplierAction(
  supplierId: string,
  data: Record<string, string | number | boolean | null>,
) {
  const supabase = supabaseServer;
  const clean: Record<string, string | number | boolean | null> = {};
  for (const [k, v] of Object.entries(data)) {
    clean[k] = v === '' ? null : v;
  }

  const { error } = await supabase.from('suppliers').update(clean).eq('id', supplierId);
  if (error) return { ok: false, error: error.message };

  revalidatePath(`/admin/suppliers/${supplierId}`);
  revalidatePath('/admin/suppliers');
  return { ok: true };
}

// ============================================
// DELETE SUPPLIER
// ============================================
export async function deleteSupplierAction(formData: FormData) {
  const supplierId = formData.get('supplier_id')?.toString();
  if (!supplierId) throw new Error('Brak ID dostawcy');

  const supabase = supabaseServer;
  const { error } = await supabase.from('suppliers').delete().eq('id', supplierId);
  if (error) throw new Error(`Nie udało się usunąć dostawcy: ${error.message}`);

  revalidatePath('/admin/suppliers');
}

// ============================================
// LIST ALL ACTIVE SUPPLIERS (dla dropdownów w pod-pozycjach kosztowych)
// ============================================
export async function listSuppliersAction() {
  const supabase = supabaseServer;
  const { data } = await supabase
    .from('suppliers')
    .select('id, name, short_name')
    .eq('active', true)
    .order('name', { ascending: true });
  return data || [];
}
