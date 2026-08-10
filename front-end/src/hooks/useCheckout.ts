import { useMutation, useQueryClient } from '@tanstack/react-query';
import { submitCheckout } from '../api/client';
import type { CheckoutPayload, Order } from '../api/contract';
import { catalogKeys, orderKeys } from '../api/queries';
import type { ApiResult } from '../api/result';

export type CheckoutAttempt = {
  payload: CheckoutPayload;
  idempotencyKey: string;
};

export function useCheckout() {
  const queryClient = useQueryClient();

  return useMutation<ApiResult<Order>, Error, CheckoutAttempt>({
    mutationFn: ({ payload, idempotencyKey }) => submitCheckout(payload, idempotencyKey),
    onSuccess: (result) => {
      if (result.kind === 'success') {
        void queryClient.invalidateQueries({ queryKey: catalogKeys.all });
        void queryClient.invalidateQueries({ queryKey: orderKeys.all });
      }
    },
  });
}
