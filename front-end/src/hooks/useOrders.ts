import { useQuery } from '@tanstack/react-query';
import { listOrders } from '../api/client';
import type { OrderSummary } from '../api/contract';
import { orderKeys } from '../api/queries';
import { ApiFailure } from '../api/result';

export function useOrders() {
  return useQuery<OrderSummary[], ApiFailure>({
    queryKey: orderKeys.list(),
    queryFn: async () => {
      const result = await listOrders();

      if (result.kind === 'success') {
        return result.data;
      }

      throw new ApiFailure(result.kind, result.message);
    },
  });
}
