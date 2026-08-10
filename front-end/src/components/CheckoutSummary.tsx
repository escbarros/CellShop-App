import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { Order } from '../api/contract';
import { CHECKOUT_RECIPIENT } from '../api/recipient';
import type { ApiResult } from '../api/result';
import { UNKNOWN_MESSAGE } from '../api/result';
import { useCartLines } from '../hooks/useCartLines';
import { useCheckout } from '../hooks/useCheckout';
import { useIdempotencyKey } from '../hooks/useIdempotencyKey';
import { useProducts } from '../hooks/useProducts';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartItems, useCartStore, useCartUnitCount } from '../store/cart-store';
import { CheckoutEmpty } from './CheckoutEmpty';
import { CheckoutLine } from './CheckoutLine';
import { CheckoutPanel } from './CheckoutPanel';
import type { CheckoutFailure } from './CheckoutPanel';
import { CheckoutSkeleton } from './CheckoutSkeleton';
import { LoadError } from './LoadError';

type RejectedCheckout = Exclude<ApiResult<Order>, { kind: 'success' }>;

function failureOf(result: RejectedCheckout): CheckoutFailure {
  const reasons =
    result.kind === 'validation' || result.kind === 'conflict'
      ? result.details.map((detail) => detail.message)
      : [];

  return { message: result.message, reasons };
}

export function CheckoutSummary() {
  const items = useCartItems();
  const unitCount = useCartUnitCount();
  const { lines, formattedSubtotal, formattedShipping, formattedTotal } = useCartLines();
  const { error, isPending, isError, refetch } = useProducts();
  const openCart = useCartDrawerStore((state) => state.open);
  const clearCart = useCartStore((state) => state.clear);
  const { key, renew } = useIdempotencyKey();
  const checkout = useCheckout();
  const navigate = useNavigate();
  const [failure, setFailure] = useState<CheckoutFailure | null>(null);

  function placeOrder() {
    if (checkout.isPending) {
      return;
    }

    setFailure(null);

    checkout.mutate(
      {
        payload: {
          items: items.map((item) => ({ sku: item.sku, quantity: item.quantity })),
          recipient: CHECKOUT_RECIPIENT,
        },
        idempotencyKey: key,
      },
      {
        onSuccess: (result) => {
          if (result.kind !== 'success') {
            setFailure(failureOf(result));

            return;
          }

          void navigate(`/orders/${result.data.number}`);
          clearCart();
          renew();
        },
        onError: () => setFailure({ message: UNKNOWN_MESSAGE, reasons: [] }),
      },
    );
  }

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

      <CheckoutPanel
        unitCount={unitCount}
        formattedSubtotal={formattedSubtotal}
        formattedShipping={formattedShipping}
        formattedTotal={formattedTotal}
        canPlaceOrder={canPlaceOrder}
        isSubmitting={checkout.isPending}
        failure={failure}
        onPlaceOrder={placeOrder}
      />
    </div>
  );
}
