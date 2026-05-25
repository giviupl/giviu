'use client';

// Mirror ClientSelector z ofert, ale dla zamówień.
// Używa setOrderClientAction zamiast setOfferClientAction.
// Reuse stylów z OrderEditor.module.css (CSS module ma równoważne klasy).

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { searchClientsAction } from '../../offers/[id]/actions';
import { getClientContactsAction } from '../../offers/[id]/actions';
import { setOrderClientAction } from '../actions';
import styles from './OrderEditor.module.css';

interface Contact {
  id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
}

interface ClientSearchResult {
  id: string;
  company_name: string | null;
  nip: string | null;
  contact_person: string;
  email: string;
}

interface Props {
  orderId: string;
  currentClientId: string | null;
  currentClientCompany: string | null;
  currentClientPerson: string | null;
  currentClientEmail: string | null;
  currentClientPhone: string | null;
  currentClientNip: string | null;
  contacts: Contact[];
  onClientChanged: (orderUpdate: Record<string, string | null>, contacts: Contact[]) => void;
}

export default function OrderClientSelector({
  orderId,
  currentClientId,
  currentClientCompany,
  currentClientPerson,
  currentClientEmail,
  currentClientPhone,
  currentClientNip,
  contacts,
  onClientChanged,
}: Props) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ClientSearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const r = await searchClientsAction(query);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const handleSelectClient = async (clientId: string) => {
    const contactsData = await getClientContactsAction(clientId);

    if (contactsData.length === 0) {
      alert(
        'Ten klient nie ma jeszcze osób kontaktowych. Dodaj kontakt w karcie klienta i wróć tutaj.',
      );
      return;
    }

    const primary = contactsData.find((c) => c.is_primary) || contactsData[0];

    startTransition(async () => {
      const result = await setOrderClientAction(orderId, clientId, {
        name: primary.name,
        email: primary.email,
        phone: primary.phone,
      });
      if (result.ok) {
        const selectedRow = results.find((c) => c.id === clientId);
        onClientChanged(
          {
            client_id: clientId,
            client_company: selectedRow?.company_name ?? null,
            client_person: primary.name,
            client_email: primary.email,
            client_phone: primary.phone,
            client_nip: selectedRow?.nip ?? null,
          },
          contactsData,
        );
        setSearchOpen(false);
        setQuery('');
        setResults([]);
      }
    });
  };

  const handleChangeContact = async (contactId: string) => {
    const contact = contacts.find((c) => c.id === contactId);
    if (!contact || !currentClientId) return;

    startTransition(async () => {
      const result = await setOrderClientAction(orderId, currentClientId, {
        name: contact.name,
        email: contact.email,
        phone: contact.phone,
      });
      if (result.ok) {
        onClientChanged(
          {
            client_person: contact.name,
            client_email: contact.email,
            client_phone: contact.phone,
          },
          contacts,
        );
      }
    });
  };

  // STAN: klient wybrany
  if (currentClientId && !searchOpen) {
    const currentContactId = contacts.find((c) => c.name === currentClientPerson)?.id || '';

    return (
      <div className={styles.clientSelected}>
        <div className={styles.clientInfo}>
          <div className={styles.clientCompany}>
            {currentClientCompany || currentClientPerson}
            {currentClientNip && (
              <span className={styles.clientNip}>NIP: {currentClientNip}</span>
            )}
          </div>

          {contacts.length > 0 && (
            <div className={styles.contactPicker}>
              <label className={styles.label}>Osoba kontaktowa:</label>
              <select
                value={currentContactId}
                onChange={(e) => handleChangeContact(e.target.value)}
                className={styles.contactSelect}
                disabled={isPending}
              >
                {contacts.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                    {c.position ? ` — ${c.position}` : ''}
                    {c.is_primary ? ' ★' : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          <div className={styles.contactDetails}>
            {currentClientEmail && (
              <a href={`mailto:${currentClientEmail}`} className={styles.contactLink}>
                {currentClientEmail}
              </a>
            )}
            {currentClientEmail && currentClientPhone && (
              <span className={styles.separator}>·</span>
            )}
            {currentClientPhone && (
              <a href={`tel:${currentClientPhone}`} className={styles.contactLink}>
                {currentClientPhone}
              </a>
            )}
          </div>
        </div>

        <div className={styles.clientActions}>
          <Link
            href={`/admin/clients/${currentClientId}`}
            className={styles.btnSmall}
            target="_blank"
          >
            Karta klienta →
          </Link>
          <button type="button" onClick={() => setSearchOpen(true)} className={styles.btnSmall}>
            Zmień klienta
          </button>
        </div>
      </div>
    );
  }

  // STAN: search aktywny / brak klienta
  return (
    <div className={styles.clientSearch}>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Szukaj klienta — nazwa, NIP, email..."
        className={styles.searchInput}
        autoFocus={searchOpen}
      />

      {searching && <p className={styles.searchHint}>Szukam…</p>}

      {!searching && query.trim() && results.length === 0 && (
        <p className={styles.searchHint}>Brak wyników dla &ldquo;{query}&rdquo;.</p>
      )}

      {results.length > 0 && (
        <ul className={styles.searchResults}>
          {results.map((r) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => handleSelectClient(r.id)}
                className={styles.searchResultBtn}
                disabled={isPending}
              >
                <div>
                  <strong>{r.company_name || r.contact_person}</strong>
                  {r.nip && <span className={styles.searchResultMeta}> · NIP {r.nip}</span>}
                </div>
                <div className={styles.searchResultSub}>
                  {r.company_name ? `${r.contact_person} · ` : ''}
                  {r.email}
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}

      <div className={styles.clientSearchActions}>
        <Link href="/admin/clients/new" className={styles.btnSmall} target="_blank">
          + Dodaj nowego klienta
        </Link>
        {currentClientId && (
          <button
            type="button"
            onClick={() => {
              setSearchOpen(false);
              setQuery('');
            }}
            className={styles.btnSmall}
          >
            Anuluj
          </button>
        )}
      </div>
    </div>
  );
}
