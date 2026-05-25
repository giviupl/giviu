'use client';

import { useState, useEffect, useRef } from 'react';
import { updateOfferItemAction } from './actions';
import styles from './OfferEditor.module.css';

interface OfferItem {
  id: string;
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
}

interface Props {
  item: OfferItem;
  index: number; // numer wariantu w grupie (1, 2, 3...)
  canDelete: boolean; // false = ostatni wariant w grupie (delete idzie przez group delete)
  onUpdate: (updates: Partial<OfferItem>) => void;
  onDelete: () => void;
  onStatusChange: (status: SaveStatus) => void;
}

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

// Pełny koszt nabycia per szt
function costPerUnit(v: {
  quantity: number;
  purchase_price: number;
  extra_costs_per_unit: number;
  transport_cost_total: number;
}): number {
  const qty = Math.max(1, v.quantity);
  return v.purchase_price + v.extra_costs_per_unit + v.transport_cost_total / qty;
}

function calculate(v: {
  quantity: number;
  purchase_price: number;
  margin_percent: number;
  extra_costs_per_unit: number;
  transport_cost_total: number;
  vat_rate: number;
}) {
  const qty = Math.max(1, v.quantity);
  const cost = costPerUnit(v);
  const unitPriceNet = cost * (1 + v.margin_percent / 100);
  const unitPriceGross = unitPriceNet * (1 + v.vat_rate / 100);
  const totalNet = unitPriceNet * qty;
  const totalGross = unitPriceGross * qty;
  const profitPerUnit = cost * (v.margin_percent / 100);
  const profitTotal = profitPerUnit * qty;

  return {
    unit_price: round2(unitPriceNet),
    unit_price_gross: round2(unitPriceGross),
    total_price: round2(totalNet),
    total_price_gross: round2(totalGross),
    profit_per_unit: round2(profitPerUnit),
    profit_total: round2(profitTotal),
  };
}

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export default function VariantRow({
  item,
  index,
  canDelete,
  onUpdate,
  onDelete,
  onStatusChange,
}: Props) {
  const [values, setValues] = useState({
    quantity: item.quantity,
    purchase_price: Number(item.purchase_price),
    margin_percent: Number(item.margin_percent),
    extra_costs_per_unit: Number(item.extra_costs_per_unit),
    transport_cost_total: Number(item.transport_cost_total),
    vat_rate: Number(item.vat_rate),
  });

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  const calc = calculate(values);
  const cost = costPerUnit(values);
  const isNegativeMargin = values.margin_percent < 0;
  const isBelowCost = calc.unit_price < cost && cost > 0;

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);
    onStatusChange('saving');

    timerRef.current = setTimeout(async () => {
      const result = await updateOfferItemAction(item.id, values);
      if (result.ok) {
        onStatusChange('saved');
        if (result.calculated) {
          onUpdate({
            ...values,
            unit_price: Number(result.calculated.unit_price),
            unit_price_gross: Number(result.calculated.unit_price_gross),
            total_price: Number(result.calculated.total_price),
            total_price_gross: Number(result.calculated.total_price_gross),
            profit_total: Number(result.calculated.profit_total),
          });
        }
        setTimeout(() => onStatusChange('idle'), 1500);
      } else {
        onStatusChange('error');
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handleUnitPriceChange = (newPrice: number) => {
    if (cost <= 0) {
      setValues((prev) => ({
        ...prev,
        purchase_price: round2(newPrice),
        margin_percent: 0,
      }));
      return;
    }
    const newMargin = (newPrice / cost - 1) * 100;
    setValues((prev) => ({ ...prev, margin_percent: round2(newMargin) }));
  };

  return (
    <tr className={styles.variantRow}>
      <td className={styles.variantIdxCell}>
        <span className={styles.variantIdx}>{index}</span>
      </td>
      <td>
        <CellNumInput
          value={values.quantity}
          step={1}
          onChange={(v) => setValues({ ...values, quantity: v })}
        />
      </td>
      <td>
        <CellNumInput
          value={values.purchase_price}
          step={0.01}
          suffix="zł"
          onChange={(v) => setValues({ ...values, purchase_price: v })}
        />
      </td>
      <td>
        <CellNumInput
          value={values.margin_percent}
          step={0.5}
          suffix="%"
          allowNegative
          error={isNegativeMargin}
          onChange={(v) => setValues({ ...values, margin_percent: v })}
        />
      </td>
      <td>
        <CellNumInput
          value={values.extra_costs_per_unit}
          step={0.01}
          suffix="zł"
          onChange={(v) => setValues({ ...values, extra_costs_per_unit: v })}
        />
      </td>
      <td>
        <CellNumInput
          value={values.transport_cost_total}
          step={0.01}
          suffix="zł"
          onChange={(v) => setValues({ ...values, transport_cost_total: v })}
        />
      </td>
      <td>
        <CellNumInput
          value={values.vat_rate}
          step={1}
          suffix="%"
          onChange={(v) => setValues({ ...values, vat_rate: v })}
        />
      </td>
      <td>
        <CellNumInput
          value={calc.unit_price}
          step={0.01}
          suffix="zł"
          allowNegative
          error={isBelowCost}
          highlight
          onChange={handleUnitPriceChange}
        />
      </td>
      <td className={`${styles.variantNumCell} ${isBelowCost ? styles.calcResultError : ''}`}>
        {calc.total_price.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
      </td>
      <td
        className={`${styles.variantNumCell} ${styles.variantProfitCell} ${
          isNegativeMargin ? styles.calcResultError : ''
        }`}
      >
        {calc.profit_total.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
      </td>
      <td className={styles.variantActionCell}>
        <button
          type="button"
          onClick={onDelete}
          className={styles.variantDeleteBtn}
          disabled={!canDelete}
          title={canDelete ? 'Usuń wariant' : 'Aby usunąć ostatni wariant — usuń całą pozycję'}
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

// =====================================
// CellNumInput — kompaktowy input dla wiersza tabeli
// =====================================
function CellNumInput({
  value,
  step,
  suffix,
  onChange,
  allowNegative = false,
  error = false,
  highlight = false,
}: {
  value: number;
  step: number;
  suffix?: string;
  onChange: (v: number) => void;
  allowNegative?: boolean;
  error?: boolean;
  highlight?: boolean;
}) {
  const [text, setText] = useState(String(value));

  useEffect(() => {
    setText(String(value));
  }, [value]);

  const inputClass = [
    styles.variantInput,
    suffix ? styles.variantInputWithSuffix : '',
    highlight ? styles.variantInputHighlight : '',
    error ? styles.variantInputError : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <div className={styles.variantInputWrap}>
      <input
        type="number"
        value={text}
        step={step}
        min={allowNegative ? undefined : 0}
        onChange={(e) => {
          setText(e.target.value);
          const num = parseFloat(e.target.value);
          if (!isNaN(num)) onChange(num);
          else if (e.target.value === '') onChange(0);
        }}
        onBlur={() => setText(String(value))}
        className={inputClass}
      />
      {suffix && <span className={styles.variantInputSuffix}>{suffix}</span>}
    </div>
  );
}
