import Link from 'next/link';
import { notFound } from 'next/navigation';
import { supabaseServer } from '@/lib/supabase-server';
import ClientEditForm from './ClientEditForm';
import ContactsManager from './ContactsManager';
import styles from '../../admin.module.css';
import pageStyles from './ClientPage.module.css';

interface PageProps {
  params: Promise<{ id: string }>;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'Robocza',
  sent: 'Wysłana',
  accepted: 'Zaakceptowana',
  rejected: 'Odrzucona',
  expired: 'Wygasła',
  new: 'Nowe',
  in_production: 'W produkcji',
  ready: 'Gotowe',
  shipped: 'Wysłane',
  delivered: 'Dostarczone',
  completed: 'Zrealizowane',
  cancelled: 'Anulowane',
};

export default async function ClientEditPage({ params }: PageProps) {
  const { id } = await params;
  const supabase = supabaseServer;

  const [{ data: client }, { data: contacts }, { data: offers }, { data: orders }] =
    await Promise.all([
      supabase.from('clients').select('*').eq('id', id).single(),
      supabase
        .from('client_contacts')
        .select('*')
        .eq('client_id', id)
        .order('is_primary', { ascending: false })
        .order('created_at', { ascending: true }),
      supabase
        .from('offers')
        .select('id, offer_number, status, created_at, offer_items(total_price, total_price_gross)')
        .eq('client_id', id)
        .order('created_at', { ascending: false }),
      supabase
        .from('orders')
        .select('id, order_number, status, order_date, total_value')
        .eq('client_id', id)
        .order('created_at', { ascending: false }),
    ]);

  if (!client) notFound();

  const totalOfferValueGross = (offers || []).reduce((sum, offer) => {
    const items = (offer.offer_items as { total_price_gross: number }[]) || [];
    return sum + items.reduce((s, i) => s + Number(i.total_price_gross || 0), 0);
  }, 0);

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link href="/admin/clients" className={pageStyles.backLink}>
            ← Wszyscy klienci
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            {client.company_name || client.contact_person}
          </h1>
          {client.company_name && <p className={pageStyles.subtitle}>{client.contact_person}</p>}
        </div>
      </header>

      <div className={pageStyles.layout}>
        {/* LEWA — dane firmy (auto-save) */}
        <section className={pageStyles.section}>
          <h2 className={pageStyles.sectionTitle}>Dane firmy</h2>
          <ClientEditForm client={client} />
        </section>

        {/* PRAWA — sidebar ze statystykami */}
        <aside className={pageStyles.sidebar}>
          <div className={pageStyles.statCard}>
            <div className={pageStyles.statLabel}>Oferty</div>
            <div className={pageStyles.statValue}>{offers?.length ?? 0}</div>
          </div>
          <div className={pageStyles.statCard}>
            <div className={pageStyles.statLabel}>Zamówienia</div>
            <div className={pageStyles.statValue}>{orders?.length ?? 0}</div>
          </div>
          {totalOfferValueGross > 0 && (
            <div className={pageStyles.statCard}>
              <div className={pageStyles.statLabel}>Wartość ofert (brutto)</div>
              <div className={pageStyles.statValueSm}>
                {totalOfferValueGross.toLocaleString('pl-PL', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}{' '}
                zł
              </div>
            </div>
          )}
        </aside>
      </div>

      {/* KONTAKTY */}
      <section className={pageStyles.section} style={{ marginTop: 24 }}>
        <h2 className={pageStyles.sectionTitle}>
          Osoby kontaktowe <span className={pageStyles.count}>({contacts?.length ?? 0})</span>
        </h2>
        <ContactsManager clientId={id} contacts={contacts || []} />
      </section>

      {/* HISTORIA OFERT */}
      <section className={pageStyles.section} style={{ marginTop: 24 }}>
        <h2 className={pageStyles.sectionTitle}>
          Historia ofert <span className={pageStyles.count}>({offers?.length ?? 0})</span>
        </h2>
        {!offers || offers.length === 0 ? (
          <p className={pageStyles.emptyText}>Brak ofert dla tego klienta.</p>
        ) : (
          <table className={pageStyles.table}>
            <thead>
              <tr>
                <th>Numer</th>
                <th>Status</th>
                <th className={pageStyles.numCol}>Wartość brutto</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {offers.map((offer) => {
                const items = (offer.offer_items as { total_price_gross: number }[]) || [];
                const total = items.reduce((s, i) => s + Number(i.total_price_gross || 0), 0);
                return (
                  <tr key={offer.id}>
                    <td>
                      <Link href={`/admin/offers/${offer.id}`} className={pageStyles.link}>
                        {offer.offer_number}
                      </Link>
                    </td>
                    <td>{STATUS_LABELS[offer.status] || offer.status}</td>
                    <td className={pageStyles.numCol}>
                      {total > 0
                        ? `${total.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł`
                        : '—'}
                    </td>
                    <td>{new Date(offer.created_at).toLocaleDateString('pl-PL')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>

      {/* HISTORIA ZAMÓWIEŃ */}
      <section className={pageStyles.section} style={{ marginTop: 24 }}>
        <h2 className={pageStyles.sectionTitle}>
          Historia zamówień <span className={pageStyles.count}>({orders?.length ?? 0})</span>
        </h2>
        {!orders || orders.length === 0 ? (
          <p className={pageStyles.emptyText}>Brak zamówień dla tego klienta.</p>
        ) : (
          <table className={pageStyles.table}>
            <thead>
              <tr>
                <th>Numer</th>
                <th>Status</th>
                <th className={pageStyles.numCol}>Wartość</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td>
                    <Link href={`/admin/orders/${order.id}`} className={pageStyles.link}>
                      {order.order_number}
                    </Link>
                  </td>
                  <td>{STATUS_LABELS[order.status] || order.status}</td>
                  <td className={pageStyles.numCol}>
                    {order.total_value
                      ? `${Number(order.total_value).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł`
                      : '—'}
                  </td>
                  <td>{new Date(order.order_date).toLocaleDateString('pl-PL')}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </>
  );
}
