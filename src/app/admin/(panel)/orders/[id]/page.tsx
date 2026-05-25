import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import OrderEditor from './OrderEditor';
import styles from '../../admin.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function OrderDetailPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const [{ data: order }, { data: items }, { data: suppliers }] = await Promise.all([
    supabase.from('orders').select('*').eq('id', id).single(),
    supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('suppliers')
      .select('id, name, short_name')
      .eq('active', true)
      .order('name', { ascending: true }),
  ]);

  if (!order) notFound();

  // Kontakty klienta
  let contacts: Array<{
    id: string;
    name: string;
    position: string | null;
    email: string | null;
    phone: string | null;
    is_primary: boolean | null;
  }> = [];
  if (order.client_id) {
    const { data: c } = await supabase
      .from('client_contacts')
      .select('id, name, position, email, phone, is_primary')
      .eq('client_id', order.client_id)
      .order('is_primary', { ascending: false });
    contacts = c || [];
  }

  // Pod-pozycje kosztowe — wszystkie dla wszystkich items, grupowane po order_item_id
  const itemIds = (items || []).map((i) => i.id);
  let costsByItem: Record<string, Array<Record<string, unknown>>> = {};
  if (itemIds.length > 0) {
    const { data: costs } = await supabase
      .from('order_item_costs')
      .select('*')
      .in('order_item_id', itemIds)
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: true });

    if (costs) {
      costsByItem = costs.reduce<Record<string, Array<Record<string, unknown>>>>((acc, c) => {
        const oid = c.order_item_id as string;
        if (!acc[oid]) acc[oid] = [];
        acc[oid].push(c);
        return acc;
      }, {});
    }
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link
            href="/admin/orders"
            style={{
              color: 'var(--color-muted)',
              fontSize: 'var(--font-size-small)',
              textDecoration: 'none',
            }}
          >
            ← Wszystkie zamówienia
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            {order.order_number}
          </h1>
        </div>
      </header>

      <OrderEditor
        order={order}
        initialItems={items || []}
        initialContacts={contacts}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        initialCostsByItem={costsByItem as any}
        initialSuppliers={suppliers || []}
      />
    </>
  );
}
