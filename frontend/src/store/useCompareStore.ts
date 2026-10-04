import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface CompareProductItem {
  id: string;
  title: string;
  slug: string;
  primary_image?: string | null;
  base_price_paise: number;
  brand_name?: string;
  avg_rating?: number;
  category_slug?: string;
}

interface CompareStoreState {
  items: CompareProductItem[];
  addToCompare: (product: CompareProductItem) => boolean;
  removeFromCompare: (id: string) => void;
  clearCompare: () => void;
  isInCompare: (id: string) => boolean;
}

export const useCompareStore = create<CompareStoreState>()(
  persist(
    (set, get) => ({
      items: [],

      addToCompare: (product: CompareProductItem) => {
        const { items } = get();
        if (items.some((item) => item.id === product.id)) {
          return true; // Already added
        }
        if (items.length >= 4) {
          return false; // Max 4 products allowed
        }
        set({ items: [...items, product] });
        return true;
      },

      removeFromCompare: (id: string) => {
        set({ items: get().items.filter((item) => item.id !== id) });
      },

      clearCompare: () => {
        set({ items: [] });
      },

      isInCompare: (id: string) => {
        return get().items.some((item) => item.id === id);
      },
    }),
    {
      name: "shopverse_compare_storage",
    }
  )
);
