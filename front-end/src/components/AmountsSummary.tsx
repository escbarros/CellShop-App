type AmountsSummaryProps = {
  unitCount: number;
  formattedSubtotal: string;
  formattedShipping: string;
  formattedTotal: string;
};

export function AmountsSummary({
  unitCount,
  formattedSubtotal,
  formattedShipping,
  formattedTotal,
}: AmountsSummaryProps) {
  return (
    <dl className="mt-4 space-y-2 text-sm">
      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-ink-soft">
          Subtotal · {unitCount === 1 ? '1 unidade' : `${unitCount} unidades`}
        </dt>
        <dd className="font-medium text-ink">{formattedSubtotal}</dd>
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <dt className="text-ink-soft">Frete</dt>
        <dd className="font-medium text-ink">{formattedShipping}</dd>
      </div>

      <div className="flex items-baseline justify-between gap-4 border-t border-line pt-3">
        <dt className="font-medium text-ink">Total</dt>
        <dd className="text-lg font-semibold text-ink">{formattedTotal}</dd>
      </div>
    </dl>
  );
}
