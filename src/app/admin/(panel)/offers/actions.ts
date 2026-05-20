'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';

export async function createOfferAction(formData?: FormData) {
  const supabase = supabaseServer;

  const inquiryId = formData?.get('inquiry_id')?.toString();

  // Jeśli z zapytania, skopiuj dane klienta i pozycje
  let clientData: Record<string, string | null> = {};
  if (inquiryId) {
    const { data: inquiry } = await supabase
      .from('inquiries')
      .select('*')
      .eq('id', inquiryId)
      .single();
    if (inquiry) {
      clientData = {
        client_company: inquiry.company_name,
        client_person: inquiry.contact_person,
        client_email: inquiry.email,
        client_phone: inquiry.phone,
        client_nip: inquiry.nip,
      };
    }
  }

  const { data: offer, error } = await supabase
    .from('offers')
    .insert({
      inquiry_id: inquiryId || null,
      status: 'draft',
      ...clientData,
    })
    .select('id')
    .single();

  if (error || !offer) {
    throw new Error(`Nie udało się utworzyć oferty: ${error?.message}`);
  }

  // Jeśli z zapytania, skopiuj pozycje
  if (inquiryId) {
    const { data: items } = await supabase
      .from('inquiry_items')
      .select('*, products(*)')
      .eq('inquiry_id', inquiryId);

    if (items && items.length > 0) {
      const offerItems = items.flatMap((item) => {
        const product = item.products as { name?: string; brand_name?: string; description?: string; image_url?: string; code?: string } | null;
        const quantities = (item.quantities as number[]) || [];
        // Jeśli grup ilościowych jest kilka, twórz osobne pozycje
        const qtys = quantities.length > 0 ? quantities : [1];
        return qtys.map((qty, idx) => ({
          offer_id: offer.id,
          product_id: item.product_id,
          product_name: product?.name ?? 'Produkt',
          product_brand: product?.brand_name,
          product_description: product?.description,
          product_image_url: product?.image_url,
          product_color_name: item.color_name,
          product_color_hex: item.color_hex,
          product_code: product?.code,
          quantity: qty || 1,
          sort_order: idx,
        }));
      });

      if (offerItems.length > 0) {
        await supabase.from('offer_items').insert(offerItems);
      }
    }

    // Update inquiry status
    await supabase.from('inquiries').update({ status: 'in_progress' }).eq('id', inquiryId);
  }

  revalidatePath('/admin/offers');
  redirect(`/admin/offers/${offer.id}`);
}

export async function deleteOfferAction(formData: FormData) {
  const offerId = formData.get('offer_id')?.toString();
  if (!offerId) throw new Error('Brak ID oferty');

  const supabase = supabaseServer;
  const { error } = await supabase.from('offers').delete().eq('id', offerId);
  if (error) throw new Error(`Nie udało się usunąć oferty: ${error.message}`);

  revalidatePath('/admin/offers');
}
