import type { Variant } from '../api/contract';
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
  isCatalogPending: boolean;
};

const brlFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

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
      formattedLineTotal: variant ? brlFormatter.format(lineTotalCents / 100) : null,
    };
  });

  const subtotalCents = lines.reduce((total, line) => total + line.lineTotalCents, 0);

  return {
    lines,
    subtotalCents,
    formattedSubtotal: brlFormatter.format(subtotalCents / 100),
    isCatalogPending: isPending,
  };
}
