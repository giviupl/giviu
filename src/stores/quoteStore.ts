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
  colorImage?: string; // pierwsze zdjęcie danego koloru (jeśli istnieje)
}

interface QuoteStore {
  items: QuoteItem[];
  addItem: (item: QuoteItem) => void;
  removeItem: (id: string, colorIndex?: number) => void;
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
          i => i.id === item.id && i.colorIndex === item.colorIndex
        );
        if (!exists) {
          set((state) => ({ items: [...state.items, item] }));
        }
      },
      
      removeItem: (id, colorIndex) => {
        set((state) => ({
          items: state.items.filter(
            i => !(i.id === id && i.colorIndex === colorIndex)
          )
        }));
      },
      
      clearAll: () => set({ items: [] }),
      
      isInQuote: (id, colorIndex) => {
        return get().items.some(
          i => i.id === id && i.colorIndex === colorIndex
        );
      },
      
      getItemCount: () => get().items.length,
    }),
    {
      name: 'giviu-quote'
    }
  )
);
