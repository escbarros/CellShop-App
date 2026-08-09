const LOW_STOCK_THRESHOLD = 5;

type StockBadgeProps = {
  availableQty: number;
};

export function StockBadge({ availableQty }: StockBadgeProps) {
  if (availableQty === 0) {
    return (
      <span className="rounded-full bg-ink/85 px-2.5 py-1 text-xs font-semibold text-surface backdrop-blur">
        Esgotado
      </span>
    );
  }

  if (availableQty > LOW_STOCK_THRESHOLD) {
    return null;
  }

  return (
    <span className="rounded-full bg-coral-soft px-2.5 py-1 text-xs font-semibold text-coral">
      {availableQty === 1 ? 'Última unidade' : `Últimas ${availableQty} unidades`}
    </span>
  );
}
