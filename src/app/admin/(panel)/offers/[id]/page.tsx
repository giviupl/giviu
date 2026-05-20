import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import styles from '../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OfferEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const { data: offer } = await supabase
    .from('offers')
    .select('*, offer_items(*)')
    .eq('id', id)
    .single();

  if (!offer) notFound();

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link href="/admin/offers" style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-small)', textDecoration: 'none' }}>
            ← Wszystkie oferty
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            {offer.offer_number}
          </h1>
        </div>
      </header>

      <div
        style={{
          background: 'var(--color-white)',
          border: '1px dashed var(--color-border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-3xl)',
          textAlign: 'center',
          color: 'var(--color-muted)',
        }}
      >
        <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 8 }}>🚧 Kreator oferty</p>
        <p>Tura 2 — buduję dane klienta, pozycje produktów i kalkulator.</p>
        <p style={{ fontSize: 'var(--font-size-small)', marginTop: 16 }}>
          ID: <code>{offer.id}</code> · Status: <code>{offer.status}</code> · Pozycji:{' '}
          <code>{(offer.offer_items as unknown[])?.length ?? 0}</code>
        </p>
      </div>
    </>
  );
}
