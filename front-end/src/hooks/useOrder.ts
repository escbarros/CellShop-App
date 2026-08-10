import { useQuery } from '@tanstack/react-query';
import { getOrder } from '../api/client';
import type { OrderDetail } from '../api/contract';
import { orderKeys } from '../api/queries';
import { ApiFailure } from '../api/result';

const MAX_RETRIES = 1;

export function useOrder(number: string) {
  return useQuery<OrderDetail, ApiFailure>({
    queryKey: orderKeys.detail(number),
    queryFn: async () => {
      const result = await getOrder(number);

      if (result.kind === 'success') {
        return result.data;
      }

      throw new ApiFailure(result.kind, result.message);
    },
    retry: (attempt, error) => error.kind !== 'notFound' && attempt < MAX_RETRIES,
  });
}
