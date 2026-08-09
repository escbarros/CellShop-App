import { ShoppingBag } from 'lucide-react';
import type { Variant } from '../api/contract';
import { ProductImage } from './ProductImage';
import { StockBadge } from './StockBadge';

type ProductCardProps = {
  variant: Variant;
};

export function ProductCard({ variant }: ProductCardProps) {
  const soldOut = !variant.available;

  return (
    <article className="flex h-full flex-col">
      <div className="relative overflow-hidden rounded-2xl border border-line bg-tile">
        <div className={`aspect-[3/4] ${soldOut ? 'opacity-40 grayscale' : ''}`}>
          <ProductImage src={variant.thumbUrl} alt={`Capinha ${variant.name}`} />
        </div>

        <div className="absolute inset-x-3 bottom-3 flex">
          <StockBadge availableQty={variant.availableQty} />
        </div>
      </div>

      <div className="mt-3 flex flex-1 flex-col gap-1">
        <h3 className="line-clamp-2 text-sm leading-snug font-medium text-ink">{variant.name}</h3>
        <p className="text-base font-semibold text-ink">{variant.formattedPrice}</p>
      </div>

      <button
        type="button"
        disabled={soldOut}
        className={`mt-3 flex h-11 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
          soldOut
            ? 'cursor-not-allowed border border-line bg-tile text-ink-faint'
            : 'bg-ink text-surface hover:bg-ink/90'
        }`}
      >
        {soldOut ? (
          'Esgotado'
        ) : (
          <>
            <ShoppingBag aria-hidden="true" className="h-4 w-4" strokeWidth={1.8} />
            Comprar
          </>
        )}
      </button>
    </article>
  );
}
