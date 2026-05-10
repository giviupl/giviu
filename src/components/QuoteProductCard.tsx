"use client";

import Link from "next/link";
import Image from "next/image";
import type { RefObject } from "react";
import type { QuoteItem } from "@/stores/quoteStore";
import styles from "./QuoteProductCard.module.css";

interface QuoteProductCardProps {
  item: QuoteItem;
  quantities: string[];
  isFirst: boolean;
  showError: boolean;
  firstQuantityRef?: RefObject<HTMLInputElement | null>;
  onUpdateQuantity: (qtyIndex: number, value: string) => void;
  onAddQuantityRow: () => void;
  onRemoveQuantityRow: (qtyIndex: number) => void;
  onRemoveItem: () => void;
}

const STEP = 10;

export default function QuoteProductCard({
  item,
  quantities,
  isFirst,
  showError,
  firstQuantityRef,
  onUpdateQuantity,
  onAddQuantityRow,
  onRemoveQuantityRow,
  onRemoveItem,
}: QuoteProductCardProps) {
  const colorSlug = item.colorName?.toLowerCase().replace(/\s+/g, "-");
  const productUrl = `/produkty/${item.slug}${
    colorSlug ? `?color=${colorSlug}` : ""
  }`;

  const handleIncrement = (qtyIndex: number) => {
    const current = quantities[qtyIndex] || "";
    const num = parseInt(current, 10) || 0;
    onUpdateQuantity(qtyIndex, String(num + STEP));
  };

  const handleDecrement = (qtyIndex: number) => {
    const current = quantities[qtyIndex] || "";
    const num = parseInt(current, 10) || 0;
    if (num <= STEP) {
      onUpdateQuantity(qtyIndex, "");
    } else {
      onUpdateQuantity(qtyIndex, String(num - STEP));
    }
  };

  return (
    <article className={styles.card}>
      {/* Strefa klikalna — link na PDP */}
      <Link href={productUrl} className={styles["card-link"]}>
        <div
          className={styles["card-image"]}
          style={{
            backgroundColor: item.colorImage
              ? "#ffffff"
              : item.colorHex
                ? `${item.colorHex}15`
                : "#f3f4f6",
          }}
        >
          {item.colorImage ? (
            <Image
              src={item.colorImage}
              alt={`${item.name} ${item.colorName ?? ""}`}
              width={112}
              height={112}
              className={styles["card-photo"]}
            />
          ) : (
            <span className={styles["card-emoji"]}>{item.emoji || "📦"}</span>
          )}
        </div>

        <div className={styles["card-info"]}>
          <p className={styles["card-brand"]}>{item.brand.toUpperCase()}</p>
          <h2 className={styles["card-name"]}>{item.name}</h2>

          {item.colorName && (
            <span className={styles["card-pill"]}>
              <span
                className={styles["card-pill-dot"]}
                style={{ backgroundColor: item.colorHex || "#999" }}
              />
              {item.colorName}
            </span>
          )}

          <p className={styles["card-price"]}>{item.price}</p>
        </div>
      </Link>

      {/* Kosz — poza linkiem */}
      <button
        type="button"
        onClick={onRemoveItem}
        className={styles["card-delete"]}
        title="Usuń produkt"
        aria-label={`Usuń ${item.name} z zapytania`}
      >
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <path d="M3 6h18M8 6V4a2 2 0 012-2h4a2 2 0 012 2v2m3 0v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6h14z" />
        </svg>
      </button>

      {/* Sekcja ilości — poza linkiem */}
      <div className={styles.quantities}>
        <span className={styles["quantities-label"]}>Ilość:</span>

        {quantities.map((qty, qtyIndex) => {
          const isEmpty = !qty || qty.trim() === "";
          const showStepperError = showError && isEmpty;

          return (
            <div key={qtyIndex} className={styles["quantity-row"]}>
              <div
                className={`${styles.stepper} ${
                  showStepperError ? styles["stepper-error"] : ""
                }`}
              >
                <button
                  type="button"
                  className={styles["stepper-btn"]}
                  onClick={() => handleDecrement(qtyIndex)}
                  disabled={isEmpty}
                  aria-label="Zmniejsz ilość o 10"
                >
                  −
                </button>
                <input
                  ref={
                    isFirst && qtyIndex === 0 ? firstQuantityRef : undefined
                  }
                  type="number"
                  inputMode="numeric"
                  min="0"
                  step={STEP}
                  value={qty}
                  onChange={(e) => onUpdateQuantity(qtyIndex, e.target.value)}
                  placeholder="—"
                  className={styles["stepper-input"]}
                  onKeyDown={(e) => {
                    if (["e", "E", "+", "-", ".", ","].includes(e.key)) {
                      e.preventDefault();
                    }
                  }}
                />
                <button
                  type="button"
                  className={styles["stepper-btn"]}
                  onClick={() => handleIncrement(qtyIndex)}
                  aria-label="Zwiększ ilość o 10"
                >
                  +
                </button>
              </div>

              {quantities.length > 1 && (
                <button
                  type="button"
                  onClick={() => onRemoveQuantityRow(qtyIndex)}
                  className={styles["quantity-row-remove"]}
                  title="Usuń ten rząd ilości"
                  aria-label="Usuń ten rząd ilości"
                >
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M18 6L6 18M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={onAddQuantityRow}
          className={styles["add-quantity-row"]}
        >
          + Dodaj kolejną grupę ilościową
        </button>
      </div>
    </article>
  );
}
