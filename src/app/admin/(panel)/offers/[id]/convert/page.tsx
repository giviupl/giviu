import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import ConvertForm from './ConvertForm';
import styles from '../../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ConvertOfferPage({ params }: PageProps) {
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

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link
            href={`/admin/offers/${id}`}
            style={{
              color: 'var(--color-muted)',
              fontSize: 'var(--font-size-small)',
              textDecoration: 'none',
            }}
          >
            ← Powrót do oferty
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            Konwertuj ofertę {offer.offer_number} na zamówienie
          </h1>
        </div>
      </header>

      <ConvertForm offer={offer} items={items || []} />
    </>
  );
}
