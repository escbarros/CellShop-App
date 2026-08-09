import { ChevronLeft } from 'lucide-react';
import { Link, useParams } from 'react-router-dom';
import { ProductDetail } from '../components/ProductDetail';
import { ProductNotFound } from '../components/ProductNotFound';

export function ProductDetailPage() {
  const { sku } = useParams();

  if (!sku) {
    return <ProductNotFound />;
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

      <ProductDetail sku={sku} />
    </>
  );
}
