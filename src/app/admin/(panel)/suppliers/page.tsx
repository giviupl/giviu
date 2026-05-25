import Link from 'next/link';
import { supabaseServer } from '@/lib/supabase-server';
import { createSupplierAction, deleteSupplierAction } from './actions';
import styles from '../admin.module.css';
import listStyles from '../offers/OffersList.module.css';
import suppliersStyles from './SuppliersList.module.css';

interface SearchParams {
  q?: string;
}

export default async function SuppliersListPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const { q } = await searchParams;
  const supabase = supabaseServer;

  let query = supabase
    .from('suppliers')
    .select('id, name, short_name, nip, email, phone, contact_person, active, created_at')
    .order('name', { ascending: true });

  if (q && q.trim()) {
    const trimmed = q.trim();
    query = query.or(
      `name.ilike.%${trimmed}%,short_name.ilike.%${trimmed}%,nip.ilike.%${trimmed}%,email.ilike.%${trimmed}%`,
    );
  }

  const { data: suppliers, error } = await query;

  if (error) {
    return <div className={listStyles.error}>Błąd: {error.message}</div>;
  }

  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Dostawcy</h1>
        <form action={createSupplierAction} className={suppliersStyles.quickAddForm}>
          <input
            type="text"
            name="name"
            placeholder="Nazwa nowego dostawcy"
            className={suppliersStyles.quickAddInput}
            required
          />
          <button type="submit" className={styles.btnPrimary}>
            + Dodaj dostawcę
          </button>
        </form>
      </header>

      <form method="get" className={suppliersStyles.searchForm}>
        <input
          type="text"
          name="q"
          defaultValue={q || ''}
          placeholder="Szukaj — nazwa, NIP, email..."
          className={suppliersStyles.searchInput}
        />
      </form>

      {!suppliers || suppliers.length === 0 ? (
        <div className={listStyles.empty}>
          <p>Brak dostawców {q ? `dla "${q}"` : ''}. Dodaj pierwszego powyżej.</p>
        </div>
      ) : (
        <div className={listStyles.tableWrap}>
          <table className={listStyles.table}>
            <thead>
              <tr>
                <th>Nazwa</th>
                <th>NIP</th>
                <th>Kontakt</th>
                <th>Email</th>
                <th>Telefon</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((s) => (
                <tr key={s.id} className={listStyles.row}>
                  <td>
                    <Link href={`/admin/suppliers/${s.id}`} className={listStyles.numberLink}>
                      {s.short_name || s.name}
                    </Link>
                    {s.short_name && s.name !== s.short_name && (
                      <div className={listStyles.clientSub}>{s.name}</div>
                    )}
                  </td>
                  <td>{s.nip || '—'}</td>
                  <td>{s.contact_person || '—'}</td>
                  <td>
                    {s.email ? (
                      <a href={`mailto:${s.email}`} className={suppliersStyles.link}>
                        {s.email}
                      </a>
                    ) : (
                      '—'
                    )}
                  </td>
                  <td>{s.phone || '—'}</td>
                  <td>
                    <span
                      className={`${listStyles.statusBadge} ${
                        s.active ? listStyles.status_green : listStyles.status_gray
                      }`}
                    >
                      {s.active ? 'Aktywny' : 'Nieaktywny'}
                    </span>
                  </td>
                  <td className={listStyles.actions}>
                    <Link href={`/admin/suppliers/${s.id}`} className={listStyles.actionLink}>
                      Edytuj
                    </Link>
                    <form action={deleteSupplierAction} style={{ display: 'inline' }}>
                      <input type="hidden" name="supplier_id" value={s.id} />
                      <button type="submit" className={listStyles.deleteBtn} title="Usuń">
                        ✕
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
