import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { deleteClientAction } from './actions';
import styles from '../admin.module.css';
import listStyles from './ClientsList.module.css';

interface SearchParams {
  q?: string;
}

export default async function ClientsListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const supabase = supabaseServer;

  let query = supabase
    .from('clients')
    .select(
      `
      id, company_name, nip, contact_person, email, phone,
      address_city, created_at,
      offers(count),
      orders(count)
    `,
    )
    .order('created_at', { ascending: false });

  if (q) {
    query = query.or(
      `company_name.ilike.%${q}%,contact_person.ilike.%${q}%,email.ilike.%${q}%,nip.ilike.%${q}%`,
    );
  }

  const { data: clients, error } = await query;

  if (error) {
    return <div className={listStyles.error}>Błąd: {error.message}</div>;
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Klienci</h1>
        <Link href="/admin/clients/new" className={styles.btnPrimary}>
          + Nowy klient
        </Link>
      </header>

      <form className={listStyles.searchBar}>
        <input
          type="text"
          name="q"
          defaultValue={q || ''}
          placeholder="Szukaj po nazwie, kontakcie, emailu, NIP..."
          className={listStyles.searchInput}
        />
        {q && (
          <Link href="/admin/clients" className={listStyles.clearLink}>
            Wyczyść
          </Link>
        )}
      </form>

      {!clients || clients.length === 0 ? (
        <div className={listStyles.empty}>
          {q ? (
            <p>Brak klientów pasujących do &ldquo;{q}&rdquo;.</p>
          ) : (
            <p>Brak klientów. Kliknij &ldquo;Nowy klient&rdquo; aby dodać pierwszego.</p>
          )}
        </div>
      ) : (
        <div className={listStyles.tableWrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>Firma / Kontakt</th>
                <th>NIP</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Miasto</th>
                <th className={listStyles.numCol}>Oferty</th>
                <th className={listStyles.numCol}>Zamówienia</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => {
                const offerCount = (client.offers as { count: number }[])?.[0]?.count ?? 0;
                const orderCount = (client.orders as { count: number }[])?.[0]?.count ?? 0;

                return (
                  <tr key={client.id} className={listStyles.row}>
                    <td>
                      <Link href={`/admin/clients/${client.id}`} className={listStyles.companyLink}>
                        <div className={listStyles.companyName}>
                          {client.company_name || client.contact_person}
                        </div>
                        {client.company_name && (
                          <div className={listStyles.contactSub}>{client.contact_person}</div>
                        )}
                      </Link>
                    </td>
                    <td className={listStyles.mono}>{client.nip || '—'}</td>
                    <td>
                      <a href={`mailto:${client.email}`} className={listStyles.emailLink}>
                        {client.email}
                      </a>
                    </td>
                    <td>{client.phone || '—'}</td>
                    <td>{client.address_city || '—'}</td>
                    <td className={listStyles.numCol}>{offerCount}</td>
                    <td className={listStyles.numCol}>{orderCount}</td>
                    <td className={listStyles.actions}>
                      <Link href={`/admin/clients/${client.id}`} className={listStyles.actionLink}>
                        Edytuj
                      </Link>
                      <form action={deleteClientAction} style={{ display: 'inline' }}>
                        <input type="hidden" name="client_id" value={client.id} />
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
