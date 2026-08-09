import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';

beforeEach(() => {
  localStorage.clear();
  useCartStore.setState({ items: [] });
  useCartDrawerStore.setState({ status: 'closed' });

  vi.stubGlobal(
    'fetch',
    vi.fn((input: RequestInfo | URL) => {
      const target =
        typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
      return Promise.reject(new Error(`unstubbed network request to ${target}`));
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.unstubAllGlobals();
});
