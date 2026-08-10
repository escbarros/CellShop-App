import type { OrderItem } from '../api/contract';
import { formatCents } from '../api/money';

type OrderLineProps = {
  item: OrderItem;
};

export function OrderLine({ item }: OrderLineProps) {
  return (
    <li className="flex items-start justify-between gap-4 py-4">
      <div className="min-w-0">
        <p className="text-sm font-medium text-ink">{item.name}</p>

        <p className="mt-1 text-sm text-ink-soft">
          {item.quantity === 1 ? '1 unidade' : `${item.quantity} unidades`}
          {item.quantity > 1 && ` · ${formatCents(item.unitPriceCents)} cada`}
        </p>

        <p className="mt-1 text-xs text-ink-faint">{item.sku}</p>
      </div>

      <p className="shrink-0 text-sm font-semibold text-ink">{formatCents(item.subtotalCents)}</p>
    </li>
  );
}
