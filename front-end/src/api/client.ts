import type { CheckoutPayload, Order, Variant } from './contract';
import type { ApiResult } from './result';
import { interpret, networkFailure } from './result';

export const REQUEST_TIMEOUT_MS = 10_000;

export function listProducts(): Promise<ApiResult<Variant[]>> {
  return request<Variant[]>('/products');
}

export function submitCheckout(
  payload: CheckoutPayload,
  idempotencyKey: string,
): Promise<ApiResult<Order>> {
  return request<Order>('/checkout', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(payload),
  });
}

async function request<T>(path: string, init?: RequestInit): Promise<ApiResult<T>> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${import.meta.env.VITE_API_URL}${path}`, {
      ...init,
      signal: controller.signal,
    });

    return await interpret<T>(response);
  } catch {
    return networkFailure<T>();
  } finally {
    clearTimeout(timeout);
  }
}
