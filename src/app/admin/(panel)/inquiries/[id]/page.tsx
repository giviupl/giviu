import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import InquiryView from './InquiryView';
import styles from '../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function InquiryDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const [{ data: inquiry }, { data: items }] = await Promise.all([
    supabase.from('inquiries').select('*').eq('id', id).single(),
    supabase
      .from('inquiry_items')
      .select(
        `
        id, product_id, color_name, color_hex, quantities, created_at,
        products(id, name, brand_name, code, image_url, slug)
      `,
      )
      .eq('inquiry_id', id),
  ]);

  if (!inquiry) notFound();

  // Jeśli zapytanie ma client_id — pobierz dane klienta dla wyświetlenia
  let linkedClient: { id: string; company_name: string | null; contact_person: string } | null =
    null;
  if (inquiry.client_id) {
    const { data } = await supabase
      .from('clients')
      .select('id, company_name, contact_person')
      .eq('id', inquiry.client_id)
      .single();
    linkedClient = data;
  }

  // Supabase z .select('*, products(...)') zwraca products jako tablicę,
  // bo TS infer myśli "many", ale relacja FK jest 1:1.
  // Spłaszczamy products: [{...}] → products: {...}
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const normalizedItems = ((items || []) as any[]).map((item) => ({
    ...item,
    products: Array.isArray(item.products) ? item.products[0] : item.products,
  }));

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link
            href="/admin/inquiries"
            style={{
              color: 'var(--color-muted)',
              fontSize: 'var(--font-size-small)',
              textDecoration: 'none',
            }}
          >
            ← Wszystkie zapytania
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            Zapytanie od {inquiry.company_name || inquiry.contact_person}
          </h1>
        </div>
      </header>

      <InquiryView inquiry={inquiry} items={normalizedItems} linkedClient={linkedClient} />
    </>
  );
}