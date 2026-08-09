import { ShoppingCart } from 'lucide-react';

export function CartButton() {
  return (
    <button
      type="button"
      aria-label="Carrinho de compras"
      className="flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:border-ink hover:bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <ShoppingCart aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />
    </button>
  );
}
