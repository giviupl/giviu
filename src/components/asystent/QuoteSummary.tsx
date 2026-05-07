'use client';

import styles from '@/app/asystent/Asystent.module.css';

interface QuoteSummaryItem {
  product_id: string;
  name: string;
  brand_name: string;
  price: string;
  color_name?: string | null;
}

interface Props {
  items: QuoteSummaryItem[];
  empty: boolean;
}

export default function QuoteSummary({ items, empty }: Props) {
  if (empty) {
    return (
      <div className={styles.quoteSummary}>
        <div className={styles.quoteSummaryEmpty}>Zapytanie jest puste.</div>
      </div>
    );
  }

  return (
    <div className={styles.quoteSummary}>
      <div className={styles.quoteSummaryHeader}>
        <span>📋 W zapytaniu ({items.length})</span>
        <a href="/wycena" className={styles.quoteSummaryLink}>
          Przejdź do zapytania →
        </a>
      </div>
      <ul className={styles.quoteSummaryList}>
        {items.map((it, i) => (
          <li key={`${it.product_id}-${i}`} className={styles.quoteSummaryItem}>
            <div className={styles.quoteSummaryItemMain}>
              <div className={styles.quoteSummaryItemBrand}>{it.brand_name}</div>
              <div className={styles.quoteSummaryItemName}>
                {it.name}
                {it.color_name ? (
                  <span className={styles.quoteSummaryItemColor}>
                    {' '}
                    · {it.color_name}
                  </span>
                ) : null}
              </div>
            </div>
            <div className={styles.quoteSummaryItemPrice}>{it.price}</div>
          </li>
        ))}
      </ul>
    </div>
  );
}
