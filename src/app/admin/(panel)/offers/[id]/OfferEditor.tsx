'use client';

import { useState, useEffect, useRef } from 'react';
import { updateOfferAction, deleteOfferItemAction } from './actions';
import ClientSelector from './ClientSelector';
import ProductSearch from './ProductSearch';
import OfferItemCard from './OfferItemCard';
import styles from './OfferEditor.module.css';

const STATUS_OPTIONS = [
  { value: 'draft', label: 'Robocza' },
  { value: 'sent', label: 'Wysłana' },
  { value: 'accepted', label: 'Zaakceptowana' },
  { value: 'rejected', label: 'Odrzucona' },
  { value: 'expired', label: 'Wygasła' },
];

interface Offer {
  id: string;
  offer_number: string;
  status: string;
  client_id: string | null;
  client_company: string | null;
  client_person: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_nip: string | null;
  valid_until: string | null;
  notes: string | null;
  pdf_notes: string | null;
}

interface OfferItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_brand: string | null;
  product_description: string | null;
  product_image_url: string | null;
  product_color_name: string | null;
  product_color_hex: string | null;
  product_code: string | null;
  quantity: number;
  purchase_price: number;
  margin_percent: number;
  extra_costs_per_unit: number;
  transport_cost_total: number;
  vat_rate: number;
  unit_price: number;
  total_price: number;
  unit_price_gross: number;
  total_price_gross: number;
  profit_per_unit: number;
  profit_total: number;
  sort_order: number;
}

interface Contact {
  id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

export default function OfferEditor({
  offer,
  initialItems,
  initialContacts,
}: {
  offer: Offer;
  initialItems: OfferItem[];
  initialContacts: Contact[];
}) {
  const [items, setItems] = useState<OfferItem[]>(initialItems);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);

  const [formData, setFormData] = useState({
    status: offer.status,
    valid_until: offer.valid_until || '',
    notes: offer.notes || '',
    pdf_notes: offer.pdf_notes || '',
  });

  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Auto-save oferty (status, valid_until, notes)
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateOfferAction(offer.id, formData);
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

  const handleItemUpdate = (itemId: string, updates: Partial<OfferItem>) => {
    setItems((prev) =>
      prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)),
    );
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Usunąć tę pozycję z oferty?')) return;
    const result = await deleteOfferItemAction(itemId, offer.id);
    if (result.ok) {
      setItems((prev) => prev.filter((i) => i.id !== itemId));
    }
  };

  const handleItemAdded = (newItem: OfferItem) => {
    setItems((prev) => [...prev, newItem]);
  };

  const handleClientChanged = (
    updatedOffer: Partial<Offer>,
    newContacts: Contact[],
  ) => {
    // Server już zapisał, tutaj tylko aktualizujemy lokalny stan na potrzeby UI
    if (updatedOffer.client_id !== undefined) {
      offer.client_id = updatedOffer.client_id;
      offer.client_company = updatedOffer.client_company ?? null;
      offer.client_person = updatedOffer.client_person ?? null;
      offer.client_email = updatedOffer.client_email ?? null;
      offer.client_phone = updatedOffer.client_phone ?? null;
      offer.client_nip = updatedOffer.client_nip ?? null;
    }
    setContacts(newContacts);
  };

  // Sumy
  const totalNet = items.reduce((s, i) => s + Number(i.total_price || 0), 0);
  const totalGross = items.reduce((s, i) => s + Number(i.total_price_gross || 0), 0);
  const totalVat = totalGross - totalNet;
  const totalProfit = items.reduce((s, i) => s + Number(i.profit_total || 0), 0);

  return (
    <div className={styles.editor}>
      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusBarLeft}>
          <label className={styles.label}>Status oferty</label>
          <select
            value={formData.status}
            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
            className={styles.statusSelect}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>

          <label className={styles.label} style={{ marginLeft: 24 }}>
            Ważna do
          </label>
          <input
            type="date"
            value={formData.valid_until}
            onChange={(e) => setFormData({ ...formData, valid_until: e.target.value })}
            className={styles.dateInput}
          />
        </div>

        <div className={styles.saveIndicator}>
          {status === 'saving' && <span className={styles.statusSaving}>Zapisywanie…</span>}
          {status === 'saved' && <span className={styles.statusSaved}>✓ Zapisano</span>}
          {status === 'error' && <span className={styles.statusError}>⚠ Błąd zapisu</span>}
        </div>
      </div>

      {/* KLIENT */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Klient</h2>
        <ClientSelector
          offerId={offer.id}
          currentClientId={offer.client_id}
          currentClientCompany={offer.client_company}
          currentClientPerson={offer.client_person}
          currentClientEmail={offer.client_email}
          currentClientPhone={offer.client_phone}
          currentClientNip={offer.client_nip}
          contacts={contacts}
          onClientChanged={handleClientChanged}
        />
      </section>

      {/* POZYCJE */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pozycje <span className={styles.count}>({items.length})</span>
        </h2>

        {items.length === 0 && (
          <p className={styles.emptyText}>
            Brak pozycji. Wyszukaj produkt poniżej albo dodaj ręcznie.
          </p>
        )}

        <div className={styles.itemsList}>
          {items.map((item) => (
            <OfferItemCard
              key={item.id}
              item={item}
              onUpdate={(updates) => handleItemUpdate(item.id, updates)}
              onDelete={() => handleDeleteItem(item.id)}
            />
          ))}
        </div>

        <ProductSearch offerId={offer.id} onItemAdded={handleItemAdded} />
      </section>

      {/* NOTATKI */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notatki</h2>
        <div className={styles.row}>
          <div className={styles.field}>
            <label className={styles.label}>Notatki wewnętrzne (nie widoczne w PDF)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className={styles.textarea}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Uwagi do PDF (widoczne dla klienta)</label>
            <textarea
              value={formData.pdf_notes}
              onChange={(e) => setFormData({ ...formData, pdf_notes: e.target.value })}
              rows={3}
              className={styles.textarea}
            />
          </div>
        </div>
      </section>

      {/* STICKY TOTALS BAR */}
      {items.length > 0 && (
        <div className={styles.totalsBar}>
          <div className={styles.totalsBlock}>
            <span className={styles.totalsLabel}>Netto</span>
            <strong className={styles.totalsValue}>
              {totalNet.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.totalsBlock}>
            <span className={styles.totalsLabel}>VAT</span>
            <strong className={styles.totalsValue}>
              {totalVat.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.totalsBlock}>
            <span className={styles.totalsLabel}>Brutto</span>
            <strong className={`${styles.totalsValue} ${styles.totalsValueLg}`}>
              {totalGross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={`${styles.totalsBlock} ${styles.totalsProfit}`}>
            <span className={styles.totalsLabel}>Zysk</span>
            <strong className={styles.totalsValue}>
              {totalProfit.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
        </div>
      )}
    </div>
  );
}
