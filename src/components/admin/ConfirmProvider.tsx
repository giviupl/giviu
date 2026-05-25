// src/components/admin/ConfirmProvider.tsx
'use client';

import { createContext, useCallback, useContext, useRef, useState } from 'react';
import ConfirmDialog, { type ConfirmVariant } from './ConfirmDialog';

// ============================================
// Typy
// ============================================

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: ConfirmVariant;
}

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

// ============================================
// Provider
// ============================================

interface State extends ConfirmOptions {
  open: boolean;
  loading: boolean;
}

const INITIAL: State = {
  open: false,
  loading: false,
  title: '',
};

export function ConfirmProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<State>(INITIAL);
  const resolverRef = useRef<((value: boolean) => void) | null>(null);

  const confirm: ConfirmFn = useCallback((options) => {
    return new Promise<boolean>((resolve) => {
      resolverRef.current = resolve;
      setState({ ...options, open: true, loading: false });
    });
  }, []);

  const handleConfirm = useCallback(() => {
    resolverRef.current?.(true);
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  const handleCancel = useCallback(() => {
    resolverRef.current?.(false);
    resolverRef.current = null;
    setState((s) => ({ ...s, open: false }));
  }, []);

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <ConfirmDialog
        open={state.open}
        title={state.title}
        message={state.message}
        confirmLabel={state.confirmLabel}
        cancelLabel={state.cancelLabel}
        variant={state.variant}
        loading={state.loading}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </ConfirmContext.Provider>
  );
}

// ============================================
// Hook
// ============================================

/**
 * Hook do potwierdzenia akcji. Zwraca funkcję która tworzy Promise<boolean>.
 *
 * Przykład użycia (drop-in replacement dla window.confirm):
 * ```tsx
 * const confirm = useConfirm();
 *
 * const handleDelete = async () => {
 *   const ok = await confirm({
 *     title: 'Usunąć kontakt?',
 *     message: `Kontakt "${name}" zostanie usunięty bezpowrotnie.`,
 *     variant: 'danger',
 *     confirmLabel: 'Usuń',
 *   });
 *   if (!ok) return;
 *   await deleteContact(id);
 * };
 * ```
 */
export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error(
      'useConfirm musi być wewnątrz <ConfirmProvider>. Sprawdź czy admin layout opakowany.',
    );
  }
  return ctx;
}
