import { formatCents } from './money';

export const FLAT_SHIPPING_CENTS = 1990;
export const FREE_SHIPPING_THRESHOLD_CENTS = 19900;

const NO_SHIPPING_CENTS = 0;

const FREE_SHIPPING_LABEL = 'Grátis';

export function shippingFor(subtotalCents: number): number {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? NO_SHIPPING_CENTS : FLAT_SHIPPING_CENTS;
}

export function formatShipping(shippingCents: number): string {
  return shippingCents === NO_SHIPPING_CENTS ? FREE_SHIPPING_LABEL : formatCents(shippingCents);
}
