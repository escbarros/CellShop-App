import type { Variant } from '../api/contract';
import { useCartItems } from '../store/cart-store';
import { useProducts } from './useProducts';

export type CartLine = {
  sku: string;
  quantity: number;
  variant: Variant | undefined;
};

export type CartSummary = {
  lines: CartLine[];
  subtotalCents: number;
  formattedSubtotal: string;
  isCatalogPending: boolean;
};

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

export function useCartLines(): CartSummary {
  const items = useCartItems();
  const { data: products, isPending } = useProducts();

  const lines = items.map((item) => ({
    sku: item.sku,
    quantity: item.quantity,
    variant: products?.find((product) => product.sku === item.sku),
  }));

  const subtotalCents = lines.reduce(
    (total, line) => total + (line.variant ? line.variant.priceCents * line.quantity : 0),
    0,
  );

  return {
    lines,
    subtotalCents,
    formattedSubtotal: brlFormatter.format(subtotalCents / 100),
    isCatalogPending: isPending,
  };
}
