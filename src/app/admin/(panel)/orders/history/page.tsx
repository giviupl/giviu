import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { deleteOrderAction } from '../actions';
import styles from '../../admin.module.css';
import listStyles from '../../offers/OffersList.module.css';

const HISTORY_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  completed: { label: 'Zakończone', color: 'green' },
  cancelled: { label: 'Anulowane', color: 'red' },
};

const HISTORY_STATUSES = Object.keys(HISTORY_STATUS_LABELS);

interface SearchParams {
  status?: string;
}

export default async function OrdersHistoryPage({
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
      order_date, production_deadline, delivery_deadline, delivered_at,
      created_at, updated_at,
      order_items(total_price, quantity, unit_price, purchase_price, extra_costs_per_unit, transport_cost_total)
    `,
    )
    .in('status', HISTORY_STATUSES)
    .order('created_at', { ascending: false });

  if (status && HISTORY_STATUS_LABELS[status]) {
    query = query.eq('status', status);
  }

  const { data: orders, error } = await query;

  if (error) {
    return <div className={listStyles.error}>Błąd: {error.message}</div>;
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
            ← Aktywne zamówienia
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            Historia zamówień{' '}
            {status && HISTORY_STATUS_LABELS[status] && (
              <span className={listStyles.filterBadge}>{HISTORY_STATUS_LABELS[status].label}</span>
            )}
          </h1>
        </div>
      </header>

      <div className={listStyles.filters}>
        <Link
          href="/admin/orders/history"
          className={`${listStyles.filterChip} ${!status ? listStyles.active : ''}`}
        >
          Wszystkie zarchiwizowane
        </Link>
        {Object.entries(HISTORY_STATUS_LABELS).map(([key, { label }]) => (
          <Link
            key={key}
            href={`/admin/orders/history?status=${key}`}
            className={`${listStyles.filterChip} ${status === key ? listStyles.active : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!orders || orders.length === 0 ? (
        <div className={listStyles.empty}>
          <p>Brak zarchiwizowanych zamówień.</p>
        </div>
      ) : (
        <div className={listStyles.tableWrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>Numer</th>
                <th>Klient</th>
                <th>Status</th>
                <th className={listStyles.numCol}>Wartość</th>
                <th className={listStyles.numCol}>Zysk</th>
                <th>Data zamówienia</th>
                <th>Zakończenie</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => {
                const items =
                  (order.order_items as Array<{
                    total_price: number;
                    quantity: number;
                    unit_price: number;
                    purchase_price: number;
                    extra_costs_per_unit: number;
                    transport_cost_total: number;
                  }>) || [];

                const totalValue = items.reduce((sum, i) => sum + Number(i.total_price || 0), 0);
                const totalProfit = items.reduce((sum, i) => {
                  const qty = Math.max(1, i.quantity);
                  const cost =
                    Number(i.purchase_price || 0) +
                    Number(i.extra_costs_per_unit || 0) +
                    Number(i.transport_cost_total || 0) / qty;
                  return sum + (Number(i.unit_price || 0) - cost) * qty;
                }, 0);

                const statusInfo = HISTORY_STATUS_LABELS[order.status] || {
                  label: order.status,
                  color: 'gray',
                };

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
                      {order.order_date
                        ? new Date(order.order_date).toLocaleDateString('pl-PL')
                        : '—'}
                    </td>
                    <td>
                      {order.delivered_at
                        ? new Date(order.delivered_at).toLocaleDateString('pl-PL')
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
      )}
    </>
  );
}
