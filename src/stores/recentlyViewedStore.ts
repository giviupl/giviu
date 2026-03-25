import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Product } from '@/components/ProductCard';

interface RecentlyViewedState {
  products: Product[];
  addProduct: (product: Product) => void;
  clearAll: () => void;
}

export const useRecentlyViewedStore = create<RecentlyViewedState>()(
  persist(
    (set, get) => ({
      products: [],
      
      addProduct: (product) => {
        const current = get().products;
        // Usuń jeśli już istnieje (żeby dodać na początek)
        const filtered = current.filter(p => p.id !== product.id);
        // Dodaj na początek, max 12 produktów
        const updated = [product, ...filtered].slice(0, 12);
        set({ products: updated });
      },
      
      clearAll: () => set({ products: [] }),
    }),
    {
      name: 'giviu-recently-viewed',
    }
  )
);