import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import styles from '../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function ClientEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const { data: client } = await supabase.from('clients').select('*').eq('id', id).single();
  if (!client) notFound();

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link
            href="/admin/clients"
            style={{ color: 'var(--color-muted)', fontSize: 'var(--font-size-small)', textDecoration: 'none' }}
          >
            ← Wszyscy klienci
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            {client.company_name || client.contact_person}
          </h1>
          {client.company_name && (
            <p style={{ color: 'var(--color-muted)', marginTop: 4 }}>{client.contact_person}</p>
          )}
        </div>
      </header>

      <div
        style={{
          background: 'var(--color-white)',
          border: '1px dashed var(--color-border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-3xl)',
          color: 'var(--color-muted)',
        }}
      >
        <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 8 }}>👤 Karta klienta</p>
        <p>Tura 2 zbuduje tutaj:</p>
        <ul style={{ marginTop: 12, lineHeight: 1.8 }}>
          <li>Edycja danych klienta (auto-save 1s)</li>
          <li>Lista kontaktów (HR, Marketing, Księgowość)</li>
          <li>Historia ofert i zamówień</li>
          <li>Timeline aktywności (telefony, emaile, spotkania)</li>
          <li>Notatki i zadania</li>
        </ul>
        <p style={{ fontSize: 'var(--font-size-small)', marginTop: 16 }}>
          ID: <code>{client.id}</code> · Email: <code>{client.email}</code>
        </p>
      </div>
    </>
  );
}
