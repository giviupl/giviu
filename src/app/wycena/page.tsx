"use client";

import styles from "./QuotePage.module.css";
import SectionLine from "@/components/SectionLine";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuoteStore, type QuoteItem } from "@/stores/quoteStore";
import InspirationCarouselSimple from "@/components/InspirationCarouselSimple";
import QuoteProductCard from "@/components/QuoteProductCard";

export default function WycenaPage() {
  const router = useRouter();
  const { items, removeItem, setItemQuantities } = useQuoteStore();
  const [isHydrated, setIsHydrated] = useState(false);
  const [copyToAll, setCopyToAll] = useState(false);
  const [showError, setShowError] = useState(false);
  const firstQuantityRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setIsHydrated(true);
  }, []);

  const getQuantitiesFor = (item: QuoteItem) =>
    item.quantities && item.quantities.length > 0 ? item.quantities : [""];

  const propagateToOthers = (sourceQuantities: string[]) => {
    items.forEach((other, idx) => {
      if (idx > 0) {
        setItemQuantities(other.id, other.colorIndex, [...sourceQuantities]);
      }
    });
  };

  const updateQuantity = (
    item: QuoteItem,
    qtyIndex: number,
    value: string,
    isFirst: boolean,
  ) => {
    setShowError(false);
    const current = [...getQuantitiesFor(item)];
    current[qtyIndex] = value;
    setItemQuantities(item.id, item.colorIndex, current);

    if (copyToAll && isFirst) {
      propagateToOthers(current);
    }
  };

  const addQuantityRow = (item: QuoteItem, isFirst: boolean) => {
    const current = [...getQuantitiesFor(item), ""];
    setItemQuantities(item.id, item.colorIndex, current);

    if (copyToAll && isFirst) {
      propagateToOthers(current);
    }
  };

  const removeQuantityRow = (
    item: QuoteItem,
    qtyIndex: number,
    isFirst: boolean,
  ) => {
    const next = [...getQuantitiesFor(item)];
    next.splice(qtyIndex, 1);
    const finalQuantities = next.length > 0 ? next : [""];
    setItemQuantities(item.id, item.colorIndex, finalQuantities);

    if (copyToAll && isFirst) {
      propagateToOthers(finalQuantities);
    }
  };

  const toggleCopyToAll = () => {
    const newValue = !copyToAll;
    setCopyToAll(newValue);

    if (newValue && items.length > 1) {
      const firstQuantities = getQuantitiesFor(items[0]);
      propagateToOthers(firstQuantities);
    }
  };

  const validateAndProceed = () => {
    let hasEmpty = false;
    items.forEach((item) => {
      const qtys = getQuantitiesFor(item);
      qtys.forEach((q) => {
        if (!q || q.trim() === "") hasEmpty = true;
      });
    });

    if (hasEmpty) {
      setShowError(true);
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    router.push("/wycena/dane");
  };

  if (!isHydrated) {
    return (
      <section className={styles["quote-page"]}>
        <div className="quote-spacer"></div>
        <div className={styles["quote-container"]}>
          <div className={styles["quote-loading"]}>
            <div className="spinner"></div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <>
      <section className={styles["quote-page"]}>
        <div className="quote-spacer"></div>
        <div className={styles["quote-container"]}>
          <header className={styles["quote-header"]}>
            <div className={styles["quote-title-wrapper"]}>
              <SectionLine spacing="sm" />
              <h1 className={styles["quote-title"]}>Zapytanie</h1>
            </div>
            <p className={styles["quote-subtitle"]}>
              Przejrzyj listę produktów, dostosuj ilości i wyślij formularz, aby
              otrzymać dedykowaną ofertę.
            </p>
          </header>

          <div className={styles["quote-progress"]}>
            <span className={`${styles["quote-step"]} ${styles.active}`}>
              1. Zapytanie
            </span>
            <div className={styles["quote-step-line"]}></div>
            <span className={styles["quote-step"]}>2. Dane</span>
          </div>

          {items.length === 0 && (
            <div className={styles["quote-empty"]}>
              <p className={styles["quote-empty-text"]}>
                Twoja lista produktów jest pusta
              </p>
              <Link href="/kolekcje" className={styles["quote-btn-primary"]}>
                Wróć do zakupów
              </Link>
            </div>
          )}

          {items.length > 0 && (
            <>
              {items.length > 1 && (
                <div className={styles["quote-copy-toggle-top"]}>
                  <label className={styles["quote-toggle-label"]}>
                    <div
                      className={`${styles["quote-toggle"]} ${copyToAll ? styles.active : ""}`}
                      onClick={toggleCopyToAll}
                    >
                      <div className={styles["quote-toggle-knob"]}></div>
                    </div>
                    <span>Jednakowa ilość dla wszystkich produktów</span>
                  </label>
                </div>
              )}

              <div className={styles["quote-items"]}>
                {items.map((item, itemIndex) => {
                  const isFirst = itemIndex === 0;
                  const quantities = getQuantitiesFor(item);

                  return (
                    <QuoteProductCard
                      key={`${item.id}-${item.colorIndex ?? 0}`}
                      item={item}
                      quantities={quantities}
                      isFirst={isFirst}
                      showError={showError}
                      firstQuantityRef={isFirst ? firstQuantityRef : undefined}
                      onUpdateQuantity={(qtyIndex, value) =>
                        updateQuantity(item, qtyIndex, value, isFirst)
                      }
                      onAddQuantityRow={() => addQuantityRow(item, isFirst)}
                      onRemoveQuantityRow={(qtyIndex) =>
                        removeQuantityRow(item, qtyIndex, isFirst)
                      }
                      onRemoveItem={() => removeItem(item.id, item.colorIndex)}
                    />
                  );
                })}
              </div>

              <div className={styles["quote-actions"]}>
                <Link
                  href="/kolekcje"
                  className={styles["quote-btn-secondary"]}
                >
                  Kontynuuj zakupy
                </Link>

                <button
                  onClick={validateAndProceed}
                  className={`${styles["quote-btn-primary"]} ${showError ? styles.error : ""}`}
                >
                  {showError ? "Wypełnij ilości →" : "Dalej →"}
                </button>
              </div>

              {showError && (
                <p className={styles["quote-error-message"]}>
                  * Uzupełnij wszystkie pola ilości, aby kontynuować
                </p>
              )}
            </>
          )}
        </div>
      </section>

      {items.length === 0 && (
        <div className="inspiration-wrapper">
          <InspirationCarouselSimple />
        </div>
      )}
    </>
  );
}
