import { beforeEach, describe, expect, it } from 'vitest';
import { CART_STORAGE_KEY, useCartStore } from './cart-store';

function cart() {
  return useCartStore.getState();
}

function stored(): unknown {
  return JSON.parse(localStorage.getItem(CART_STORAGE_KEY) ?? 'null');
}

describe('cart store', () => {
  beforeEach(() => {
    cart().clear();
  });

  it('starts empty', () => {
    expect(cart().items).toEqual([]);
  });

  it('adds a sku with a single unit by default', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA');

    expect(cart().items).toEqual([{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 1 }]);
  });

  it('sums the quantity when the same sku is added again', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA', 2);
    cart().add('CAP-BLOOM-IP16-AIS-TRA', 3);

    expect(cart().items).toEqual([{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 5 }]);
  });

  it('keeps the order in which the skus were added', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA');
    cart().add('CAP-SAFARI-S24-AIS-TRA');
    cart().add('CAP-BLOOM-IP16-AIS-TRA');

    expect(cart().items.map((item) => item.sku)).toEqual([
      'CAP-BLOOM-IP16-AIS-TRA',
      'CAP-SAFARI-S24-AIS-TRA',
    ]);
  });

  it('increments the quantity of a sku already in the cart', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA');
    cart().increment('CAP-BLOOM-IP16-AIS-TRA');

    expect(cart().items[0].quantity).toBe(2);
  });

  it('decrements down to one unit', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA', 3);
    cart().decrement('CAP-BLOOM-IP16-AIS-TRA');

    expect(cart().items[0].quantity).toBe(2);
  });

  it('drops the item instead of leaving it with zero units', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA');
    cart().decrement('CAP-BLOOM-IP16-AIS-TRA');

    expect(cart().items).toEqual([]);
  });

  it('removes a sku without touching the others', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA', 2);
    cart().add('CAP-SAFARI-S24-AIS-TRA');
    cart().remove('CAP-BLOOM-IP16-AIS-TRA');

    expect(cart().items).toEqual([{ sku: 'CAP-SAFARI-S24-AIS-TRA', quantity: 1 }]);
  });

  it('counts every unit, not every line', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA', 2);
    cart().add('CAP-SAFARI-S24-AIS-TRA', 3);

    expect(cart().totalUnits()).toBe(5);
  });

  it('writes the cart to localStorage so it survives a reload', () => {
    cart().add('CAP-BLOOM-IP16-AIS-TRA', 2);

    expect(stored()).toMatchObject({
      state: { items: [{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 2 }] },
    });
  });

  it('restores the cart left by a previous session', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ state: { items: [{ sku: 'CAP-SAFARI-S24-AIS-TRA', quantity: 4 }] } }),
    );

    await useCartStore.persist.rehydrate();

    expect(cart().items).toEqual([{ sku: 'CAP-SAFARI-S24-AIS-TRA', quantity: 4 }]);
  });

  it('starts empty when the stored cart is corrupted', async () => {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify({ state: { items: 'não é lista' } }));

    await useCartStore.persist.rehydrate();

    expect(cart().items).toEqual([]);
  });

  it('discards a stored line whose quantity is not a whole number', async () => {
    localStorage.setItem(
      CART_STORAGE_KEY,
      JSON.stringify({ state: { items: [{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 0.5 }] } }),
    );

    await useCartStore.persist.rehydrate();

    expect(cart().items).toEqual([]);
  });
});
