import { useOrders } from '../hooks/useOrders';
import { LoadError } from './LoadError';
import { OrderHistoryEmpty } from './OrderHistoryEmpty';
import { OrderHistoryLine } from './OrderHistoryLine';
import { OrderHistorySkeleton } from './OrderHistorySkeleton';

export function OrderHistory() {
  const { data, error, isPending, isError, refetch } = useOrders();

  if (isPending) {
    return <OrderHistorySkeleton />;
  }

  if (isError) {
    return (
      <LoadError
        title="Não foi possível carregar seus pedidos"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  if (data.length === 0) {
    return <OrderHistoryEmpty />;
  }

  return (
    <ul className="space-y-3">
      {data.map((order) => (
        <OrderHistoryLine key={order.number} order={order} />
      ))}
    </ul>
  );
}
