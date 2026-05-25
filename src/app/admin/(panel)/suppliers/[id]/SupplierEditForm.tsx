'use client';

import { useState, useEffect, useRef } from 'react';
import { updateSupplierAction } from '../actions';
import styles from './SupplierPage.module.css';

interface Supplier {
  id: string;
  name: string;
  short_name: string | null;
  nip: string | null;
  regon: string | null;
  krs: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  contact_person: string | null;
  address_street: string | null;
  address_city: string | null;
  address_postal_code: string | null;
  address_country: string | null;
  iban: string | null;
  default_payment_terms_days: number | null;
  active: boolean | null;
  notes: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function SupplierEditForm({ supplier }: { supplier: Supplier }) {
  const [formData, setFormData] = useState({
    name: supplier.name || '',
    short_name: supplier.short_name || '',
    nip: supplier.nip || '',
    regon: supplier.regon || '',
    krs: supplier.krs || '',
    email: supplier.email || '',
    phone: supplier.phone || '',
    website: supplier.website || '',
    contact_person: supplier.contact_person || '',
    address_street: supplier.address_street || '',
    address_city: supplier.address_city || '',
    address_postal_code: supplier.address_postal_code || '',
    address_country: supplier.address_country || 'PL',
    iban: supplier.iban || '',
    default_payment_terms_days: supplier.default_payment_terms_days ?? 14,
    active: supplier.active ?? true,
    notes: supplier.notes || '',
  });

  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateSupplierAction(supplier.id, formData);
      if (result.ok) {
        setStatus('saved');
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const update = <K extends keyof typeof formData>(key: K, value: (typeof formData)[K]) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className={styles.form}>
      <div className={styles.saveBar}>
        <label className={styles.activeToggle}>
          <input
            type="checkbox"
            checked={formData.active}
            onChange={(e) => update('active', e.target.checked)}
          />
          Aktywny dostawca
        </label>
        <div className={styles.saveIndicator}>
          {status === 'saving' && <span className={styles.statusSaving}>Zapisywanie…</span>}
          {status === 'saved' && <span className={styles.statusSaved}>✓ Zapisano</span>}
          {status === 'error' && <span className={styles.statusError}>⚠ Błąd zapisu</span>}
        </div>
      </div>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dane podstawowe</h2>
        <div className={styles.grid2}>
          <Field label="Nazwa pełna *">
            <input
              type="text"
              value={formData.name}
              onChange={(e) => update('name', e.target.value)}
              className={styles.input}
              required
            />
          </Field>
          <Field label="Nazwa krótka (np. w dropdownach)">
            <input
              type="text"
              value={formData.short_name}
              onChange={(e) => update('short_name', e.target.value)}
              className={styles.input}
              placeholder={formData.name}
            />
          </Field>
          <Field label="Strona WWW">
            <input
              type="url"
              value={formData.website}
              onChange={(e) => update('website', e.target.value)}
              className={styles.input}
              placeholder="https://..."
            />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Dane firmy</h2>
        <div className={styles.grid3}>
          <Field label="NIP">
            <input
              type="text"
              value={formData.nip}
              onChange={(e) => update('nip', e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="REGON">
            <input
              type="text"
              value={formData.regon}
              onChange={(e) => update('regon', e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="KRS">
            <input
              type="text"
              value={formData.krs}
              onChange={(e) => update('krs', e.target.value)}
              className={styles.input}
            />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Kontakt</h2>
        <div className={styles.grid3}>
          <Field label="Osoba kontaktowa">
            <input
              type="text"
              value={formData.contact_person}
              onChange={(e) => update('contact_person', e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="Email">
            <input
              type="email"
              value={formData.email}
              onChange={(e) => update('email', e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="Telefon">
            <input
              type="tel"
              value={formData.phone}
              onChange={(e) => update('phone', e.target.value)}
              className={styles.input}
            />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Adres</h2>
        <div className={styles.grid4}>
          <Field label="Ulica" wide>
            <input
              type="text"
              value={formData.address_street}
              onChange={(e) => update('address_street', e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="Kod pocztowy">
            <input
              type="text"
              value={formData.address_postal_code}
              onChange={(e) => update('address_postal_code', e.target.value)}
              className={styles.input}
              placeholder="00-000"
            />
          </Field>
          <Field label="Miasto">
            <input
              type="text"
              value={formData.address_city}
              onChange={(e) => update('address_city', e.target.value)}
              className={styles.input}
            />
          </Field>
          <Field label="Kraj">
            <input
              type="text"
              value={formData.address_country}
              onChange={(e) => update('address_country', e.target.value)}
              className={styles.input}
              maxLength={2}
            />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Płatność</h2>
        <div className={styles.grid2}>
          <Field label="IBAN (numer konta)">
            <input
              type="text"
              value={formData.iban}
              onChange={(e) => update('iban', e.target.value)}
              className={styles.input}
              placeholder="PL00 0000 0000 0000 0000 0000 0000"
            />
          </Field>
          <Field label="Termin płatności (dni)">
            <input
              type="number"
              min={0}
              value={formData.default_payment_terms_days}
              onChange={(e) => update('default_payment_terms_days', parseInt(e.target.value) || 0)}
              className={styles.input}
            />
          </Field>
        </div>
      </section>

      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notatki</h2>
        <textarea
          value={formData.notes}
          onChange={(e) => update('notes', e.target.value)}
          rows={4}
          className={styles.textarea}
          placeholder="Specjalizacja, warunki współpracy, kontakty handlowe..."
        />
      </section>
    </div>
  );
}

function Field({
  label,
  children,
  wide = false,
}: {
  label: string;
  children: React.ReactNode;
  wide?: boolean;
}) {
  return (
    <div className={`${styles.field} ${wide ? styles.fieldWide : ''}`}>
      <label className={styles.label}>{label}</label>
      {children}
    </div>
  );
}
