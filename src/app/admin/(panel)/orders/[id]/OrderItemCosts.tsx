'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import {
  addOrderItemCostAction,
  updateOrderItemCostAction,
  deleteOrderItemCostAction,
} from '../actions';
import { createSupplierQuickAction } from '../../suppliers/actions';
import styles from './OrderEditor.module.css';

export interface ItemCost {
  id: string;
  order_item_id: string;
  supplier_id: string | null;
  cost_type: string;
  description: string;
  quantity: number;
  unit_cost: number;
  vat_rate: number;
  total_net: number;
  total_gross: number;
  sort_order: number;
}

interface SupplierOption {
  id: string;
  name: string;
  short_name: string | null;
}

const COST_TYPE_OPTIONS = [
  { value: 'product', label: 'Produkt' },
  { value: 'sample', label: 'Sample / wzory' },
  { value: 'marking', label: 'Znakowanie' },
  { value: 'transport', label: 'Transport' },
  { value: 'other', label: 'Inne' },
];

interface Props {
  orderItemId: string;
  orderId: string;
  initialCosts: ItemCost[];
  suppliers: SupplierOption[];
  onCostsChanged: (costs: ItemCost[]) => void;
  onSupplierAdded: (supplier: SupplierOption) => void;
}

export default function OrderItemCosts({
  orderItemId,
  orderId,
  initialCosts,
  suppliers,
  onCostsChanged,
  onSupplierAdded,
}: Props) {
  const [costs, setCosts] = useState<ItemCost[]>(initialCosts);
  const [isAdding, startAddTransition] = useTransition();

  // Sync z parent gdy initialCosts się zmieni (np. po hydratacji)
  useEffect(() => {
    setCosts(initialCosts);
  }, [initialCosts]);

  const handleAddCost = () => {
    startAddTransition(async () => {
      const result = await addOrderItemCostAction(orderItemId, {
        description: '',
        cost_type: 'other',
        quantity: 1,
        unit_cost: 0,
        vat_rate: 23,
      });
      if (result.ok && result.cost) {
        const newCost = result.cost as ItemCost;
        const updated = [...costs, newCost];
        setCosts(updated);
        onCostsChanged(updated);
      }
    });
  };

  const handleCostUpdate = (costId: string, updates: Partial<ItemCost>) => {
    const updated = costs.map((c) => (c.id === costId ? { ...c, ...updates } : c));
    setCosts(updated);
    onCostsChanged(updated);
  };

  const handleCostDelete = async (costId: string) => {
    const result = await deleteOrderItemCostAction(costId, orderId);
    if (result.ok) {
      const updated = costs.filter((c) => c.id !== costId);
      setCosts(updated);
      onCostsChanged(updated);
    }
  };

  return (
    <div className={styles.costsSection}>
      <div className={styles.costsHeader}>
        <h4 className={styles.costsTitle}>
          Pod-pozycje kosztowe{' '}
          <span className={styles.costsCount}>({costs.length})</span>
        </h4>
      </div>

      {costs.length === 0 ? (
        <p className={styles.costsEmpty}>
          Brak pod-pozycji. Dodaj pierwszą żeby rozpisać koszty na różnych dostawców.
        </p>
      ) : (
        <div className={styles.costsTableWrap}>
          <table className={styles.costsTable}>
            <thead>
              <tr>
                <th>Podpozycja</th>
                <th>Wykonawca</th>
                <th>Typ</th>
                <th>Ilość</th>
                <th>Cena/szt</th>
                <th>VAT</th>
                <th className={styles.costsNumColHead}>Razem netto</th>
                <th className={styles.costsNumColHead}>Razem brutto</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {costs.map((cost) => (
                <CostRow
                  key={cost.id}
                  cost={cost}
                  orderId={orderId}
                  suppliers={suppliers}
                  onUpdate={(updates) => handleCostUpdate(cost.id, updates)}
                  onDelete={() => handleCostDelete(cost.id)}
                  onSupplierAdded={onSupplierAdded}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      <button
        type="button"
        onClick={handleAddCost}
        disabled={isAdding}
        className={styles.addCostBtn}
      >
        {isAdding ? 'Dodawanie…' : '+ Dodaj koszt'}
      </button>
    </div>
  );
}

// =====================================
// CostRow - wiersz tabeli pod-pozycji z auto-save
// =====================================
function CostRow({
  cost,
  suppliers,
  onUpdate,
  onDelete,
  onSupplierAdded,
}: {
  cost: ItemCost;
  orderId: string;
  suppliers: SupplierOption[];
  onUpdate: (updates: Partial<ItemCost>) => void;
  onDelete: () => void;
  onSupplierAdded: (supplier: SupplierOption) => void;
}) {
  const [values, setValues] = useState({
    description: cost.description || '',
    supplier_id: cost.supplier_id || '',
    cost_type: cost.cost_type || 'other',
    quantity: Number(cost.quantity || 1),
    unit_cost: Number(cost.unit_cost || 0),
    vat_rate: Number(cost.vat_rate || 23),
  });

  const [showAddSupplier, setShowAddSupplier] = useState(false);
  const [newSupplierName, setNewSupplierName] = useState('');
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(false);

  // Lokalne obliczenia (mirror SQL generated columns)
  const totalNet = values.quantity * values.unit_cost;
  const totalGross = totalNet * (1 + values.vat_rate / 100);

  useEffect(() => {
    if (!isMountedRef.current) {
      isMountedRef.current = true;
      return;
    }
    if (timerRef.current) clearTimeout(timerRef.current);

    timerRef.current = setTimeout(async () => {
      const result = await updateOrderItemCostAction(cost.id, {
        ...values,
        supplier_id: values.supplier_id || null,
      });
      if (result.ok && result.calculated) {
        onUpdate({
          ...values,
          supplier_id: values.supplier_id || null,
          total_net: Number(result.calculated.total_net),
          total_gross: Number(result.calculated.total_gross),
        });
      }
    }, 800);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [values]);

  const handleQuickAddSupplier = async () => {
    if (!newSupplierName.trim()) return;
    setIsAddingSupplier(true);
    const result = await createSupplierQuickAction(newSupplierName);
    if (result.ok && result.supplier) {
      onSupplierAdded({
        id: result.supplier.id,
        name: result.supplier.name,
        short_name: result.supplier.short_name,
      });
      setValues((prev) => ({ ...prev, supplier_id: result.supplier.id }));
      setShowAddSupplier(false);
      setNewSupplierName('');
    }
    setIsAddingSupplier(false);
  };

  return (
    <tr className={styles.costRow}>
      <td>
        <input
          type="text"
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          placeholder="np. wzory czapek, próba, znakowanie"
          className={styles.costInput}
        />
      </td>
      <td>
        {showAddSupplier ? (
          <div className={styles.costInlineAddWrap}>
            <input
              type="text"
              value={newSupplierName}
              onChange={(e) => setNewSupplierName(e.target.value)}
              placeholder="Nazwa nowego dostawcy"
              className={styles.costInput}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleQuickAddSupplier();
                if (e.key === 'Escape') {
                  setShowAddSupplier(false);
                  setNewSupplierName('');
                }
              }}
            />
            <button
              type="button"
              onClick={handleQuickAddSupplier}
              disabled={isAddingSupplier || !newSupplierName.trim()}
              className={styles.costInlineAddOk}
              title="Dodaj"
            >
              ✓
            </button>
            <button
              type="button"
              onClick={() => {
                setShowAddSupplier(false);
                setNewSupplierName('');
              }}
              className={styles.costInlineAddCancel}
              title="Anuluj"
            >
              ✕
            </button>
          </div>
        ) : (
          <select
            value={values.supplier_id}
            onChange={(e) => {
              if (e.target.value === '__add_new__') {
                setShowAddSupplier(true);
              } else {
                setValues({ ...values, supplier_id: e.target.value });
              }
            }}
            className={styles.costSelect}
          >
            <option value="">— wybierz —</option>
            {suppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.short_name || s.name}
              </option>
            ))}
            <option value="__add_new__">+ Nowy dostawca…</option>
          </select>
        )}
      </td>
      <td>
        <select
          value={values.cost_type}
          onChange={(e) => setValues({ ...values, cost_type: e.target.value })}
          className={styles.costSelect}
        >
          {COST_TYPE_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </td>
      <td>
        <CostNumInput
          value={values.quantity}
          step={1}
          onChange={(v) => setValues({ ...values, quantity: v })}
        />
      </td>
      <td>
        <CostNumInput
          value={values.unit_cost}
          step={0.01}
          suffix="zł"
          onChange={(v) => setValues({ ...values, unit_cost: v })}
        />
      </td>
      <td>
        <CostNumInput
          value={values.vat_rate}
          step={1}
          suffix="%"
          onChange={(v) => setValues({ ...values, vat_rate: v })}
        />
      </td>
      <td className={`${styles.costsNumCell} ${styles.costsNegative}`}>
        −{totalNet.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
      </td>
      <td className={`${styles.costsNumCell} ${styles.costsNegative}`}>
        −{totalGross.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
      </td>
      <td className={styles.costsActionCell}>
        <button
          type="button"
          onClick={onDelete}
          className={styles.costsDeleteBtn}
          title="Usuń pod-pozycję"
        >
          ✕
        </button>
      </td>
    </tr>
  );
}

function CostNumInput({
  value,
  step,
  suffix,
  onChange,
}: {
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
    <div className={styles.costInputWrap}>
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
        className={`${styles.costInput} ${suffix ? styles.costInputWithSuffix : ''}`}
      />
      {suffix && <span className={styles.costInputSuffix}>{suffix}</span>}
    </div>
  );
}
