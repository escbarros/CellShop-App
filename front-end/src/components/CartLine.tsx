import { Trash2, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartLine as CartLineData } from '../hooks/useCartLines';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { ProductImage } from './ProductImage';
import { QuantityStepper } from './QuantityStepper';

const MAX_UNITS_PER_ORDER = 10;

type CartLineProps = {
  line: CartLineData;
};

export function CartLine({ line }: CartLineProps) {
  const increment = useCartStore((state) => state.increment);
  const decrement = useCartStore((state) => state.decrement);
  const remove = useCartStore((state) => state.remove);
  const closeDrawer = useCartDrawerStore((state) => state.close);

  const { variant } = line;
  const name = variant?.name ?? line.sku;
  const maxUnits = Math.min(MAX_UNITS_PER_ORDER, variant?.availableQty ?? line.quantity);

  return (
    <li className="flex gap-3 py-4">
      {variant ? (
        <Link
          to={`/produtos/${variant.sku}`}
          onClick={closeDrawer}
          className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ProductImage src={variant.thumbUrl} alt={`Capinha ${variant.name}`} />
        </Link>
      ) : (
        <div className="h-20 w-16 shrink-0 rounded-xl border border-dashed border-line bg-tile" />
      )}

      <div className="flex min-w-0 flex-1 flex-col gap-3">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-ink">{name}</p>
            <p className="mt-0.5 text-sm text-ink-soft">
              {variant ? variant.formattedPrice : 'Esta capinha saiu do catálogo'}
            </p>
          </div>

          <button
            type="button"
            onClick={() => remove(line.sku)}
            aria-label={`Remover ${name} do carrinho`}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-ink-faint transition hover:bg-tile hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            <X aria-hidden="true" className="h-4 w-4" />
          </button>
        </div>

        <QuantityStepper
          value={line.quantity}
          max={maxUnits}
          onIncrease={() => increment(line.sku)}
          onDecrease={() => decrement(line.sku)}
          decreaseLabel={`Diminuir quantidade de ${name}`}
          increaseLabel={`Aumentar quantidade de ${name}`}
          decreaseIcon={
            line.quantity === 1 ? <Trash2 aria-hidden="true" className="h-4 w-4" /> : undefined
          }
        />
      </div>
    </li>
  );
}
