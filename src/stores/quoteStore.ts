import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface QuoteItem {
  id: string;
  name: string;
  brand: string;
  price: string;
  slug: string;
  emoji?: string;
  colorIndex?: number;
  colorName?: string;
  colorHex?: string;
  colorImage?: string;
  /**
   * Tablica ilości — jeden item może mieć wiele „grup ilościowych".
   * Domyślnie [''] (jeden pusty wiersz). Persystowane w localStorage.
   */
  quantities?: string[];
}

interface QuoteStore {
  items: QuoteItem[];
  addItem: (item: QuoteItem) => void;
  removeItem: (id: string, colorIndex?: number) => void;
  setItemQuantities: (
    id: string,
    colorIndex: number | undefined,
    quantities: string[]
  ) => void;
  clearAll: () => void;
  isInQuote: (id: string, colorIndex?: number) => boolean;
  getItemCount: () => number;
}

export const useQuoteStore = create<QuoteStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const exists = get().items.some(
          (i) => i.id === item.id && i.colorIndex === item.colorIndex
        );
        if (!exists) {
          set((state) => ({
            items: [
              ...state.items,
              { ...item, quantities: item.quantities ?? [''] },
            ],
          }));
        }
      },

      removeItem: (id, colorIndex) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.id === id && i.colorIndex === colorIndex)
          ),
        }));
      },

      setItemQuantities: (id, colorIndex, quantities) => {
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id && i.colorIndex === colorIndex
              ? { ...i, quantities }
              : i
          ),
        }));
      },

      clearAll: () => set({ items: [] }),

      isInQuote: (id, colorIndex) => {
        return get().items.some(
          (i) => i.id === id && i.colorIndex === colorIndex
        );
      },

      getItemCount: () => get().items.length,
    }),
    {
      name: 'giviu-quote',
      version: 2,
      // Migracja z v1 (bez quantities) do v2 (z quantities)
      migrate: (persistedState: unknown, version: number) => {
        const state = persistedState as { items?: QuoteItem[] } | null;
        if (state?.items && version < 2) {
          state.items = state.items.map((i) => ({
            ...i,
            quantities: i.quantities ?? [''],
          }));
        }
        return state as QuoteStore;
      },
    }
  )
);
