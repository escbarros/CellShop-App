import type { Variant } from '../api/contract';
import { formatCents } from '../api/money';
import { formatShipping, shippingFor } from '../api/shipping';
import { useCartItems } from '../store/cart-store';
import { useProducts } from './useProducts';

export type CartLine = {
  sku: string;
  quantity: number;
  variant: Variant | undefined;
  lineTotalCents: number;
  formattedLineTotal: string | null;
};

export type CartSummary = {
  lines: CartLine[];
  subtotalCents: number;
  formattedSubtotal: string;
  shippingCents: number;
  formattedShipping: string;
  isShippingFree: boolean;
  totalCents: number;
  formattedTotal: string;
  isCatalogPending: boolean;
};

export function useCartLines(): CartSummary {
  const items = useCartItems();
  const { data: products, isPending } = useProducts();

  const lines = items.map((item) => {
    const variant = products?.find((product) => product.sku === item.sku);
    const lineTotalCents = variant ? variant.priceCents * item.quantity : 0;

    return {
      sku: item.sku,
      quantity: item.quantity,
      variant,
      lineTotalCents,
      formattedLineTotal: variant ? formatCents(lineTotalCents) : null,
    };
  });

  const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);
  const shippingCents = shippingFor(subtotalCents);
  const isShippingFree = shippingCents === 0;

  return {
    lines,
    subtotalCents,
    formattedSubtotal: formatCents(subtotalCents),
    shippingCents,
    formattedShipping: formatShipping(shippingCents),
    isShippingFree,
    totalCents: subtotalCents + shippingCents,
    formattedTotal: formatCents(subtotalCents + shippingCents),
    isCatalogPending: isPending,
  };
}
