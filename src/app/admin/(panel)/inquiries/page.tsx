import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { deleteInquiryAction } from './actions';
import styles from '../admin.module.css';
import listStyles from '../offers/OffersList.module.css';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  new: { label: 'Nowe', color: 'orange' },
  in_progress: { label: 'W obróbce', color: 'blue' },
  quoted: { label: 'Wycenione', color: 'green' },
  rejected: { label: 'Odrzucone', color: 'red' },
};

interface SearchParams {
  status?: string;
}

export default async function InquiriesListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { status } = await searchParams;
  const supabase = supabaseServer;

  let query = supabase
    .from('inquiries')
    .select(
      `
      id, company_name, contact_person, email, phone, nip, status,
      created_at, client_id, converted_offer_id,
      inquiry_items(id)
    `,
    )
    .order('created_at', { ascending: false });

  if (status && STATUS_LABELS[status]) {
    query = query.eq('status', status);
  }

  const { data: inquiries, error } = await query;

  if (error) {
    return <div className={listStyles.error}>Błąd: {error.message}</div>;
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>
          Zapytania{' '}
          {status && STATUS_LABELS[status] && (
            <span className={listStyles.filterBadge}>{STATUS_LABELS[status].label}</span>
          )}
        </h1>
      </header>

      <div className={listStyles.filters}>
        <Link
          href="/admin/inquiries"
          className={`${listStyles.filterChip} ${!status ? listStyles.active : ''}`}
        >
          Wszystkie
        </Link>
        {Object.entries(STATUS_LABELS).map(([key, { label }]) => (
          <Link
            key={key}
            href={`/admin/inquiries?status=${key}`}
            className={`${listStyles.filterChip} ${status === key ? listStyles.active : ''}`}
          >
            {label}
          </Link>
        ))}
      </div>

      {!inquiries || inquiries.length === 0 ? (
        <div className={listStyles.empty}>
          <p>
            Brak zapytań{status ? ` o statusie "${STATUS_LABELS[status]?.label}"` : ''}.
            Zapytania pojawiają się tu gdy klienci wyślą formularz wyceny na giviu.pl.
          </p>
        </div>
      ) : (
        <div className={listStyles.tableWrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>Data</th>
                <th>Klient</th>
                <th>Email / Telefon</th>
                <th className={listStyles.numCol}>Pozycje</th>
                <th>Status</th>
                <th>Link</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {inquiries.map((inq) => {
                const statusInfo = STATUS_LABELS[inq.status] || {
                  label: inq.status,
                  color: 'gray',
                };
                const itemsCount = (inq.inquiry_items as Array<unknown>)?.length || 0;
                const createdDate = new Date(inq.created_at).toLocaleDateString('pl-PL', {
                  day: '2-digit',
                  month: '2-digit',
                  year: 'numeric',
                });

                return (
                  <tr key={inq.id} className={listStyles.row}>
                    <td>{createdDate}</td>
                    <td>
                      <Link href={`/admin/inquiries/${inq.id}`} className={listStyles.numberLink}>
                        {inq.company_name || inq.contact_person || 'Bez nazwy'}
                      </Link>
                      {inq.company_name && inq.contact_person && (
                        <div className={listStyles.clientSub}>{inq.contact_person}</div>
                      )}
                      {inq.nip && (
                        <div className={listStyles.clientSub} style={{ fontSize: '0.75em' }}>
                          NIP: {inq.nip}
                        </div>
                      )}
                    </td>
                    <td>
                      {inq.email && (
                        <div>
                          <a
                            href={`mailto:${inq.email}`}
                            style={{ color: 'var(--color-primary)', textDecoration: 'none' }}
                          >
                            {inq.email}
                          </a>
                        </div>
                      )}
                      {inq.phone && (
                        <div className={listStyles.clientSub}>{inq.phone}</div>
                      )}
                    </td>
                    <td className={listStyles.numCol}>{itemsCount}</td>
                    <td>
                      <span
                        className={`${listStyles.statusBadge} ${listStyles[`status_${statusInfo.color}`]}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>
                    <td>
                      {inq.converted_offer_id && (
                        <Link
                          href={`/admin/offers/${inq.converted_offer_id}`}
                          className={listStyles.actionLink}
                          style={{ fontSize: '0.85em' }}
                        >
                          → Oferta
                        </Link>
                      )}
                      {inq.client_id && !inq.converted_offer_id && (
                        <Link
                          href={`/admin/clients/${inq.client_id}`}
                          className={listStyles.actionLink}
                          style={{ fontSize: '0.85em' }}
                        >
                          → Klient
                        </Link>
                      )}
                    </td>
                    <td className={listStyles.actions}>
                      <Link href={`/admin/inquiries/${inq.id}`} className={listStyles.actionLink}>
                        Szczegóły
                      </Link>
                      <form action={deleteInquiryAction} style={{ display: 'inline' }}>
                        <input type="hidden" name="inquiry_id" value={inq.id} />
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
