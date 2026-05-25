'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { updateOrderAction, changeOrderStatusAction } from '../actions';
import OrderClientSelector from './OrderClientSelector';
import OrderProductSearch from './OrderProductSearch';
import OrderItemCard from './OrderItemCard';
import type { ItemCost } from './OrderItemCosts';
import styles from './OrderEditor.module.css';

const STATUS_OPTIONS = [
  { value: 'new', label: 'Nowe', color: 'gray' },
  { value: 'in_production', label: 'W produkcji', color: 'orange' },
  { value: 'completed', label: 'Zakończone', color: 'green' },
  { value: 'cancelled', label: 'Anulowane', color: 'red' },
];

interface Order {
  id: string;
  order_number: string;
  offer_id: string | null;
  status: string;
  client_id: string | null;
  client_company: string | null;
  client_person: string | null;
  client_email: string | null;
  client_phone: string | null;
  client_nip: string | null;
  order_date: string | null;
  production_deadline: string | null;
  delivery_deadline: string | null;
  delivered_at: string | null;
  notes: string | null;
  internal_notes: string | null;
}

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

interface Contact {
  id: string;
  name: string;
  position: string | null;
  email: string | null;
  phone: string | null;
  is_primary: boolean | null;
}

interface SupplierOption {
  id: string;
  name: string;
  short_name: string | null;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface Props {
  order: Order;
  initialItems: OrderItem[];
  initialContacts: Contact[];
  initialCostsByItem: Record<string, ItemCost[]>;
  initialSuppliers: SupplierOption[];
}

export default function OrderEditor({
  order: initialOrder,
  initialItems,
  initialContacts,
  initialCostsByItem,
  initialSuppliers,
}: Props) {
  const [order, setOrder] = useState(initialOrder);
  const [items, setItems] = useState<OrderItem[]>(initialItems);
  const [contacts, setContacts] = useState<Contact[]>(initialContacts);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>(initialSuppliers);
  const [costsByItem, setCostsByItem] =
    useState<Record<string, ItemCost[]>>(initialCostsByItem);

  const [formData, setFormData] = useState({
    production_deadline: initialOrder.production_deadline || '',
    delivery_deadline: initialOrder.delivery_deadline || '',
    notes: initialOrder.notes || '',
    internal_notes: initialOrder.internal_notes || '',
  });

  const [status, setStatus] = useState<SaveStatus>('idle');
  const [isChangingStatus, setIsChangingStatus] = useState(false);

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
      const result = await updateOrderAction(order.id, formData);
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

  const handleStatusChange = async (newStatus: string) => {
    setIsChangingStatus(true);
    const result = await changeOrderStatusAction(order.id, newStatus);
    if (result.ok) {
      setOrder({
        ...order,
        status: newStatus,
        delivered_at:
          newStatus === 'completed' && !order.delivered_at
            ? new Date().toISOString()
            : order.delivered_at,
      });
    }
    setIsChangingStatus(false);
  };

  const handleItemUpdate = (itemId: string, updates: Partial<OrderItem>) => {
    setItems((prev) => prev.map((i) => (i.id === itemId ? { ...i, ...updates } : i)));
  };

  const handleItemAdded = (newItem: OrderItem) => {
    setItems((prev) => [...prev, newItem]);
    setCostsByItem((prev) => ({ ...prev, [newItem.id]: [] }));
  };

  const handleItemDeleted = (itemId: string) => {
    setItems((prev) => prev.filter((i) => i.id !== itemId));
    setCostsByItem((prev) => {
      const copy = { ...prev };
      delete copy[itemId];
      return copy;
    });
  };

  const handleCostsChanged = (itemId: string, costs: ItemCost[]) => {
    setCostsByItem((prev) => ({ ...prev, [itemId]: costs }));
  };

  const handleSupplierAdded = (supplier: SupplierOption) => {
    setSuppliers((prev) => {
      if (prev.some((s) => s.id === supplier.id)) return prev;
      return [...prev, supplier].sort((a, b) =>
        (a.short_name || a.name).localeCompare(b.short_name || b.name, 'pl'),
      );
    });
  };

  const handleClientChanged = (
    updatedOrder: Partial<Order>,
    newContacts: Contact[],
  ) => {
    setOrder((prev) => ({ ...prev, ...updatedOrder }));
    setContacts(newContacts);
  };

  // Sumy — uwzględniają pod-pozycje gdy istnieją, fallback do prostego kalkulatora
  const totalNet = items.reduce((s, i) => s + Number(i.total_price || 0), 0);
  const totalGross = items.reduce((s, i) => s + Number(i.total_price_gross || 0), 0);
  const totalVat = totalGross - totalNet;

  const totalCost = items.reduce((sum, i) => {
    const itemCosts = costsByItem[i.id] || [];
    if (itemCosts.length > 0) {
      return sum + itemCosts.reduce((s, c) => s + Number(c.total_net || 0), 0);
    }
    const qty = Math.max(1, i.quantity);
    const cost =
      Number(i.purchase_price || 0) * qty +
      Number(i.extra_costs_per_unit || 0) * qty +
      Number(i.transport_cost_total || 0);
    return sum + cost;
  }, 0);

  const totalProfit = totalNet - totalCost;

  const currentStatusInfo = STATUS_OPTIONS.find((s) => s.value === order.status);

  return (
    <div className={styles.editor}>
      {/* Status bar */}
      <div className={styles.statusBar}>
        <div className={styles.statusBarLeft}>
          <label className={styles.label}>Status</label>
          <div className={styles.statusPickerWrap}>
            <span
              className={`${styles.statusBadge} ${styles[`status_${currentStatusInfo?.color || 'gray'}`]}`}
            >
              {currentStatusInfo?.label || order.status}
            </span>
            <select
              value={order.status}
              onChange={(e) => handleStatusChange(e.target.value)}
              disabled={isChangingStatus}
              className={styles.statusSelect}
            >
              {STATUS_OPTIONS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>

        <div className={styles.saveIndicator}>
          {status === 'saving' && <span className={styles.statusSaving}>Zapisywanie…</span>}
          {status === 'saved' && <span className={styles.statusSaved}>✓ Zapisano</span>}
          {status === 'error' && <span className={styles.statusError}>⚠ Błąd zapisu</span>}
          {order.offer_id && (
            <Link href={`/admin/offers/${order.offer_id}`} className={styles.offerLink}>
              ← Z oferty
            </Link>
          )}
        </div>
      </div>

      {/* KLIENT */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Klient</h2>
        <OrderClientSelector
          orderId={order.id}
          currentClientId={order.client_id}
          currentClientCompany={order.client_company}
          currentClientPerson={order.client_person}
          currentClientEmail={order.client_email}
          currentClientPhone={order.client_phone}
          currentClientNip={order.client_nip}
          contacts={contacts}
          onClientChanged={handleClientChanged}
        />
      </section>

      {/* TERMINY */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Terminy</h2>
        <div className={styles.datesGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Data zamówienia</label>
            <div className={styles.readonlyDate}>
              {order.order_date ? new Date(order.order_date).toLocaleDateString('pl-PL') : '—'}
            </div>
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Deadline produkcji</label>
            <input
              type="date"
              value={formData.production_deadline}
              onChange={(e) => setFormData({ ...formData, production_deadline: e.target.value })}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Deadline dostawy</label>
            <input
              type="date"
              value={formData.delivery_deadline}
              onChange={(e) => setFormData({ ...formData, delivery_deadline: e.target.value })}
              className={styles.dateInput}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Zakończono</label>
            <div className={styles.readonlyDate}>
              {order.delivered_at
                ? new Date(order.delivered_at).toLocaleDateString('pl-PL')
                : '—'}
            </div>
          </div>
        </div>
      </section>

      {/* POZYCJE */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>
          Pozycje <span className={styles.count}>({items.length})</span>
        </h2>

        {items.length === 0 && (
          <p className={styles.emptyText}>Brak pozycji. Wyszukaj produkt poniżej albo dodaj ręcznie.</p>
        )}

        <div className={styles.itemsList}>
          {items.map((item) => (
            <OrderItemCard
              key={item.id}
              item={item}
              orderId={order.id}
              initialCosts={costsByItem[item.id] || []}
              suppliers={suppliers}
              onUpdate={(updates) => handleItemUpdate(item.id, updates)}
              onDelete={() => handleItemDeleted(item.id)}
              onCostsChanged={handleCostsChanged}
              onSupplierAdded={handleSupplierAdded}
            />
          ))}
        </div>

        <OrderProductSearch orderId={order.id} onItemAdded={handleItemAdded} />
      </section>

      {/* NOTATKI */}
      <section className={styles.section}>
        <h2 className={styles.sectionTitle}>Notatki</h2>
        <div className={styles.notesGrid}>
          <div className={styles.field}>
            <label className={styles.label}>Notatki dla klienta (widoczne w PDF)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className={styles.textarea}
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Notatki wewnętrzne</label>
            <textarea
              value={formData.internal_notes}
              onChange={(e) => setFormData({ ...formData, internal_notes: e.target.value })}
              rows={3}
              className={styles.textarea}
            />
          </div>
        </div>
      </section>

      {/* STICKY TOTALS BAR — B3: razem / koszty / zysk jak na CRM-screenie */}
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
          <div className={`${styles.totalsBlock} ${styles.totalsCost}`}>
            <span className={styles.totalsLabel}>Koszty</span>
            <strong className={styles.totalsValue}>
              {totalCost.toLocaleString('pl-PL', { minimumFractionDigits: 2 })} zł
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
