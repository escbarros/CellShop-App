import { useOrder } from '../hooks/useOrder';
import { LoadError } from './LoadError';
import { OrderDetailSkeleton } from './OrderDetailSkeleton';
import { OrderDetailView } from './OrderDetailView';
import { OrderNotFound } from './OrderNotFound';

type OrderDetailProps = {
  number: string;
};

export function OrderDetail({ number }: OrderDetailProps) {
  const { data, error, isPending, isError, refetch } = useOrder(number);

  if (isPending) {
    return <OrderDetailSkeleton />;
  }

  if (isError) {
    if (error.kind === 'notFound') {
      return <OrderNotFound message={error.message} />;
    }

    return (
      <LoadError
        title="Não foi possível carregar este pedido"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return <OrderDetailView order={data} />;
}
