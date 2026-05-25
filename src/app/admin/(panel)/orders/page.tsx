import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { createEmptyOrderAction, deleteOrderAction } from './actions';
import styles from '../admin.module.css';
import listStyles from '../offers/OffersList.module.css';

// B1: tylko 4 statusy. B2: lista wyklucza completed/cancelled (idą do /history).
const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Nowe', color: 'gray' },
  in_production: { label: 'W produkcji', color: 'orange' },
};

const ARCHIVED_STATUSES = ['completed', 'cancelled'];

interface SearchParams {
  status?: string;
}

export default async function OrdersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status } = await searchParams;
  const supabase = supabaseServer;

  let query = supabase
    .from('orders')
    .select(
      `
      id, order_number, status, client_company, client_person,
      order_date, production_deadline, delivery_deadline,
      created_at, updated_at,
      order_items(total_price, quantity, unit_price, purchase_price, extra_costs_per_unit, transport_cost_total)
    `,
    )
    .not('status', 'in', `(${ARCHIVED_STATUSES.join(',')})`)
    .order('created_at', { ascending: false });

  if (status && STATUS_LABELS[status]) {
    query = query.eq('status', status);
  }

  const { data: orders, error } = await query;

  if (error) {
    return <div className={listStyles.error}>Błąd: {error.message}</div>;
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Zamówienia{' '}
          {status && STATUS_LABELS[status] && (
            <span className={listStyles.filterBadge}>{STATUS_LABELS[status].label}</span>
          )}
        </h1>
        <form action={createEmptyOrderAction}>
          <button type="submit" className={styles.btnPrimary}>
            + Nowe zamówienie
          </button>
        </form>
      </header>

      <div className={listStyles.filters}>
        <Link
          href="/admin/orders"
          className={`${listStyles.filterChip} ${!status ? listStyles.active : ''}`}
        >
          Wszystkie aktywne
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
          <Link
            key={key}
            href={`/admin/orders?status=${key}`}
            className={`${listStyles.filterChip} ${status === key ? listStyles.active : ''}`}
          >
            {label}
          </Link>
        ))}
        <Link href="/admin/orders/history" className={listStyles.filterChip}>
          🗂️ Historia →
        </Link>
      </div>

      {!orders || orders.length === 0 ? (
        <div className={listStyles.empty}>
          <p>Brak aktywnych zamówień. Utwórz nowe albo skonwertuj zaakceptowaną ofertę.</p>
        </div>
      ) : (
        <OrdersTable orders={orders} />
      )}
    </>
  );
}

// ============================================
// Tabela zamówień — reused też w /admin/orders/history
// ============================================
function OrdersTable({
  orders,
}: {
  orders: Array<{
    id: string;
    order_number: string;
    status: string;
    client_company: string | null;
    client_person: string | null;
    order_date: string | null;
    production_deadline: string | null;
    delivery_deadline: string | null;
    order_items: Array<{
      total_price: number;
      quantity: number;
      unit_price: number;
      purchase_price: number;
      extra_costs_per_unit: number;
      transport_cost_total: number;
    }> | null;
  }>;
}) {
  return (
    <div className={listStyles.tableWrap}>
      <table className={listStyles.table}>
        <thead>
          <tr>
            <th>Numer</th>
            <th>Klient</th>
            <th>Status</th>
            <th className={listStyles.numCol}>Wartość</th>
            <th className={listStyles.numCol}>Zysk szacunkowy</th>
            <th>Realizacja</th>
            <th>Dostawa</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const items = order.order_items || [];

            const totalValue = items.reduce((sum, i) => sum + Number(i.total_price || 0), 0);
            const totalProfit = items.reduce((sum, i) => {
              const qty = Math.max(1, i.quantity);
              const cost =
                Number(i.purchase_price || 0) +
                Number(i.extra_costs_per_unit || 0) +
                Number(i.transport_cost_total || 0) / qty;
              return sum + (Number(i.unit_price || 0) - cost) * qty;
            }, 0);

            const allStatuses: Record<string, { label: string; color: string }> = {
              new: { label: 'Nowe', color: 'gray' },
              in_production: { label: 'W produkcji', color: 'orange' },
              completed: { label: 'Zakończone', color: 'green' },
              cancelled: { label: 'Anulowane', color: 'red' },
            };
            const statusInfo = allStatuses[order.status] || { label: order.status, color: 'gray' };

            return (
              <tr key={order.id} className={listStyles.row}>
                <td>
                  <Link href={`/admin/orders/${order.id}`} className={listStyles.numberLink}>
                    {order.order_number}
                  </Link>
                </td>
                <td>
                  <div className={listStyles.clientName}>
                    {order.client_company || order.client_person || '—'}
                  </div>
                  {order.client_company && order.client_person && (
                    <div className={listStyles.clientSub}>{order.client_person}</div>
                  )}
                </td>
                <td>
                  <span
                    className={`${listStyles.statusBadge} ${listStyles[`status_${statusInfo.color}`]}`}
                  >
                    {statusInfo.label}
                  </span>
                </td>
                <td className={listStyles.numCol}>
                  {totalValue > 0 ? `${totalValue.toFixed(2)} zł` : '—'}
                </td>
                <td className={`${listStyles.numCol} ${listStyles.profit}`}>
                  {totalProfit > 0 ? `${totalProfit.toFixed(2)} zł` : '—'}
                </td>
                <td>
                  {order.production_deadline
                    ? new Date(order.production_deadline).toLocaleDateString('pl-PL')
                    : '—'}
                </td>
                <td>
                  {order.delivery_deadline
                    ? new Date(order.delivery_deadline).toLocaleDateString('pl-PL')
                    : '—'}
                </td>
                <td className={listStyles.actions}>
                  <Link href={`/admin/orders/${order.id}`} className={listStyles.actionLink}>
                    Szczegóły
                  </Link>
                  <form action={deleteOrderAction} style={{ display: 'inline' }}>
                    <input type="hidden" name="order_id" value={order.id} />
                    <button type="submit" className={listStyles.deleteBtn} title="Usuń">
                      ✕
                    </button>
                  </form>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
