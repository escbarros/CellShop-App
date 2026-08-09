import { useProduct } from '../hooks/useProduct';
import { LoadError } from './LoadError';
import { ProductDetailSkeleton } from './ProductDetailSkeleton';
import { ProductDetailView } from './ProductDetailView';
import { ProductNotFound } from './ProductNotFound';

type ProductDetailProps = {
  sku: string;
};

export function ProductDetail({ sku }: ProductDetailProps) {
  const { data, error, isPending, isError, refetch } = useProduct(sku);

  if (isPending) {
    return <ProductDetailSkeleton />;
  }

  if (isError) {
    if (error.kind === 'notFound') {
      return <ProductNotFound />;
    }

    return (
      <LoadError
        title="Não foi possível carregar esta capinha"
        message={error.message}
        onRetry={() => void refetch()}
      />
    );
  }

  return <ProductDetailView variant={data} />;
}
