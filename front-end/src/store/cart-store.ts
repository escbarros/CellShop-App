import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import type { CartItem } from '../types/cart';
import { storedCartSchema } from '../types/cart';

export const CART_STORAGE_KEY = 'cellshop:cart';
export const CART_STORAGE_VERSION = 1;

type CartStore = {
  items: CartItem[];
  add: (sku: string, quantity?: number) => void;
  increment: (sku: string) => void;
  decrement: (sku: string) => void;
  remove: (sku: string) => void;
  clear: () => void;
  totalUnits: () => number;
};

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      add: (sku, quantity = 1) =>
        set((state) => ({
          items: state.items.some((item) => item.sku === sku)
            ? state.items.map((item) =>
                item.sku === sku ? { ...item, quantity: item.quantity + quantity } : item,
              )
            : [...state.items, { sku, quantity }],
        })),

      increment: (sku) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.sku === sku ? { ...item, quantity: item.quantity + 1 } : item,
          ),
        })),

      decrement: (sku) =>
        set((state) => ({
          items: state.items.flatMap((item) => {
            if (item.sku !== sku) {
              return [item];
            }

            return item.quantity > 1 ? [{ ...item, quantity: item.quantity - 1 }] : [];
          }),
        })),

      remove: (sku) => set((state) => ({ items: state.items.filter((item) => item.sku !== sku) })),

      clear: () => set({ items: [] }),

      totalUnits: () => get().items.reduce((total, item) => total + item.quantity, 0),
    }),
    {
      name: CART_STORAGE_KEY,
      version: CART_STORAGE_VERSION,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
      merge: (persisted, current) => ({ ...current, items: readStoredItems(persisted) }),
    },
  ),
);

export function useCartItems(): CartItem[] {
  return useCartStore((state) => state.items);
}

export function useCartUnitCount(): number {
  return useCartStore((state) => state.totalUnits());
}

export function useCartQuantityOf(sku: string): number {
  return useCartStore((state) => state.items.find((item) => item.sku === sku)?.quantity ?? 0);
}

function readStoredItems(persisted: unknown): CartItem[] {
  const parsed = storedCartSchema.safeParse(persisted);

  return parsed.success ? parsed.data.items : [];
}
