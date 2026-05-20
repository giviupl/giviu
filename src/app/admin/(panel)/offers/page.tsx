import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { createOfferAction, deleteOfferAction } from './actions';
import styles from '../admin.module.css';
import listStyles from './OffersList.module.css';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  draft: { label: 'Robocza', color: 'gray' },
  sent: { label: 'Wysłana', color: 'blue' },
  accepted: { label: 'Zaakceptowana', color: 'green' },
  rejected: { label: 'Odrzucona', color: 'red' },
  expired: { label: 'Wygasła', color: 'orange' },
};

interface SearchParams {
  status?: string;
}

export default async function OffersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status } = await searchParams;
  const supabase = supabaseServer;

  let query = supabase
    .from('offers')
    .select(
      `
      id, offer_number, status, client_company, client_person,
      client_email, valid_until, created_at, updated_at,
      offer_items(total_price, profit_total)
    `,
    )
    .order('created_at', { ascending: false });

  if (status) query = query.eq('status', status);

  const { data: offers, error } = await query;

  if (error) {
    return <div className={listStyles.error}>Błąd: {error.message}</div>;
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Oferty {status && <span className={listStyles.filterBadge}>{STATUS_LABELS[status]?.label}</span>}
        </h1>
        <form action={createOfferAction}>
          <button type="submit" className={styles.btnPrimary}>
            + Nowa oferta
          </button>
        </form>
      </header>

      <div className={listStyles.filters}>
        <Link
          href="/admin/offers"
          className={`${listStyles.filterChip} ${!status ? listStyles.active : ''}`}
        >
          Wszystkie
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
          <Link
            key={key}
            href={`/admin/offers?status=${key}`}
            className={`${listStyles.filterChip} ${status === key ? listStyles.active : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!offers || offers.length === 0 ? (
        <div className={listStyles.empty}>
          <p>Brak ofert. Kliknij &ldquo;Nowa oferta&rdquo; aby utworzyć pierwszą.</p>
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
                <th>Ważna do</th>
                <th>Utworzona</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const items = (offer.offer_items as { total_price: number; profit_total: number }[]) || [];
                const totalValue = items.reduce((sum, i) => sum + Number(i.total_price || 0), 0);
                const totalProfit = items.reduce((sum, i) => sum + Number(i.profit_total || 0), 0);
                const statusInfo = STATUS_LABELS[offer.status] || { label: offer.status, color: 'gray' };

                return (
                  <tr key={offer.id} className={listStyles.row}>
                    <td>
                      <Link href={`/admin/offers/${offer.id}`} className={listStyles.numberLink}>
                        {offer.offer_number}
                      </Link>
                    </td>
                    <td>
                      <div className={listStyles.clientName}>
                        {offer.client_company || offer.client_person || '—'}
                      </div>
                      {offer.client_company && offer.client_person && (
                        <div className={listStyles.clientSub}>{offer.client_person}</div>
                      )}
                    </td>
                    <td>
                      <span className={`${listStyles.statusBadge} ${listStyles[`status_${statusInfo.color}`]}`}>
                        {statusInfo.label}
                      </span>
                    </td>
                    <td className={listStyles.numCol}>
                      {totalValue > 0 ? `${totalValue.toFixed(2)} zł` : '—'}
                    </td>
                    <td className={`${listStyles.numCol} ${listStyles.profit}`}>
                      {totalProfit > 0 ? `${totalProfit.toFixed(2)} zł` : '—'}
                    </td>
                    <td>{offer.valid_until ? new Date(offer.valid_until).toLocaleDateString('pl-PL') : '—'}</td>
                    <td>{new Date(offer.created_at).toLocaleDateString('pl-PL')}</td>
                    <td className={listStyles.actions}>
                      <Link href={`/admin/offers/${offer.id}`} className={listStyles.actionLink}>
                        Edytuj
                      </Link>
                      <form action={deleteOfferAction} style={{ display: 'inline' }}>
                        <input type="hidden" name="offer_id" value={offer.id} />
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
