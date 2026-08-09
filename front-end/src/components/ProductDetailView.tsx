import { ShoppingBag } from 'lucide-react';
import { useState } from 'react';
import type { Variant } from '../api/contract';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { ProductImage } from './ProductImage';
import { QuantityStepper } from './QuantityStepper';
import { StockBadge } from './StockBadge';

const MAX_UNITS_PER_ORDER = 10;
const LOW_STOCK_THRESHOLD = 5;

type ProductDetailViewProps = {
  variant: Variant;
};

export function ProductDetailView({ variant }: ProductDetailViewProps) {
  const [quantity, setQuantity] = useState(1);
  const addToCart = useCartStore((state) => state.add);
  const openCart = useCartDrawerStore((state) => state.open);

  const soldOut = !variant.available;
  const maxUnits = Math.min(MAX_UNITS_PER_ORDER, variant.availableQty);

  function handleAddToCart() {
    addToCart(variant.sku, quantity);
    openCart();
  }

  return (
    <div className="rise-in grid gap-8 lg:grid-cols-2 lg:gap-14">
      <div className="relative overflow-hidden rounded-3xl border border-line bg-tile">
        <div className={`aspect-square lg:aspect-[4/5] ${soldOut ? 'opacity-40 grayscale' : ''}`}>
          <ProductImage src={variant.imageUrl} alt={`Capinha ${variant.name}`} />
        </div>

        <div className="absolute inset-x-4 bottom-4 flex">
          <StockBadge availableQty={variant.availableQty} />
        </div>
      </div>

      <div className="flex flex-col">
        <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
          {variant.name}
        </h1>

        <p className="mt-4 text-3xl font-semibold text-ink">{variant.formattedPrice}</p>

        <p className="mt-6 text-sm leading-relaxed text-ink-soft">{variant.description}</p>

        <div className="mt-8 border-t border-line pt-8">
          {soldOut ? (
            <p className="text-sm text-ink-soft">
              Esta estampa está sem estoque. Volte daqui a pouco ou escolha outra na vitrine.
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-4">
                <span className="text-sm font-medium text-ink">Quantidade</span>
                <QuantityStepper
                  value={quantity}
                  max={maxUnits}
                  onIncrease={() => setQuantity((current) => Math.min(current + 1, maxUnits))}
                  onDecrease={() => setQuantity((current) => Math.max(current - 1, 1))}
                  decreaseLabel="Diminuir quantidade"
                  increaseLabel="Aumentar quantidade"
                />
              </div>

              {variant.availableQty <= LOW_STOCK_THRESHOLD && (
                <p className="text-sm text-coral">
                  {variant.availableQty === 1
                    ? 'Resta apenas uma unidade.'
                    : `Restam ${variant.availableQty} unidades.`}
                </p>
              )}
            </div>
          )}

          <button
            type="button"
            disabled={soldOut}
            onClick={handleAddToCart}
            className={`mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl text-sm font-semibold transition focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
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
                Adicionar no carrinho
              </>
            )}
          </button>

          <dl className="mt-6 flex gap-2 text-xs text-ink-faint">
            <dt>Código</dt>
            <dd className="font-medium text-ink-soft">{variant.sku}</dd>
          </dl>
        </div>
      </div>
    </div>
  );
}
