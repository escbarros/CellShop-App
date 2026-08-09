import { describe, expect, it } from 'vitest';
import { stubApi, type ApiEnvelope } from './api-mock';

const SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';

describe('api mock', () => {
  it('answers a stubbed route with the response envelope', async () => {
    stubApi([{ path: '/products', data: [{ sku: SKU }] }]);

    const response = await fetch('http://localhost:3333/products');
    const body = (await response.json()) as ApiEnvelope<Array<{ sku: string }>>;

    expect(response.status).toBe(200);
    expect(body.data).toEqual([{ sku: SKU }]);
    expect(body.error).toBeNull();
  });

  it('rejects any request that was not stubbed', async () => {
    stubApi([{ path: '/products', data: [] }]);

    await expect(fetch(`http://localhost:3333/products/${SKU}`)).rejects.toThrow(
      'unstubbed network request',
    );
  });
});
