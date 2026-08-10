import type { OrderDetail } from '../api/contract';
import { formatDateTime } from '../api/datetime';
import { formatCents } from '../api/money';
import { formatShipping } from '../api/shipping';
import { AmountsSummary } from './AmountsSummary';
import { OrderLine } from './OrderLine';
import { OrderStatusBadge } from './OrderStatusBadge';
import { OrderTimeline } from './OrderTimeline';
import { orderStatusStyle } from './order-status';
import { RecipientCard } from './RecipientCard';

type OrderDetailViewProps = {
  order: OrderDetail;
};

export function OrderDetailView({ order }: OrderDetailViewProps) {
  const unitCount = order.items.reduce((total, item) => total + item.quantity, 0);

  return (
    <>
      <header className="mb-8 flex flex-wrap items-start justify-between gap-4 border-b border-line pb-6">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
            Pedido {order.number}
          </h1>
          <p className="mt-1 text-sm text-ink-soft">Feito em {formatDateTime(order.createdAt)}</p>
        </div>

        <div className="flex flex-col items-start gap-2 sm:items-end">
          <OrderStatusBadge status={order.status} />
          <p className="max-w-xs text-sm text-ink-soft sm:text-right">
            {orderStatusStyle(order.status).note}
          </p>
        </div>
      </header>

      <div className="grid gap-8 lg:grid-cols-[1fr_20rem] lg:gap-12">
        <div className="space-y-10">
          <section>
            <h2 className="border-b border-line pb-3 text-base font-semibold text-ink">
              Itens do pedido
            </h2>

            <ul className="divide-y divide-line">
              {order.items.map((item) => (
                <OrderLine key={item.sku} item={item} />
              ))}
            </ul>
          </section>

          <section>
            <h2 className="border-b border-line pb-3 text-base font-semibold text-ink">
              Acompanhamento
            </h2>

            <OrderTimeline events={order.events} />
          </section>
        </div>

        <aside className="rounded-2xl border border-line bg-surface p-5 lg:sticky lg:top-28 lg:self-start">
          <RecipientCard recipient={order.recipient} />

          <section className="mt-5 border-t border-line pt-5">
            <h2 className="text-base font-semibold text-ink">Resumo de valores</h2>

            <AmountsSummary
              unitCount={unitCount}
              formattedSubtotal={formatCents(order.subtotalCents)}
              formattedShipping={formatShipping(order.shippingCents)}
              formattedTotal={formatCents(order.totalCents)}
            />
          </section>
        </aside>
      </div>
    </>
  );
}
