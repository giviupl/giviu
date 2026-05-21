'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { updateOfferItemAction } from './actions';
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
  item: OfferItem;
  onUpdate: (updates: Partial<OfferItem>) => void;
  onDelete: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Lokalna replikacja formuły z SQL (dla real-time UI)
function calculate(item: {
  quantity: number;
  purchase_price: number;
  margin_percent: number;
  extra_costs_per_unit: number;
  transport_cost_total: number;
  vat_rate: number;
}) {
  const qty = Math.max(1, item.quantity);
  const costPerUnit =
    item.purchase_price + item.extra_costs_per_unit + item.transport_cost_total / qty;
  const unitPriceNet = costPerUnit * (1 + item.margin_percent / 100);
  const unitPriceGross = unitPriceNet * (1 + item.vat_rate / 100);
  const totalNet = unitPriceNet * qty;
  const totalGross = unitPriceGross * qty;
  const profitPerUnit = costPerUnit * (item.margin_percent / 100);
  const profitTotal = profitPerUnit * qty;

  return {
    unit_price: Math.round(unitPriceNet * 100) / 100,
    unit_price_gross: Math.round(unitPriceGross * 100) / 100,
    total_price: Math.round(totalNet * 100) / 100,
    total_price_gross: Math.round(totalGross * 100) / 100,
    profit_per_unit: Math.round(profitPerUnit * 100) / 100,
    profit_total: Math.round(profitTotal * 100) / 100,
  };
}

export default function OfferItemCard({ item, onUpdate, onDelete }: Props) {
  const [values, setValues] = useState({
    quantity: item.quantity,
    purchase_price: Number(item.purchase_price),
    margin_percent: Number(item.margin_percent),
    extra_costs_per_unit: Number(item.extra_costs_per_unit),
    transport_cost_total: Number(item.transport_cost_total),
    vat_rate: Number(item.vat_rate),
    product_name: item.product_name,
    product_description: item.product_description || '',
  });

  const [showDetails, setShowDetails] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  const calc = calculate(values);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    setStatus('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateOfferItemAction(item.id, values);
      if (result.ok) {
        setStatus('saved');
        // Synchronizuj wyliczenia z serwerem
        if (result.calculated) {
          onUpdate({
            quantity: values.quantity,
            purchase_price: values.purchase_price,
            margin_percent: values.margin_percent,
            extra_costs_per_unit: values.extra_costs_per_unit,
            transport_cost_total: values.transport_cost_total,
            vat_rate: values.vat_rate,
            product_name: values.product_name,
            product_description: values.product_description,
            unit_price: Number(result.calculated.unit_price),
            unit_price_gross: Number(result.calculated.unit_price_gross),
            total_price: Number(result.calculated.total_price),
            total_price_gross: Number(result.calculated.total_price_gross),
            profit_total: Number(result.calculated.profit_total),
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
          <input
            type="text"
            value={values.product_name}
            onChange={(e) => setValues({ ...values, product_name: e.target.value })}
            className={styles.itemNameInput}
          />
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
            onClick={onDelete}
            className={styles.itemDeleteBtn}
            title="Usuń pozycję"
          >
            ✕
          </button>
        </div>
      </div>

      {item.product_description && !showDetails && (
        <button
          type="button"
          onClick={() => setShowDetails(true)}
          className={styles.itemDescToggle}
        >
          Pokaż opis ▾
        </button>
      )}

      {showDetails && (
        <div className={styles.itemDetails}>
          <label className={styles.label}>Opis</label>
          <textarea
            value={values.product_description}
            onChange={(e) => setValues({ ...values, product_description: e.target.value })}
            rows={4}
            className={styles.textarea}
          />
          <button
            type="button"
            onClick={() => setShowDetails(false)}
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
            label="Cena zakupu /szt"
            value={values.purchase_price}
            step={0.01}
            suffix="zł"
            onChange={(v) => setValues({ ...values, purchase_price: v })}
          />
          <NumField
            label="Marża"
            value={values.margin_percent}
            step={0.5}
            suffix="%"
            onChange={(v) => setValues({ ...values, margin_percent: v })}
          />
          <NumField
            label="Znakowanie /szt"
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
          <NumField
            label="VAT"
            value={values.vat_rate}
            step={1}
            suffix="%"
            onChange={(v) => setValues({ ...values, vat_rate: v })}
          />
        </div>

        <div className={styles.itemCalcResults}>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Cena /szt netto</span>
            <strong className={styles.calcResultValue}>
              {calc.unit_price.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Cena /szt brutto</span>
            <strong className={styles.calcResultValue}>
              {calc.unit_price_gross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Wartość netto</span>
            <strong className={styles.calcResultValue}>
              {calc.total_price.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
          <div className={styles.calcResult}>
            <span className={styles.calcResultLabel}>Wartość brutto</span>
            <strong className={`${styles.calcResultValue} ${styles.calcResultLg}`}>
              {calc.total_price_gross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })}{' '}
              zł
            </strong>
          </div>
          <div className={`${styles.calcResult} ${styles.calcResultProfit}`}>
            <span className={styles.calcResultLabel}>Zysk pozycji</span>
            <strong className={styles.calcResultValue}>
              {calc.profit_total.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
            </strong>
          </div>
        </div>
      </div>
    </article>
  );
}

// =====================================
// NumField - reusable input liczbowy
// =====================================
function NumField({
  label,
  value,
  step,
  suffix,
  onChange,
}: {
  label: string;
  value: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

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
          className={styles.numFieldInput}
        />
        {suffix && <span className={styles.numFieldSuffix}>{suffix}</span>}
      </div>
    </div>
  );
}
