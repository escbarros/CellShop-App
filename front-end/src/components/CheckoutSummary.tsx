import { useCartLines } from '../hooks/useCartLines';
import { useProducts } from '../hooks/useProducts';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartItems, useCartUnitCount } from '../store/cart-store';
import { CheckoutEmpty } from './CheckoutEmpty';
import { CheckoutLine } from './CheckoutLine';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { CheckoutTotals } from './CheckoutTotals';
import { LoadError } from './LoadError';

export function CheckoutSummary() {
  const items = useCartItems();
  const unitCount = useCartUnitCount();
  const { lines, formattedSubtotal } = useCartLines();
  const { error, isPending, isError, refetch } = useProducts();
  const openCart = useCartDrawerStore((state) => state.open);

  if (items.length === 0) {
    return <CheckoutEmpty />;
  }

  if (isPending) {
    return <CheckoutSkeleton />;
  }

  if (isError) {
    return (
      <LoadError
        title="Não foi possível carregar seu pedido"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  const canPlaceOrder = lines.every(
    (line) => line.variant !== undefined && line.quantity <= line.variant.availableQty,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
      <section>
        <div className="flex items-baseline justify-between gap-4 border-b border-line pb-3">
          <h2 className="text-base font-semibold text-ink">Resumo do pedido</h2>

          <button
            type="button"
            onClick={openCart}
            className="text-sm font-medium text-ink-soft underline underline-offset-4 transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Editar carrinho
          </button>
        </div>

        <ul className="divide-y divide-line">
          {lines.map((line) => (
            <CheckoutLine key={line.sku} line={line} />
          ))}
        </ul>
      </section>

      <CheckoutTotals
        formattedSubtotal={formattedSubtotal}
        unitCount={unitCount}
        canPlaceOrder={canPlaceOrder}
      />
    </div>
  );
}
