'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import Link from 'next/link';
import { createClientAction } from '../actions';
import { checkNipAction } from '../[id]/actions';
import styles from '../../admin.module.css';
import formStyles from './NewClient.module.css';

interface NipCheckResult {
  exists: boolean;
  client?: { id: string; company_name: string | null; contact_person: string };
}

export default function NewClientPage() {
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const [nip, setNip] = useState('');
  const [nipCheck, setNipCheck] = useState<NipCheckResult | null>(null);
  const [checkingNip, setCheckingNip] = useState(false);
  const nipTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Real-time NIP check z debounce 600ms
  useEffect(() => {
    if (nipTimerRef.current) clearTimeout(nipTimerRef.current);
    if (!nip.trim()) {
      setNipCheck(null);
      return;
    }

    setCheckingNip(true);
    nipTimerRef.current = setTimeout(async () => {
      const result = await checkNipAction(nip);
      setNipCheck(result);
      setCheckingNip(false);
    }, 600);

    return () => {
      if (nipTimerRef.current) clearTimeout(nipTimerRef.current);
    };
  }, [nip]);

  const handleSubmit = (formData: FormData) => {
    if (nipCheck?.exists) {
      setError('Klient z tym NIP już istnieje. Otwórz jego kartę.');
      return;
    }
    setError(null);
    startTransition(async () => {
      const result = await createClientAction(formData);
      if (result?.error) setError(result.error);
    });
  };

  return (
    <>
      <header className={styles.pageHeader}>
        <div>
          <Link href="/admin/clients" className={formStyles.backLink}>
            ← Wszyscy klienci
          </Link>
          <h1 className={styles.pageTitle} style={{ marginTop: 8 }}>
            Nowy klient
          </h1>
        </div>
      </header>

      <form action={handleSubmit} className={formStyles.form}>
        <section className={formStyles.section}>
          <h2 className={formStyles.sectionTitle}>Dane firmy</h2>
          <div className={formStyles.row}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Nazwa firmy</label>
              <input type="text" name="company_name" className={formStyles.input} />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>NIP</label>
              <input
                type="text"
                name="nip"
                value={nip}
                onChange={(e) => setNip(e.target.value)}
                className={formStyles.input}
                placeholder="np. 5252222222"
              />
              {checkingNip && (
                <p className={formStyles.nipChecking}>Sprawdzanie…</p>
              )}
              {!checkingNip && nipCheck?.exists && nipCheck.client && (
                <div className={formStyles.nipExists}>
                  <strong>⚠ Klient z tym NIP już istnieje:</strong>{' '}
                  <Link
                    href={`/admin/clients/${nipCheck.client.id}`}
                    className={formStyles.nipExistsLink}
                  >
                    {nipCheck.client.company_name || nipCheck.client.contact_person} →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </section>

        <section className={formStyles.section}>
          <h2 className={formStyles.sectionTitle}>Kontakt</h2>
          <div className={formStyles.row}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>
                Osoba kontaktowa <span className={formStyles.required}>*</span>
              </label>
              <input
                type="text"
                name="contact_person"
                className={formStyles.input}
                required
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>
                Email <span className={formStyles.required}>*</span>
              </label>
              <input type="email" name="email" className={formStyles.input} required />
            </div>
          </div>
          <div className={formStyles.row}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Telefon</label>
              <input type="tel" name="phone" className={formStyles.input} />
            </div>
          </div>
        </section>

        <section className={formStyles.section}>
          <h2 className={formStyles.sectionTitle}>Adres (opcjonalnie)</h2>
          <div className={formStyles.field}>
            <label className={formStyles.label}>Ulica i numer</label>
            <input type="text" name="address_street" className={formStyles.input} />
          </div>
          <div className={formStyles.row}>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Kod pocztowy</label>
              <input
                type="text"
                name="address_postal_code"
                className={formStyles.input}
                placeholder="00-000"
              />
            </div>
            <div className={formStyles.field}>
              <label className={formStyles.label}>Miasto</label>
              <input type="text" name="address_city" className={formStyles.input} />
            </div>
          </div>
        </section>

        <section className={formStyles.section}>
          <h2 className={formStyles.sectionTitle}>Notatki</h2>
          <textarea
            name="notes"
            rows={4}
            className={formStyles.textarea}
          ></textarea>
        </section>

        {error && <p className={formStyles.error}>{error}</p>}

        <div className={formStyles.actions}>
          <Link href="/admin/clients" className={styles.btnSecondary}>
            Anuluj
          </Link>
          <button
            type="submit"
            className={styles.btnPrimary}
            disabled={isPending || (nipCheck?.exists ?? false)}
          >
            {isPending ? 'Zapisywanie…' : 'Zapisz klienta'}
          </button>
        </div>
      </form>
    </>
  );
}
