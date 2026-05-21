'use client';

import { useState, useEffect, useRef } from 'react';
import { updateClientAction } from './actions';
import styles from './ClientPage.module.css';

interface Client {
  id: string;
  company_name?: string | null;
  nip?: string | null;
  contact_person: string;
  email: string;
  phone?: string | null;
  address_street?: string | null;
  address_city?: string | null;
  address_postal_code?: string | null;
  address_country?: string | null;
  notes?: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function ClientEditForm({ client }: { client: Client }) {
  const [formData, setFormData] = useState({
    company_name: client.company_name || '',
    nip: client.nip || '',
    contact_person: client.contact_person,
    email: client.email,
    phone: client.phone || '',
    address_street: client.address_street || '',
    address_postal_code: client.address_postal_code || '',
    address_city: client.address_city || '',
    notes: client.notes || '',
  });

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Auto-save z debounce 1s
  useEffect(() => {
    // Skip pierwszego renderu (po hydracji)
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }

    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateClientAction(client.id, formData);
      if (result.ok) {
        setStatus('saved');
        setErrorMsg(null);
        // Ukryj "Zapisano" po 2 sek
        setTimeout(() => setStatus('idle'), 2000);
      } else {
        setStatus('error');
        setErrorMsg(result.error || 'Nie udało się zapisać');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData]);

  const updateField = (field: keyof typeof formData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <div className={styles.editForm}>
      <div className={styles.saveIndicator}>
        {status === 'saving' && <span className={styles.statusSaving}>Zapisywanie…</span>}
        {status === 'saved' && <span className={styles.statusSaved}>✓ Zapisano</span>}
        {status === 'error' && (
          <span className={styles.statusError}>⚠ {errorMsg || 'Błąd zapisu'}</span>
        )}
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Nazwa firmy</label>
          <input
            type="text"
            value={formData.company_name}
            onChange={(e) => updateField('company_name', e.target.value)}
            className={styles.input}
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>NIP</label>
          <input
            type="text"
            value={formData.nip}
            onChange={(e) => updateField('nip', e.target.value)}
            className={styles.input}
            placeholder="np. 5252222222"
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>
            Osoba kontaktowa <span className={styles.required}>*</span>
          </label>
          <input
            type="text"
            value={formData.contact_person}
            onChange={(e) => updateField('contact_person', e.target.value)}
            className={styles.input}
            required
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>
            Email główny <span className={styles.required}>*</span>
          </label>
          <input
            type="email"
            value={formData.email}
            onChange={(e) => updateField('email', e.target.value)}
            className={styles.input}
            required
          />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Telefon główny</label>
          <input
            type="tel"
            value={formData.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <h3 className={styles.subTitle}>Adres</h3>

      <div className={styles.field}>
        <label className={styles.label}>Ulica i numer</label>
        <input
          type="text"
          value={formData.address_street}
          onChange={(e) => updateField('address_street', e.target.value)}
          className={styles.input}
        />
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label className={styles.label}>Kod pocztowy</label>
          <input
            type="text"
            value={formData.address_postal_code}
            onChange={(e) => updateField('address_postal_code', e.target.value)}
            className={styles.input}
            placeholder="00-000"
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Miasto</label>
          <input
            type="text"
            value={formData.address_city}
            onChange={(e) => updateField('address_city', e.target.value)}
            className={styles.input}
          />
        </div>
      </div>

      <h3 className={styles.subTitle}>Notatki</h3>
      <textarea
        value={formData.notes}
        onChange={(e) => updateField('notes', e.target.value)}
        rows={4}
        className={styles.textarea}
      />
    </div>
  );
}
