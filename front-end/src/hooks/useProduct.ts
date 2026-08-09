import { useQuery } from '@tanstack/react-query';
import { getProduct } from '../api/client';
import type { Variant } from '../api/contract';
import { catalogKeys } from '../api/queries';
import { ApiFailure } from '../api/result';

const MAX_RETRIES = 1;

export function useProduct(sku: string) {
  return useQuery<Variant, ApiFailure>({
    queryKey: catalogKeys.detail(sku),
    queryFn: async () => {
      const result = await getProduct(sku);

      if (result.kind === 'success') {
        return result.data;
      }

      throw new ApiFailure(result.kind, result.message);
    },
    retry: (attempt, error) => error.kind !== 'notFound' && attempt < MAX_RETRIES,
  });
}
