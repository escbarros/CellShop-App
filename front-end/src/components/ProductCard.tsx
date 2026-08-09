import { Check, ShoppingBag } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Variant } from '../api/contract';
import { useCartQuantityOf, useCartStore } from '../store/cart-store';
import { ProductImage } from './ProductImage';
import { StockBadge } from './StockBadge';

type ProductCardProps = {
  variant: Variant;
};

export function ProductCard({ variant }: ProductCardProps) {
  const addToCart = useCartStore((state) => state.add);
  const cartQuantity = useCartQuantityOf(variant.sku);
  const soldOut = !variant.available;
  const alreadyInCart = !soldOut && cartQuantity > 0;
  const detailPath = `/produtos/${variant.sku}`;
  const addButtonTone = soldOut
    ? 'cursor-not-allowed border border-line bg-tile text-ink-faint'
    : alreadyInCart
      ? 'cursor-not-allowed border border-ink/25 bg-tile text-ink-soft'
      : 'bg-ink text-surface hover:bg-ink/90';

  return (
    <article className="flex h-full flex-col">
      <Link
        to={detailPath}
        className="relative block overflow-hidden rounded-2xl border border-line bg-tile focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <div className={`aspect-[3/4] ${soldOut ? 'opacity-40 grayscale' : ''}`}>
          <ProductImage src={variant.thumbUrl} alt={`Capinha ${variant.name}`} />
        </div>

        <div className="absolute inset-x-3 bottom-3 flex">
          <StockBadge availableQty={variant.availableQty} />
        </div>
      </Link>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="text-sm leading-snug font-medium text-ink">
          <Link
            to={detailPath}
            className="line-clamp-2 transition hover:text-ink-soft focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            {variant.name}
          </Link>
        </h3>
        <p className="text-base font-semibold text-ink">{variant.formattedPrice}</p>
      </div>

      <button
        type="button"
        disabled={soldOut || alreadyInCart}
        onClick={() => addToCart(variant.sku)}
        aria-label={soldOut || alreadyInCart ? undefined : `Adicionar ${variant.name} ao carrinho`}
        className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${addButtonTone}`}
      >
        {soldOut ? (
          'Esgotado'
        ) : alreadyInCart ? (
          <>
            <Check aria-hidden="true" className="h-4 w-4" strokeWidth={2} />
            Já está no carrinho
          </>
        ) : (
          <>
            <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            Adicionar
          </>
        )}
      </button>
    </article>
  );
}
