import styles from '../admin.module.css';

export default function TasksPage() {
  return (
    <>
      <header className={styles.pageHeader}>
        <h1 className={styles.pageTitle}>Zadania</h1>
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
        <p style={{ fontSize: 'var(--font-size-lg)', marginBottom: 8 }}>✓ Zadania i follow-upy</p>
        <p>Tura 2 dodaje listę zadań z deadlinami i priorytetami.</p>
      </div>
    </>
  );
}
