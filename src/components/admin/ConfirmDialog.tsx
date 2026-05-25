// src/components/admin/ConfirmDialog.tsx
'use client';

import { useEffect, useRef } from 'react';
import styles from './ConfirmDialog.module.css';

export type ConfirmVariant = 'danger' | 'warning' | 'info';

export interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
  /** Pokazuje loader na przycisku confirm */
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Potwierdź',
  cancelLabel = 'Anuluj',
  variant = 'danger',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleKey = (e: KeyboardEvent) => {
      if (loading) return;
      if (e.key === 'Escape') {
        e.preventDefault();
        onCancel();
      }
      if (e.key === 'Enter') {
        e.preventDefault();
        onConfirm();
      }
    };

    document.addEventListener('keydown', handleKey);

    const t = setTimeout(() => confirmBtnRef.current?.focus(), 50);

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.removeEventListener('keydown', handleKey);
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, loading, onCancel, onConfirm]);

  if (!open) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !loading) {
      onCancel();
    }
  };

  const icon = variant === 'danger' ? '⚠' : variant === 'warning' ? '!' : 'i';

  return (
    <div
      className={styles.backdrop}
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-dialog-title"
    >
      <div className={`${styles.dialog} ${styles[variant]}`}>
        <div className={styles.iconWrapper} aria-hidden="true">
          <span className={styles.icon}>{icon}</span>
        </div>

        <h2 id="confirm-dialog-title" className={styles.title}>
          {title}
        </h2>

        {message && <p className={styles.message}>{message}</p>}

        <div className={styles.actions}>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={onCancel}
            disabled={loading}
          >
            {cancelLabel}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            className={`${styles.confirmBtn} ${styles[`confirmBtn_${variant}`]}`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading ? <span className={styles.spinner} aria-label="Ładowanie" /> : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
