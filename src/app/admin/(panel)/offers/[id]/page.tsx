import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import OfferEditor from './OfferEditor';
import styles from '../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OfferEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const [{ data: offer }, { data: items }] = await Promise.all([
    supabase.from('offers').select('*').eq('id', id).single(),
    supabase
      .from('offer_items')
      .select('*')
      .eq('offer_id', id)
      .order('sort_order', { ascending: true }),
  ]);

  if (!offer) notFound();

  // Jeśli już wybrany klient, pobierz jego kontakty
  let contacts: Array<{
    id: string;
    name: string;
    position: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean | null;
  }> = [];
  if (offer.client_id) {
    const { data: c } = await supabase
      .from('client_contacts')
      .select('id, name, position, email, phone, is_primary')
      .eq('client_id', offer.client_id)
      .order('is_primary', { ascending: false });
    contacts = c || [];
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link
            href="/admin/offers"
            style={{
              color: 'var(--color-muted)',
              fontSize: 'var(--font-size-small)',
              textDecoration: 'none',
            }}
          >
            ← Wszystkie oferty
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            {offer.offer_number}
          </h1>
        </div>
      </header>

      <OfferEditor offer={offer} initialItems={items || []} initialContacts={contacts} />
    </>
  );
}
