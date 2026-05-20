import styles from '../admin.module.css';

export default function OrdersPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Zamówienia</h1>
      </header>
      <div
        style={{
          background: 'var(--color-white)',
          border: '1px dashed var(--color-border-medium)',
          borderRadius: 'var(--radius-lg)',
          padding: 'var(--spacing-3xl)',
          textAlign: 'center',
          color: 'var(--color-muted)',
        }}
      >
        <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 8 }}>📦 Zamówienia</p>
        <p>Pojawiają się tu po zaakceptowaniu oferty. Tura 2 dodaje konwersję oferty → zamówienia.</p>
      </div>
    </>
  );
}
