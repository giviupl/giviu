'use client';

import SectionLine from '@/components/SectionLine';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useQuoteStore } from '@/stores/quoteStore';
import InspirationCarouselSimple from '@/components/InspirationCarouselSimple';

export default function WycenaPage() {
  const router = useRouter();
  const { items, removeItem } = useQuoteStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [quantities, setQuantities] = useState<Record<string, string[]>>({});
  const [copyToAll, setCopyToAll] = useState(false);
  const [showError, setShowError] = useState(false);
  const firstQuantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && items.length > 0) {
      firstQuantityRef.current?.focus();
    }
  }, [isHydrated, items.length]);

  const getKey = (id: string, colorIndex?: number) => `${id}-${colorIndex ?? 0}`;
  const getQuantities = (key: string) => quantities[key] || [''];

  const updateQuantity = (key: string, index: number, value: string, isFirst: boolean) => {
    setShowError(false);
    setQuantities(prev => {
      const updated = { ...prev };
      const current = [...(updated[key] || [''])];
      current[index] = value;
      updated[key] = current;

      if (copyToAll && isFirst) {
        items.forEach((item, idx) => {
          if (idx > 0) {
            const otherKey = getKey(item.id, item.colorIndex);
            updated[otherKey] = [...current];
          }
        });
      }

      return updated;
    });
  };

  const addQuantity = (key: string, isFirst: boolean) => {
    setQuantities(prev => {
      const updated = { ...prev };
      const current = [...(updated[key] || [''])];
      current.push('');
      updated[key] = current;

      if (copyToAll && isFirst) {
        items.forEach((item, idx) => {
          if (idx > 0) {
            const otherKey = getKey(item.id, item.colorIndex);
            updated[otherKey] = [...current];
          }
        });
      }

      return updated;
    });
  };

  const removeQuantity = (key: string, index: number, isFirst: boolean) => {
    setQuantities(prev => {
      const updated = { ...prev };
      const current = [...(updated[key] || [''])];
      current.splice(index, 1);
      updated[key] = current;

      if (copyToAll && isFirst) {
        items.forEach((item, idx) => {
          if (idx > 0) {
            const otherKey = getKey(item.id, item.colorIndex);
            updated[otherKey] = [...current];
          }
        });
      }

      return updated;
    });
  };

  const toggleCopyToAll = () => {
    const newValue = !copyToAll;
    setCopyToAll(newValue);

    if (newValue && items.length > 1) {
      const firstKey = getKey(items[0].id, items[0].colorIndex);
      const firstQuantities = quantities[firstKey] || [''];

      setQuantities(prev => {
        const updated = { ...prev };
        items.forEach((item, idx) => {
          if (idx > 0) {
            const otherKey = getKey(item.id, item.colorIndex);
            updated[otherKey] = [...firstQuantities];
          }
        });
        return updated;
      });
    }
  };

  const validateAndProceed = () => {
    let hasEmpty = false;
    items.forEach(item => {
      const key = getKey(item.id, item.colorIndex);
      const qtys = quantities[key] || [''];
      qtys.forEach(q => {
        if (!q || q.trim() === '') hasEmpty = true;
      });
    });

    if (hasEmpty) {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    router.push('/wycena/dane');
  };

  if (!isHydrated) {
    return (
      <section className="quote-page">
        <div className="quote-spacer"></div>
        <div className="quote-container">
          <div className="quote-loading">
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="quote-page">
      <div className="quote-spacer"></div>
      <div className="quote-container">

        <header className="quote-header">
          <div className="quote-title-wrapper">
            <SectionLine spacing="sm" />
            <h1 className="quote-title">Zapytanie</h1>
          </div>
          <p className="quote-subtitle">
            Przejrzyj listę produktów, dostosuj ilości i wyślij formularz, aby otrzymać dedykowaną ofertę.
          </p>
        </header>

        <div className="quote-progress">
          <span className="quote-step active">1. Zapytanie</span>
          <div className="quote-step-line"></div>
          <span className="quote-step">2. Dane</span>
        </div>

        {items.length === 0 && (
          <div className="quote-empty">
            <p className="quote-empty-text">Twoja lista produktów jest pusta</p>
            <Link href="/kolekcje" className="quote-btn-primary">
              Wróć do zakupów
            </Link>
          </div>
        )}

{items.length > 0 && (
  <>
    {/* Toggle na górze - tylko gdy więcej niż 1 produkt */}
    {items.length > 1 && (
      <div className="quote-copy-toggle-top">
        <label className="quote-toggle-label">
          <div
            className={`quote-toggle ${copyToAll ? 'active' : ''}`}
            onClick={toggleCopyToAll}
          >
            <div className="quote-toggle-knob"></div>
          </div>
          <span>Jednakowa ilość dla wszystkich produktów</span>
        </label>
      </div>
    )}

    <div className="quote-items">
      {items.map((item, itemIndex) => {
        const key = getKey(item.id, item.colorIndex);
        const qtys = getQuantities(key);
        const isFirst = itemIndex === 0;

        return (
          <div key={key} className="quote-item">
            <div className="quote-item-row">

              {/* Zdjęcie produktu — next/image jeśli jest, fallback na emoji */}
              <div
                className="quote-item-image"
                style={{ backgroundColor: item.colorImage ? '#ffffff' : (item.colorHex || '#e5e7eb') }}
              >
                {item.colorImage ? (
                  <Image
                    src={item.colorImage}
                    alt={`${item.name} ${item.colorName ?? ''}`}
                    width={80}
                    height={80}
                    className="quote-item-photo"
                  />
                ) : (
                  <span className="quote-item-emoji">{item.emoji || '📦'}</span>
                )}
              </div>

              <div className="quote-item-info">
                <h2 className="quote-item-name">{item.name}</h2>
                <p className="quote-item-brand">{item.brand}</p>
                {item.colorName && (
                  <p className="quote-item-color">
                    Kolor: <strong>{item.colorName}</strong>
                  </p>
                )}
                <p className="quote-item-price">{item.price}</p>
              </div>

              <button
                onClick={() => removeItem(item.id, item.colorIndex)}
                className="quote-item-delete"
                title="Usuń produkt"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
                </svg>
              </button>
            </div>

            <div className="quote-quantities">
              <span className="quote-quantities-label">Ilość:</span>

              {qtys.map((qty, qtyIndex) => (
                <div key={qtyIndex} className="quote-quantity-row">
                  <input
                    ref={itemIndex === 0 && qtyIndex === 0 ? firstQuantityRef : undefined}
                    type="number"
                    min="1"
                    value={qty}
                    onChange={(e) => updateQuantity(key, qtyIndex, e.target.value, isFirst)}
                    placeholder="Wpisz ilość"
                    className={`quote-quantity-input ${showError && (!qty || qty.trim() === '') ? 'error' : ''}`}
                    onKeyDown={(e) => {
                      if (['e', 'E', '+', '-', '.', ','].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />

                  {qtys.length > 1 && (
                    <button
                      onClick={() => removeQuantity(key, qtyIndex, isFirst)}
                      className="quote-quantity-remove"
                      title="Usuń ilość"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  )}

                  {qtyIndex === qtys.length - 1 && (
                    <button
                      onClick={() => addQuantity(key, isFirst)}
                      className="quote-quantity-add"
                    >
                      + Ilość
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>

    <div className="quote-actions">
      <Link href="/kolekcje" className="quote-btn-secondary">
        Kontynuuj zakupy
      </Link>

      <button
        onClick={validateAndProceed}
        className={`quote-btn-primary ${showError ? 'error' : ''}`}
      >
        {showError ? 'Wypełnij ilości →' : 'Dalej →'}
      </button>
    </div>

    {showError && (
      <p className="quote-error-message">
        * Uzupełnij wszystkie pola ilości, aby kontynuować
      </p>
    )}
  </>
)}
      </div>

      {items.length === 0 && (
        <div className="inspiration-wrapper">
          <InspirationCarouselSimple />
        </div>
      )}
    </section>
  );
}
