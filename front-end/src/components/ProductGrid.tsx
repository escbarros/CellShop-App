import type { Variant } from '../api/contract';
import { ProductCard } from './ProductCard';

type ProductGridProps = {
  products: Variant[];
};

export function ProductGrid({ products }: ProductGridProps) {
  return (
    <ul className="grid grid-cols-2 gap-x-4 gap-y-9 sm:grid-cols-3 sm:gap-x-5 lg:grid-cols-4 lg:gap-x-6">
      {products.map((variant) => (
        <li key={variant.sku} className="h-full">
          <ProductCard variant={variant} />
        </li>
      ))}
    </ul>
  );
}
