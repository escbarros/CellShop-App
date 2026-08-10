import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { OrderDetail } from '../components/OrderDetail';
import { OrderNotFound } from '../components/OrderNotFound';

export function OrderPage() {
  const { number } = useParams();

  if (!number) {
    return <OrderNotFound />;
  }

  return (
    <>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Voltar para a vitrine
      </Link>

      <OrderDetail number={number} />
    </>
  );
}
