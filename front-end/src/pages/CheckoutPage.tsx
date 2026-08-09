import { ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CheckoutSummary } from '../components/CheckoutSummary';

export function CheckoutPage() {
  return (
    <>
      <Link
        to="/"
        className="mb-6 inline-flex items-center gap-1 text-sm font-medium text-ink-soft transition hover:text-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
      >
        <ChevronLeft aria-hidden="true" className="h-4 w-4" />
        Continuar comprando
      </Link>

      <h1 className="mb-8 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
        Finalizar compra
      </h1>

      <CheckoutSummary />
    </>
  );
}
