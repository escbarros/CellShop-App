import { ShoppingCart } from 'lucide-react';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartUnitCount } from '../store/cart-store';

export function CartButton() {
  const open = useCartDrawerStore((state) => state.open);
  const unitCount = useCartUnitCount();

  return (
    <button
      type="button"
      onClick={open}
      aria-label={cartLabel(unitCount)}
      className="relative flex h-10 w-10 items-center justify-center rounded-xl border border-line bg-surface text-ink transition hover:border-ink hover:bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
    >
      <ShoppingCart aria-hidden="true" className="h-5 w-5" strokeWidth={1.7} />

      {unitCount > 0 && (
        <span
          aria-hidden="true"
          className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-coral px-1 text-[11px] font-semibold text-surface"
        >
          {unitCount}
        </span>
      )}
    </button>
  );
}

function cartLabel(unitCount: number): string {
  if (unitCount === 0) {
    return 'Carrinho de compras';
  }

  return unitCount === 1
    ? 'Carrinho de compras com 1 unidade'
    : `Carrinho de compras com ${unitCount} unidades`;
}
