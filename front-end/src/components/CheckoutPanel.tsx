import { CHECKOUT_RECIPIENT } from '../api/recipient';
import { AmountsSummary } from './AmountsSummary';
import { RecipientCard } from './RecipientCard';

export type CheckoutFailure = {
  message: string;
  reasons: string[];
};

type CheckoutPanelProps = {
  unitCount: number;
  formattedSubtotal: string;
  formattedShipping: string;
  formattedTotal: string;
  canPlaceOrder: boolean;
  isSubmitting: boolean;
  failure: CheckoutFailure | null;
  onPlaceOrder: () => void;
};

export function CheckoutPanel({
  unitCount,
  formattedSubtotal,
  formattedShipping,
  formattedTotal,
  canPlaceOrder,
  isSubmitting,
  failure,
  onPlaceOrder,
}: CheckoutPanelProps) {
  return (
    <aside
      aria-busy={isSubmitting}
      className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-28 lg:self-start"
    >
      <RecipientCard recipient={CHECKOUT_RECIPIENT} />

      <section className="mt-5 border-t border-line pt-5">
        <h2 className="text-base font-semibold text-ink">Resumo de valores</h2>

        <AmountsSummary
          unitCount={unitCount}
          formattedSubtotal={formattedSubtotal}
          formattedShipping={formattedShipping}
          formattedTotal={formattedTotal}
        />
      </section>

      {failure && (
        <div role="alert" className="mt-4 rounded-xl bg-coral-soft px-3 py-3 text-sm text-coral">
          <p className="font-medium">{failure.message}</p>

          {failure.reasons.length > 0 && (
            <ul className="mt-1.5 list-disc space-y-1 pl-4">
              {failure.reasons.map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      <button
        type="button"
        onClick={onPlaceOrder}
        disabled={!canPlaceOrder || isSubmitting}
        aria-describedby={canPlaceOrder ? undefined : 'checkout-cta-note'}
        className="mt-5 h-12 w-full rounded-xl bg-ink text-sm font-semibold text-surface transition hover:bg-ink/90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-not-allowed disabled:border disabled:border-line disabled:bg-tile disabled:text-ink-faint"
      >
        {isSubmitting ? 'Finalizando compra...' : 'Finalizar compra'}
      </button>

      {!canPlaceOrder && (
        <p id="checkout-cta-note" className="mt-2 text-xs text-coral">
          Revise os itens marcados acima antes de seguir.
        </p>
      )}
    </aside>
  );
}
