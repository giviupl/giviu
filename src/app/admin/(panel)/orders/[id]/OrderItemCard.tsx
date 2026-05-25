'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { updateOrderItemAction, deleteOrderItemAction } from '../actions';
import OrderItemCosts, { type ItemCost } from './OrderItemCosts';
import styles from './OrderEditor.module.css';

interface OrderItem {
  id: string;
  product_id: string | null;
  product_name: string;
  product_brand: string | null;
  product_code: string | null;
  product_color_name: string | null;
  product_color_hex: string | null;
  product_image_url: string | null;
  product_description: string | null;
  quantity: number;
  unit_price: number;
  total_price: number;
  purchase_price: number;
  extra_costs_per_unit: number;
  transport_cost_total: number;
  vat_rate: number;
  unit_price_gross: number;
  total_price_gross: number;
}

interface SupplierOption {
  id: string;
  name: string;
  short_name: string | null;
}

interface Props {
  item: OrderItem;
  orderId: string;
  initialCosts: ItemCost[];
  suppliers: SupplierOption[];
  onUpdate: (updates: Partial<OrderItem>) => void;
  onDelete: () => void;
  onCostsChanged: (itemId: string, costs: ItemCost[]) => void;
  onSupplierAdded: (supplier: SupplierOption) => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function OrderItemCard({
  item,
  orderId,
  initialCosts,
  suppliers,
  onUpdate,
  onDelete,
  onCostsChanged,
  onSupplierAdded,
}: Props) {
  const [values, setValues] = useState({
    quantity: item.quantity,
    unit_price: Number(item.unit_price || 0),
    purchase_price: Number(item.purchase_price || 0),
    extra_costs_per_unit: Number(item.extra_costs_per_unit || 0),
    transport_cost_total: Number(item.transport_cost_total || 0),
    vat_rate: Number(item.vat_rate || 23),
  });

  const [costs, setCosts] = useState<ItemCost[]>(initialCosts);
  const [showCosts, setShowCosts] = useState(initialCosts.length > 0);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDescription, setShowDescription] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  const hasCosts = costs.length > 0;
  const qty = Math.max(1, values.quantity);

  // Obliczenia
  // - Sprzedaż:
  const unitGross = values.unit_price * (1 + values.vat_rate / 100);
  const totalNet = values.unit_price * qty;
  const totalGross = totalNet * (1 + values.vat_rate / 100);

  // - Koszt: jeśli są pod-pozycje, suma. Inaczej kalkulator klasyczny.
  const costFromBreakdown = costs.reduce((s, c) => s + Number(c.total_net || 0), 0);
  const costClassicPerUnit =
    values.purchase_price + values.extra_costs_per_unit + values.transport_cost_total / qty;
  const costClassicTotal = costClassicPerUnit * qty;

  const totalCost = hasCosts ? costFromBreakdown : costClassicTotal;
  const costPerUnit = hasCosts ? totalCost / qty : costClassicPerUnit;

  // - Zysk
  const profitTotal = totalNet - totalCost;
  const isBelowCost = values.unit_price < costPerUnit && costPerUnit > 0;
  const isNegativeProfit = profitTotal < 0;

  // Auto-save pól kalkulatora
  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateOrderItemAction(item.id, values);
      if (result.ok) {
        setStatus('saved');
        if (result.calculated) {
          onUpdate({
            ...values,
            unit_price: Number(result.calculated.unit_price),
            total_price: Number(result.calculated.total_price),
            unit_price_gross: Number(result.calculated.unit_price_gross),
            total_price_gross: Number(result.calculated.total_price_gross),
          });
        }
        setTimeout(() => setStatus('idle'), 1500);
      } else {
        setStatus('error');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handleDelete = async () => {
    setIsDeleting(true);
    const result = await deleteOrderItemAction(item.id, orderId);
    if (result.ok) {
      onDelete();
    } else {
      setIsDeleting(false);
    }
  };

  // Edycja ceny BRUTTO -> reverse-calc na netto
  const handleUnitGrossChange = (newGross: number) => {
    const vatFactor = 1 + values.vat_rate / 100;
    if (vatFactor <= 0) return;
    const newNet = newGross / vatFactor;
    setValues((prev) => ({ ...prev, unit_price: round2(newNet) }));
  };

  // Lokalne aktualizacje pod-pozycji
  const handleCostsChanged = (newCosts: ItemCost[]) => {
    setCosts(newCosts);
    onCostsChanged(item.id, newCosts);
  };

  return (
    <article className={styles.itemCard}>
      <div className={styles.itemHeader}>
        <div className={styles.itemImageWrap}>
          {item.product_image_url ? (
            <Image
              src={item.product_image_url}
              alt={item.product_name}
              width={80}
              height={80}
              className={styles.itemImage}
            />
          ) : (
            <div className={styles.itemImagePlaceholder}>📦</div>
          )}
        </div>

        <div className={styles.itemMain}>
          {item.product_brand && (
            <div className={styles.itemBrand}>{item.product_brand.toUpperCase()}</div>
          )}
          <div className={styles.itemNameReadonly}>{item.product_name}</div>
          {item.product_color_name && (
            <div className={styles.itemColor}>
              <span
                className={styles.itemColorDot}
                style={{ backgroundColor: item.product_color_hex || '#999' }}
              />
              {item.product_color_name}
            </div>
          )}
          {item.product_code && (
            <div className={styles.itemCode}>Kod: {item.product_code}</div>
          )}
        </div>

        <div className={styles.itemActions}>
          <div className={styles.itemSaveStatus}>
            {status === 'saving' && <span className={styles.statusSaving}>Zapisywanie…</span>}
            {status === 'saved' && <span className={styles.statusSaved}>✓</span>}
            {status === 'error' && <span className={styles.statusError}>⚠</span>}
          </div>
          <button
            type="button"
            onClick={handleDelete}
            className={styles.itemDeleteBtn}
            disabled={isDeleting}
            title="Usuń pozycję"
          >
            ✕
          </button>
        </div>
      </div>

      {item.product_description && !showDescription && (
        <button
          type="button"
          onClick={() => setShowDescription(true)}
          className={styles.itemDescToggle}
        >
          Pokaż opis ▾
        </button>
      )}

      {showDescription && item.product_description && (
        <div className={styles.itemDetails}>
          <div className={styles.itemDescriptionReadonly}>{item.product_description}</div>
          <button
            type="button"
            onClick={() => setShowDescription(false)}
            className={styles.itemDescToggle}
          >
            Zwiń ▴
          </button>
        </div>
      )}

      <div className={styles.itemCalculator}>
        <div className={styles.itemCalcInputs}>
          <NumField
            label="Ilość"
            value={values.quantity}
            step={1}
            onChange={(v) => setValues({ ...values, quantity: v })}
          />
          <NumField
            label="Cena netto/szt"
            value={values.unit_price}
            step={0.01}
            suffix="zł"
            highlight={isBelowCost ? 'error' : undefined}
            onChange={(v) => setValues({ ...values, unit_price: v })}
          />
          <NumField
            label="Cena brutto/szt"
            value={round2(unitGross)}
            step={0.01}
            suffix="zł"
            highlight={isBelowCost ? 'error' : undefined}
            onChange={handleUnitGrossChange}
          />
          <NumField
            label="VAT"
            value={values.vat_rate}
            step={1}
            suffix="%"
            onChange={(v) => setValues({ ...values, vat_rate: v })}
          />
          {!hasCosts && (
            <>
              <NumField
                label="Cena zakupu/szt"
                value={values.purchase_price}
                step={0.01}
                suffix="zł"
                onChange={(v) => setValues({ ...values, purchase_price: v })}
              />
              <NumField
                label="Znakowanie/szt"
                value={values.extra_costs_per_unit}
                step={0.01}
                suffix="zł"
                onChange={(v) => setValues({ ...values, extra_costs_per_unit: v })}
              />
              <NumField
                label="Transport (całość)"
                value={values.transport_cost_total}
                step={0.01}
                suffix="zł"
                onChange={(v) => setValues({ ...values, transport_cost_total: v })}
              />
            </>
          )}
        </div>

        <div className={styles.itemCalcResults}>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>
              {hasCosts ? 'Koszt/szt (z pod-poz.)' : 'Koszt/szt'}
            </span>
            <strong className={styles.calcResultValue}>
              {round2(costPerUnit).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Wartość netto</span>
            <strong
              className={`${styles.calcResultValue} ${isBelowCost ? styles.calcResultError : ''}`}
            >
              {round2(totalNet).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Wartość brutto</span>
            <strong
              className={`${styles.calcResultValue} ${styles.calcResultLg} ${isBelowCost ? styles.calcResultError : ''}`}
            >
              {round2(totalGross).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Łączny koszt</span>
            <strong className={`${styles.calcResultValue} ${styles.calcResultCost}`}>
              {round2(totalCost).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={`${styles.calcResult} ${styles.calcResultProfit}`}>
            <span className={styles.calcResultLabel}>Zysk pozycji</span>
            <strong
              className={`${styles.calcResultValue} ${isNegativeProfit ? styles.calcResultError : ''}`}
            >
              {round2(profitTotal).toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
        </div>
      </div>

      {/* SEKCJA POD-POZYCJI KOSZTOWYCH */}
      {!showCosts && !hasCosts && (
        <button
          type="button"
          onClick={() => setShowCosts(true)}
          className={styles.expandCostsBtn}
        >
          ▾ Rozpisz koszty na pod-pozycje (różni dostawcy)
        </button>
      )}

      {(showCosts || hasCosts) && (
        <OrderItemCosts
          orderItemId={item.id}
          orderId={orderId}
          initialCosts={costs}
          suppliers={suppliers}
          onCostsChanged={handleCostsChanged}
          onSupplierAdded={onSupplierAdded}
        />
      )}
    </article>
  );
}

function NumField({
  label,
  value,
  step,
  suffix,
  onChange,
  highlight,
}: {
  label: string;
  value: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
  highlight?: 'error';
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const inputClass = [styles.numFieldInput, highlight === 'error' ? styles.numFieldInputError : '']
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.numFieldWrap}>
      <label className={styles.numFieldLabel}>{label}</label>
      <div className={styles.numFieldInputWrap}>
        <input
          type="number"
          value={text}
          step={step}
          min={0}
          onChange={(e) => {
            setText(e.target.value);
            const num = parseFloat(e.target.value);
            if (!isNaN(num)) onChange(num);
            else if (e.target.value === '') onChange(0);
          }}
          onBlur={() => setText(String(value))}
          className={inputClass}
        />
        {suffix && <span className={styles.numFieldSuffix}>{suffix}</span>}
      </div>
    </div>
  );
}
