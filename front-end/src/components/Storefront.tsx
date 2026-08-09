import { useProducts } from '../hooks/useProducts';
import { ProductGrid } from './ProductGrid';
import { StorefrontEmpty } from './StorefrontEmpty';
import { StorefrontError } from './StorefrontError';
import { StorefrontSkeleton } from './StorefrontSkeleton';

export function Storefront() {
  const { data, error, isPending, isError, refetch } = useProducts();

  if (isPending) {
    return <StorefrontSkeleton />;
  }

  if (isError) {
    return <StorefrontError message={error.message} onRetry={() => void refetch()} />;
  }

  if (data.length === 0) {
    return <StorefrontEmpty />;
  }

  return <ProductGrid products={data} />;
}
