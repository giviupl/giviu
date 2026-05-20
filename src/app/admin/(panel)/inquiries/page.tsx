import styles from '../admin.module.css';

export default function InquiriesPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Zapytania</h1>
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
        <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 8 }}>✉️ Lista zapytań</p>
        <p>Tura 3 — po podłączeniu frontendu formularza zapytania.</p>
      </div>
    </>
  );
}
