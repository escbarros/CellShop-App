import { create } from 'zustand';

export const CART_DRAWER_CLOSE_MS = 240;

export type CartDrawerStatus = 'closed' | 'open' | 'closing';

type CartDrawerStore = {
  status: CartDrawerStatus;
  open: () => void;
  close: () => void;
  finishClosing: () => void;
};

export const useCartDrawerStore = create<CartDrawerStore>()((set, get) => ({
  status: 'closed',

  open: () => set({ status: 'open' }),

  close: () => {
    if (get().status !== 'open') {
      return;
    }

    set({ status: 'closing' });
    setTimeout(() => get().finishClosing(), CART_DRAWER_CLOSE_MS);
  },

  finishClosing: () => set((state) => (state.status === 'closing' ? { status: 'closed' } : {})),
}));

export function useCartDrawerStatus(): CartDrawerStatus {
  return useCartDrawerStore((state) => state.status);
}
