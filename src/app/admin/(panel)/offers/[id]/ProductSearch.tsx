'use client';

import { useState, useEffect, useRef, useTransition } from 'react';
import { searchProductsAction, addOfferItemAction } from './actions';
import styles from './OfferEditor.module.css';

interface ProductColor {
  name: string;
  hex: string;
  images?: string[];
}

interface ProductResult {
  id: string;
  name: string;
  brand_name: string;
  code: string | null;
  description: string | null;
  image_url: string | null;
  colors: ProductColor[] | null;
  price: string | null;
}

interface NewItemFromAdd {
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
  offerId: string;
  onItemAdded: (item: NewItemFromAdd) => void;
}

export default function ProductSearch({ offerId, onItemAdded }: Props) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<ProductResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ name: '', description: '' });
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!query.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const r = await searchProductsAction(query);
      setResults(r);
      setSearching(false);
    }, 300);
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query]);

  const handleAddProduct = async (product: ProductResult) => {
    const firstColor = product.colors?.[0];
    const colorImage = firstColor?.images?.[0];

    startTransition(async () => {
      const result = await addOfferItemAction(offerId, {
        product_id: product.id,
        product_name: product.name,
        product_brand: product.brand_name,
        product_description: product.description || undefined,
        product_image_url: colorImage || product.image_url || undefined,
        product_color_name: firstColor?.name,
        product_color_hex: firstColor?.hex,
        product_code: product.code || undefined,
        quantity: 1,
      });

      if (result.ok) {
        // Hack: revalidatePath odświeży, ale dla optymistycznej UX dodaj lokalnie
        // Pełen reload przyjdzie z server revalidation
        window.location.reload();
      }
    });
  };

  const handleAddManual = () => {
    if (!manualData.name.trim()) {
      alert('Podaj nazwę produktu');
      return;
    }
    startTransition(async () => {
      const result = await addOfferItemAction(offerId, {
        product_id: null,
        product_name: manualData.name,
        product_description: manualData.description || undefined,
        quantity: 1,
      });

      if (result.ok) {
        window.location.reload();
      }
    });
  };

  if (showManualForm) {
    return (
      <div className={styles.productSearch}>
        <h4 className={styles.formTitle}>Dodaj produkt ręcznie</h4>
        <div className={styles.field}>
          <label className={styles.label}>Nazwa produktu *</label>
          <input
            type="text"
            value={manualData.name}
            onChange={(e) => setManualData({ ...manualData, name: e.target.value })}
            className={styles.input}
            placeholder="np. Personalizowany kalendarz 2027"
            autoFocus
          />
        </div>
        <div className={styles.field}>
          <label className={styles.label}>Opis</label>
          <textarea
            value={manualData.description}
            onChange={(e) => setManualData({ ...manualData, description: e.target.value })}
            className={styles.textarea}
            rows={2}
          />
        </div>
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              setShowManualForm(false);
              setManualData({ name: '', description: '' });
            }}
            className={styles.btnSecondary}
          >
            Anuluj
          </button>
          <button
            type="button"
            onClick={handleAddManual}
            className={styles.btnPrimary}
            disabled={isPending}
          >
            {isPending ? 'Dodawanie…' : 'Dodaj'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.productSearch}>
      <div className={styles.productSearchHeader}>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Szukaj produktu — nazwa, marka, kod..."
          className={styles.searchInput}
        />
        <button
          type="button"
          onClick={() => setShowManualForm(true)}
          className={styles.btnSmall}
        >
          + Ręcznie
        </button>
      </div>

      {searching && <p className={styles.searchHint}>Szukam…</p>}

      {!searching && query.trim() && results.length === 0 && (
        <p className={styles.searchHint}>Brak produktów dla &ldquo;{query}&rdquo;.</p>
      )}

      {results.length > 0 && (
        <ul className={styles.productResults}>
          {results.map((p) => (
            <li key={p.id}>
              <button
                type="button"
                onClick={() => handleAddProduct(p)}
                className={styles.productResultBtn}
                disabled={isPending}
              >
                <div className={styles.productResultMain}>
                  <strong>{p.name}</strong>
                  <div className={styles.productResultSub}>
                    {p.brand_name}
                    {p.code && ` · ${p.code}`}
                    {p.price && ` · ${p.price}`}
                  </div>
                </div>
                <span className={styles.productResultAdd}>+</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
