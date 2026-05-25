'use client';

import { useState, useTransition } from 'react';
import Image from 'next/image';
import { addOfferVariantAction, deleteOfferItemsAction } from './actions';
import { useConfirm } from '@/components/admin/ConfirmProvider';
import VariantRow, { type SaveStatus } from './VariantRow';
import styles from './OfferEditor.module.css';

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

interface Props {
  items: OfferItem[]; // 1+ wariantów tej samej pozycji
  offerId: string;
  onVariantAdded: (item: OfferItem) => void;
  onItemUpdate: (itemId: string, updates: Partial<OfferItem>) => void;
  onItemsDeleted: (itemIds: string[]) => void;
}

export default function OfferItemGroup({
  items,
  offerId,
  onVariantAdded,
  onItemUpdate,
  onItemsDeleted,
}: Props) {
  const confirm = useConfirm();
  const [isAddingVariant, startAddVariantTransition] = useTransition();
  const [isDeletingGroup, startDeleteGroupTransition] = useTransition();
  const [rowStatuses, setRowStatuses] = useState<Record<string, SaveStatus>>({});
  const [showDescription, setShowDescription] = useState(false);

  // Header bierzemy z PIERWSZEGO wariantu — wszystkie mają te same dane produktu
  const header = items[0];
  const hasMultipleVariants = items.length > 1;

  // Agregat statusów wszystkich wariantów (do wyświetlenia jeden status na grupę)
  const aggregateStatus: SaveStatus = (() => {
    const statuses = Object.values(rowStatuses);
    if (statuses.includes('error')) return 'error';
    if (statuses.includes('saving')) return 'saving';
    if (statuses.includes('saved')) return 'saved';
    return 'idle';
  })();

  const handleAddVariant = () => {
    startAddVariantTransition(async () => {
      // Bierzemy ostatni wariant jako source (najświeższe wartości)
      const sourceItem = items[items.length - 1];
      const result = await addOfferVariantAction(sourceItem.id);
      if (result.ok && result.item) {
        onVariantAdded(result.item as OfferItem);
      }
    });
  };

  const handleDeleteGroup = async () => {
    const ok = await confirm({
      title: hasMultipleVariants ? 'Usunąć tę pozycję z ofertą?' : 'Usunąć tę pozycję?',
      message: hasMultipleVariants
        ? `Usuniętych zostanie ${items.length} wariantów cenowych.`
        : 'Tej akcji nie da się cofnąć.',
      confirmLabel: 'Usuń',
      variant: 'danger',
    });
    if (!ok) return;

    startDeleteGroupTransition(async () => {
      const itemIds = items.map((i) => i.id);
      const result = await deleteOfferItemsAction(itemIds, offerId);
      if (result.ok) {
        onItemsDeleted(itemIds);
      }
    });
  };

  const handleDeleteSingleVariant = async (itemId: string) => {
    // Delete pojedynczego wariantu (nie ostatniego — bo wtedy zablokowane przez canDelete=false)
    startDeleteGroupTransition(async () => {
      const result = await deleteOfferItemsAction([itemId], offerId);
      if (result.ok) {
        onItemsDeleted([itemId]);
      }
    });
  };

  const setRowStatus = (itemId: string, status: SaveStatus) => {
    setRowStatuses((prev) => ({ ...prev, [itemId]: status }));
  };

  return (
    <article className={styles.itemCard}>
      {/* Header — produkt read-only */}
      <div className={styles.itemHeader}>
        <div className={styles.itemImageWrap}>
          {header.product_image_url ? (
            <Image
              src={header.product_image_url}
              alt={header.product_name}
              width={80}
              height={80}
              className={styles.itemImage}
            />
          ) : (
            <div className={styles.itemImagePlaceholder}>📦</div>
          )}
        </div>

        <div className={styles.itemMain}>
          {header.product_brand && (
            <div className={styles.itemBrand}>{header.product_brand.toUpperCase()}</div>
          )}
          {/* NAZWA — READ-ONLY (B1: usunięty input) */}
          <div className={styles.itemNameReadonly}>{header.product_name}</div>
          {header.product_color_name && (
            <div className={styles.itemColor}>
              <span
                className={styles.itemColorDot}
                style={{ backgroundColor: header.product_color_hex || '#999' }}
              />
              {header.product_color_name}
            </div>
          )}
          {header.product_code && (
            <div className={styles.itemCode}>Kod: {header.product_code}</div>
          )}
        </div>

        <div className={styles.itemActions}>
          <div className={styles.itemSaveStatus}>
            {aggregateStatus === 'saving' && (
              <span className={styles.statusSaving}>Zapisywanie…</span>
            )}
            {aggregateStatus === 'saved' && <span className={styles.statusSaved}>✓ Zapisano</span>}
            {aggregateStatus === 'error' && <span className={styles.statusError}>⚠ Błąd</span>}
          </div>
          <button
            type="button"
            onClick={handleDeleteGroup}
            className={styles.itemDeleteBtn}
            disabled={isDeletingGroup}
            title="Usuń pozycję"
          >
            ✕
          </button>
        </div>
      </div>

      {header.product_description && !showDescription && (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className={styles.itemDescToggle}
        >
          Pokaż opis ▾
        </button>
      )}

      {showDescription && header.product_description && (
        <div className={styles.itemDetails}>
          <div className={styles.itemDescriptionReadonly}>{header.product_description}</div>
          <button
            type="button"
            onClick={() => setShowDescription(false)}
            className={styles.itemDescToggle}
          >
            Zwiń ▴
          </button>
        </div>
      )}

      {/* Tabela wariantów */}
      <div className={styles.variantsWrap}>
        <table className={styles.variantsTable}>
          <thead>
            <tr>
              <th className={styles.variantIdxCol}>#</th>
              <th>Ilość</th>
              <th>Cena zakupu</th>
              <th>Marża</th>
              <th>Znakowanie</th>
              <th>Transport</th>
              <th>VAT</th>
              <th>Cena netto/szt</th>
              <th className={styles.variantNumColHead}>Wartość netto</th>
              <th className={styles.variantNumColHead}>Zysk</th>
              <th className={styles.variantActionCol}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <VariantRow
                key={item.id}
                item={item}
                index={idx + 1}
                canDelete={hasMultipleVariants}
                onUpdate={(updates) => onItemUpdate(item.id, updates)}
                onDelete={() => handleDeleteSingleVariant(item.id)}
                onStatusChange={(status) => setRowStatus(item.id, status)}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* + Dodaj wariant cenowy */}
      <button
        type="button"
        onClick={handleAddVariant}
        className={styles.addVariantBtn}
        disabled={isAddingVariant}
      >
        {isAddingVariant ? 'Dodawanie…' : '+ Dodaj wariant cenowy'}
      </button>
    </article>
  );
}
