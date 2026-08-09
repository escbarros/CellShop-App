type CheckoutTotalsProps = {
  formattedSubtotal: string;
  unitCount: number;
  canPlaceOrder: boolean;
};

export function CheckoutTotals({
  formattedSubtotal,
  unitCount,
  canPlaceOrder,
}: CheckoutTotalsProps) {
  return (
    <aside className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-28">
      <h2 className="text-base font-semibold text-ink">Resumo de valores</h2>

      <dl className="mt-4 flex items-baseline justify-between gap-4 text-sm">
        <dt className="text-ink-soft">
          Subtotal · {unitCount === 1 ? '1 unidade' : `${unitCount} unidades`}
        </dt>
        <dd className="font-medium text-ink">{formattedSubtotal}</dd>
      </dl>

      <button
        type="button"
        disabled
        aria-describedby={canPlaceOrder ? undefined : 'checkout-cta-note'}
        className="mt-5 h-12 w-full cursor-not-allowed rounded-xl border border-line bg-tile text-sm font-semibold text-ink-faint"
      >
        Finalizar compra
      </button>

      {!canPlaceOrder && (
        <p id="checkout-cta-note" className="mt-2 text-xs text-coral">
          Revise os itens marcados acima antes de seguir.
        </p>
      )}
    </aside>
  );
}
