import { useQuery } from '@tanstack/react-query';
import { listProducts } from '../api/client';
import type { Variant } from '../api/contract';
import { catalogKeys } from '../api/queries';

export function useProducts() {
  return useQuery<Variant[]>({
    queryKey: catalogKeys.list(),
    queryFn: async () => {
      const result = await listProducts();

      if (result.kind === 'success') {
        return result.data;
      }

      throw new Error(result.message);
    },
  });
}
