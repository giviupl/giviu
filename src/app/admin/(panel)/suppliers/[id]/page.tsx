import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import SupplierEditForm from './SupplierEditForm';
import styles from '../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function SupplierEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const { data: supplier } = await supabase
    .from('suppliers')
    .select('*')
    .eq('id', id)
    .single();

  if (!supplier) notFound();

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link
            href="/admin/suppliers"
            style={{
              color: 'var(--color-muted)',
              fontSize: 'var(--font-size-small)',
              textDecoration: 'none',
            }}
          >
            ← Wszyscy dostawcy
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            {supplier.short_name || supplier.name}
          </h1>
        </div>
      </header>

      <SupplierEditForm supplier={supplier} />
    </>
  );
}
