'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { convertOfferToOrderAction } from '../../../orders/actions';
import styles from './ConvertForm.module.css';

interface Offer {
  id: string;
  offer_number: string;
  client_company: string | null;
  client_person: string | null;
}

interface OfferItem {
  id: string;
  product_name: string;
  product_brand: string | null;
  product_image_url: string | null;
  product_color_name: string | null;
  product_color_hex: string | null;
  product_code: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface ItemEdit {
  include: boolean;
  quantity: number;
  unit_price: number;
}

export default function ConvertForm({
  offer,
  items,
}: {
  offer: Offer;
  items: OfferItem[];
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const [productionDeadline, setProductionDeadline] = useState('');
  const [deliveryDeadline, setDeliveryDeadline] = useState('');

  const [edits, setEdits] = useState<Record<string, ItemEdit>>(() => {
    const initial: Record<string, ItemEdit> = {};
    items.forEach((it) => {
      initial[it.id] = {
        include: true,
        quantity: it.quantity,
        unit_price: Number(it.unit_price || 0),
      };
    });
    return initial;
  });

  const updateEdit = (id: string, patch: Partial<ItemEdit>) => {
    setEdits((prev) => ({ ...prev, [id]: { ...prev[id], ...patch } }));
  };

  const includedItems = items.filter((it) => edits[it.id]?.include);
  const totalValue = includedItems.reduce((sum, it) => {
    const edit = edits[it.id];
    return sum + edit.quantity * edit.unit_price;
  }, 0);

  const handleSubmit = () => {
    if (includedItems.length === 0) {
      setError('Wybierz przynajmniej jedną pozycję do przeniesienia.');
      return;
    }
    setError(null);

    const includeItemIds = includedItems.map((it) => it.id);
    const itemOverrides: Record<string, { quantity?: number; unit_price?: number }> = {};
    includedItems.forEach((it) => {
      const edit = edits[it.id];
      const changed: { quantity?: number; unit_price?: number } = {};
      if (edit.quantity !== it.quantity) changed.quantity = edit.quantity;
      if (Math.abs(edit.unit_price - Number(it.unit_price || 0)) > 0.001) {
        changed.unit_price = edit.unit_price;
      }
      if (Object.keys(changed).length > 0) {
        itemOverrides[it.id] = changed;
      }
    });

    startTransition(async () => {
      const result = await convertOfferToOrderAction({
        offerId: offer.id,
        includeItemIds,
        productionDeadline: productionDeadline || null,
        deliveryDeadline: deliveryDeadline || null,
        itemOverrides,
      });

      if (result.ok && result.orderId) {
        router.push(`/admin/orders/${result.orderId}`);
      } else {
        setError(result.error || 'Nie udało się utworzyć zamówienia');
      }
    });
  };

  if (items.length === 0) {
    return (
      <div className={styles.emptyState}>
        <p>Ta oferta nie ma żadnych pozycji. Wróć i dodaj produkty zanim konwertujesz.</p>
      </div>
    );
  }

  return (
    <div className={styles.form}>
      {/* Klient (read-only info) */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Klient</h2>
        <div className={styles.clientInfo}>
          <strong>{offer.client_company || '—'}</strong>
          {offer.client_person && <div className={styles.clientSub}>{offer.client_person}</div>}
        </div>
      </section>

      {/* Daty realizacji */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Daty realizacji</h2>
        <div className={styles.datesRow}>
          <div className={styles.field}>
            <label className={styles.label}>Deadline produkcji</label>
            <input
              type="date"
              value={productionDeadline}
              onChange={(e) => setProductionDeadline(e.target.value)}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Deadline dostawy</label>
            <input
              type="date"
              value={deliveryDeadline}
              onChange={(e) => setDeliveryDeadline(e.target.value)}
              className={styles.dateInput}
            />
          </div>
        </div>
      </section>

      {/* Pozycje do przeniesienia */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pozycje do przeniesienia{' '}
          <span className={styles.count}>
            ({includedItems.length} z {items.length})
          </span>
        </h2>

        <div className={styles.itemsList}>
          {items.map((it) => {
            const edit = edits[it.id];
            return (
              <div
                key={it.id}
                className={`${styles.itemRow} ${!edit.include ? styles.itemRowExcluded : ''}`}
              >
                <label className={styles.checkboxWrap}>
                  <input
                    type="checkbox"
                    checked={edit.include}
                    onChange={(e) => updateEdit(it.id, { include: e.target.checked })}
                    className={styles.checkbox}
                  />
                </label>

                <div className={styles.itemImageWrap}>
                  {it.product_image_url ? (
                    <Image
                      src={it.product_image_url}
                      alt={it.product_name}
                      width={56}
                      height={56}
                      className={styles.itemImage}
                    />
                  ) : (
                    <div className={styles.itemImagePlaceholder}>📦</div>
                  )}
                </div>

                <div className={styles.itemMain}>
                  {it.product_brand && (
                    <div className={styles.itemBrand}>{it.product_brand.toUpperCase()}</div>
                  )}
                  <div className={styles.itemName}>{it.product_name}</div>
                  {it.product_color_name && (
                    <div className={styles.itemColor}>
                      <span
                        className={styles.itemColorDot}
                        style={{ backgroundColor: it.product_color_hex || '#999' }}
                      />
                      {it.product_color_name}
                    </div>
                  )}
                  {it.product_code && <div className={styles.itemCode}>Kod: {it.product_code}</div>}
                </div>

                <div className={styles.itemEditFields}>
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Ilość</label>
                    <input
                      type="number"
                      min={1}
                      value={edit.quantity}
                      onChange={(e) =>
                        updateEdit(it.id, { quantity: parseInt(e.target.value) || 1 })
                      }
                      className={styles.editInput}
                      disabled={!edit.include}
                    />
                  </div>
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Cena netto/szt</label>
                    <input
                      type="number"
                      step={0.01}
                      min={0}
                      value={edit.unit_price}
                      onChange={(e) =>
                        updateEdit(it.id, { unit_price: parseFloat(e.target.value) || 0 })
                      }
                      className={styles.editInput}
                      disabled={!edit.include}
                    />
                  </div>
                  <div className={styles.editField}>
                    <label className={styles.editLabel}>Wartość</label>
                    <div className={styles.editValue}>
                      {(edit.quantity * edit.unit_price).toLocaleString('pl-PL', {
                        minimumFractionDigits: 2,
                      })}{' '}
                      zł
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Podsumowanie + akcja */}
      <div className={styles.footer}>
        <div className={styles.totalBlock}>
          <span className={styles.totalLabel}>Łączna wartość netto</span>
          <strong className={styles.totalValue}>
            {totalValue.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
          </strong>
        </div>

        {error && <div className={styles.errorMsg}>{error}</div>}

        <div className={styles.actions}>
          <button
            type="button"
            onClick={() => router.push(`/admin/offers/${offer.id}`)}
            className={styles.btnSecondary}
            disabled={isPending}
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={styles.btnPrimary}
            disabled={isPending || includedItems.length === 0}
          >
            {isPending ? 'Tworzenie zamówienia…' : `Utwórz zamówienie (${includedItems.length} poz.)`}
          </button>
        </div>
      </div>
    </div>
  );
}
