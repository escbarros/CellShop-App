import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { OrderSummary } from '../api/contract';
import { formatDateTime } from '../api/datetime';
import { formatCents } from '../api/money';
import { OrderStatusBadge } from './OrderStatusBadge';

type OrderHistoryLineProps = {
  order: OrderSummary;
};

export function OrderHistoryLine({ order }: OrderHistoryLineProps) {
  return (
    <li>
      <Link
        to={`/orders/${order.number}`}
        className="flex items-center gap-4 rounded-2xl border border-line bg-surface p-4 transition hover:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink sm:p-5"
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-2">
            <p className="text-sm font-semibold text-ink">{order.number}</p>
            <OrderStatusBadge status={order.status} />
          </div>

          <p className="mt-2 text-sm text-ink-soft">
            {formatDateTime(order.createdAt)} ·{' '}
            {order.itemCount === 1 ? '1 unidade' : `${order.itemCount} unidades`}
          </p>
        </div>

        <p className="shrink-0 text-sm font-semibold text-ink">{formatCents(order.totalCents)}</p>

        <ChevronRight aria-hidden="true" className="h-4 w-4 shrink-0 text-ink-faint" />
      </Link>
    </li>
  );
}
