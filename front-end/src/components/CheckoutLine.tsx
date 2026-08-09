import { TriangleAlert } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { CartLine } from '../hooks/useCartLines';
import { ProductImage } from './ProductImage';

type CheckoutLineProps = {
  line: CartLine;
};

export function CheckoutLine({ line }: CheckoutLineProps) {
  const { variant, quantity } = line;
  const shortOfStock = variant !== undefined && quantity > variant.availableQty;

  return (
    <li className="flex gap-4 py-5">
      {variant ? (
        <Link
          to={`/produtos/${variant.sku}`}
          className="h-20 w-16 shrink-0 overflow-hidden rounded-xl border border-line bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <ProductImage src={variant.thumbUrl} alt={`Capinha ${variant.name}`} />
        </Link>
      ) : (
        <div className="h-20 w-16 shrink-0 rounded-xl border border-dashed border-line bg-tile" />
      )}

      <div className="flex min-w-0 flex-1 items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{variant ? variant.name : line.sku}</p>

          <p className="mt-1 text-sm text-ink-soft">
            {quantity === 1 ? '1 unidade' : `${quantity} unidades`}
            {variant && quantity > 1 && ` · ${variant.formattedPrice} cada`}
          </p>

          {shortOfStock && (
            <p className="mt-2 flex items-center gap-1.5 text-sm text-coral">
              <TriangleAlert aria-hidden="true" className="h-4 w-4 shrink-0" />
              {variant.availableQty === 0
                ? 'Esgotada desde que entrou no carrinho'
                : `Restam apenas ${variant.availableQty} em estoque`}
            </p>
          )}

          {!variant && <p className="mt-2 text-sm text-coral">Esta capinha saiu do catálogo</p>}
        </div>

        {line.formattedLineTotal && (
          <p className="shrink-0 text-sm font-semibold text-ink">{line.formattedLineTotal}</p>
        )}
      </div>
    </li>
  );
}
