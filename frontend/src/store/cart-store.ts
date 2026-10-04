import { create } from "zustand";
import { CartItem } from "@/types/cart";
import { FREE_SHIPPING_THRESHOLD_PAISE, DEFAULT_SHIPPING_FEE_PAISE } from "@/lib/constants";

interface CartStore {
  items: CartItem[];
  couponCode: string | null;
  discountPaise: number;
  addItem: (item: CartItem) => void;
  removeItem: (variantId: string) => void;
  updateQuantity: (variantId: string, quantity: number) => void;
  clearCart: () => void;
  setCoupon: (code: string | null, discountPaise?: number) => void;
  
  // Computed getters
  getSubtotal: () => number;
  getShippingFee: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  couponCode: null,
  discountPaise: 0,

  addItem: (item) => {
    const current = get().items;
    const existingIndex = current.findIndex((i) => i.variant_id === item.variant_id);
    if (existingIndex > -1) {
      const updated = [...current];
      updated[existingIndex].quantity += item.quantity;
      set({ items: updated });
    } else {
      set({ items: [...current, item] });
    }
  },

  removeItem: (variantId) => {
    set({ items: get().items.filter((i) => i.variant_id !== variantId) });
  },

  updateQuantity: (variantId, quantity) => {
    if (quantity <= 0) {
      get().removeItem(variantId);
      return;
    }
    const updated = get().items.map((i) =>
      i.variant_id === variantId ? { ...i, quantity } : i
    );
    set({ items: updated });
  },

  clearCart: () => set({ items: [], couponCode: null, discountPaise: 0 }),

  setCoupon: (code, discountPaise = 0) => {
    set({ couponCode: code, discountPaise });
  },

  getSubtotal: () => {
    return get().items.reduce(
      (sum, item) => sum + item.unit_price_paise * item.quantity,
      0
    );
  },

  getShippingFee: () => {
    const subtotal = get().getSubtotal();
    if (subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD_PAISE) {
      return 0;
    }
    return DEFAULT_SHIPPING_FEE_PAISE;
  },

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const shipping = get().getShippingFee();
    const discount = get().discountPaise;
    return Math.max(0, subtotal + shipping - discount);
  },

  getItemCount: () => {
    return get().items.reduce((count, item) => count + item.quantity, 0);
  },
}));
