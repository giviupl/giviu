'use client';

// Mirror ProductSearch z ofert, ale dla zamówień (addOrderItemAction).

import { useState, useEffect, useRef, useTransition } from 'react';
import {
  searchProductsAction,
  getBrandsAndCategoriesAction,
} from '../../offers/[id]/actions';
import { addOrderItemAction } from '../actions';
import styles from './OrderEditor.module.css';

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
  moq: number | null;
}

interface BrandOption {
  id: string;
  name: string;
  slug: string;
}

interface CategoryOption {
  slug: string;
  name: string;
}

interface NewOrderItemFromAdd {
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
  sort_order: number;
}

interface Props {
  orderId: string;
  onItemAdded: (item: NewOrderItemFromAdd) => void;
}

export default function OrderProductSearch({ orderId, onItemAdded }: Props) {
  const [query, setQuery] = useState('');
  const [brandId, setBrandId] = useState('');
  const [categorySlug, setCategorySlug] = useState('');

  const [brands, setBrands] = useState<BrandOption[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);

  const [results, setResults] = useState<ProductResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [showManualForm, setShowManualForm] = useState(false);
  const [manualData, setManualData] = useState({ name: '', code: '' });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    getBrandsAndCategoriesAction().then((data) => {
      setBrands(data.brands);
      setCategories(data.categories);
    });
  }, []);

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const hasFilters = !!(brandId || categorySlug);
    if (!query.trim() && !hasFilters) {
      setResults([]);
      setSearching(false);
      return;
    }

    setSearching(true);
    timerRef.current = setTimeout(async () => {
      const r = await searchProductsAction({
        query,
        brandId: brandId || undefined,
        categorySlug: categorySlug || undefined,
      });
      setResults(r as ProductResult[]);
      setSearching(false);
    }, 300);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [query, brandId, categorySlug]);

  const handleAddProduct = (product: ProductResult, color?: ProductColor) => {
    const chosenColor = color || product.colors?.[0];
    const colorImage = chosenColor?.images?.[0];
    setErrorMsg(null);

    startTransition(async () => {
      const result = await addOrderItemAction(orderId, {
        product_id: product.id,
        product_name: product.name,
        product_brand: product.brand_name,
        product_code: product.code || undefined,
        product_color_name: chosenColor?.name,
        product_color_hex: chosenColor?.hex,
        product_image_url: colorImage || product.image_url || undefined,
        product_description: product.description || undefined,
        quantity: 1,
      });

      if (result.ok && result.item) {
        onItemAdded(result.item as NewOrderItemFromAdd);
        setQuery('');
        setResults([]);
      } else {
        setErrorMsg(result.error || 'Nie udało się dodać produktu');
      }
    });
  };

  const handleAddManual = () => {
    if (!manualData.name.trim()) {
      setErrorMsg('Podaj nazwę produktu');
      return;
    }
    setErrorMsg(null);
    startTransition(async () => {
      const result = await addOrderItemAction(orderId, {
        product_id: null,
        product_name: manualData.name,
        product_code: manualData.code || undefined,
        quantity: 1,
      });

      if (result.ok && result.item) {
        onItemAdded(result.item as NewOrderItemFromAdd);
        setShowManualForm(false);
        setManualData({ name: '', code: '' });
      } else {
        setErrorMsg(result.error || 'Nie udało się dodać produktu');
      }
    });
  };

  const clearFilters = () => {
    setBrandId('');
    setCategorySlug('');
  };

  const hasActiveFilters = !!(brandId || categorySlug);

  if (showManualForm) {
    return (
      <div className={styles.productSearch}>
        <h4 className={styles.formTitle}>Dodaj pozycję ręcznie</h4>
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
          <label className={styles.label}>Kod (opcjonalnie)</label>
          <input
            type="text"
            value={manualData.code}
            onChange={(e) => setManualData({ ...manualData, code: e.target.value })}
            className={styles.input}
          />
        </div>
        {errorMsg && <p className={styles.searchHint} style={{ color: '#dc2626' }}>{errorMsg}</p>}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={() => {
              setShowManualForm(false);
              setManualData({ name: '', code: '' });
              setErrorMsg(null);
            }}
            className={styles.btnSecondary}
            disabled={isPending}
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
          placeholder="Szukaj produktu — nazwa, marka, kod, opis..."
          className={styles.searchInput}
          disabled={isPending}
        />
        <button
          type="button"
          onClick={() => setShowManualForm(true)}
          className={styles.btnSmall}
          disabled={isPending}
        >
          + Ręcznie
        </button>
      </div>

      <div className={styles.searchFilters}>
        <select
          value={brandId}
          onChange={(e) => setBrandId(e.target.value)}
          className={styles.searchFilterSelect}
          disabled={isPending}
        >
          <option value="">Wszystkie marki</option>
          {brands.map((b) => (
            <option key={b.id} value={b.id}>{b.name}</option>
          ))}
        </select>

        <select
          value={categorySlug}
          onChange={(e) => setCategorySlug(e.target.value)}
          className={styles.searchFilterSelect}
          disabled={isPending}
        >
          <option value="">Wszystkie kategorie</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.slug}>{c.name}</option>
          ))}
        </select>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className={styles.searchFilterClear}
            disabled={isPending}
            title="Wyczyść filtry"
          >
            ✕ Wyczyść
          </button>
        )}
      </div>

      {isPending && <p className={styles.searchHint}>Dodawanie…</p>}
      {!isPending && searching && <p className={styles.searchHint}>Szukam…</p>}

      {!isPending && !searching && (query.trim() || hasActiveFilters) && results.length === 0 && (
        <p className={styles.searchHint}>Brak produktów dla wybranych kryteriów.</p>
      )}

      {errorMsg && <p className={styles.searchHint} style={{ color: '#dc2626' }}>{errorMsg}</p>}

      {results.length > 0 && (
        <ul className={styles.productResults}>
          {results.map((p) => {
            const colors = Array.isArray(p.colors) ? p.colors : [];
            return (
              <li key={p.id} className={styles.productResultRow}>
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
                      {typeof p.moq === 'number' && p.moq > 0 && ` · MOQ: ${p.moq} szt`}
                    </div>
                  </div>
                  <span className={styles.productResultAdd}>+</span>
                </button>

                {colors.length > 0 && (
                  <div className={styles.productResultSwatches}>
                    {colors.map((c, idx) => (
                      <button
                        key={`${p.id}-${c.name}-${idx}`}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAddProduct(p, c);
                        }}
                        disabled={isPending}
                        className={styles.swatchBtn}
                        style={{ backgroundColor: c.hex || '#ccc' }}
                        title={`Dodaj z kolorem: ${c.name}`}
                        aria-label={`Dodaj z kolorem ${c.name}`}
                      />
                    ))}
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}