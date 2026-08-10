import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { IDEMPOTENCY_KEY_HEADER, validCheckoutPayload } from '../../test/checkout-payload';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';
import { StockRepository } from '../repositories/repository.contracts';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { OrderResponse } from './dto/order.response';

const PURCHASED_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const PURCHASED_AVAILABLE_QTY = 12;
const PURCHASED_QTY = 2;

const OTHER_SKU = 'CAP-CAPPUCCINO-IP16-AIS-TRA';
const OTHER_AVAILABLE_QTY = 7;

const REUSED_KEY = '8f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f';
const OTHER_KEY = '5c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e9f';

const PURCHASED_ITEMS: CheckoutItemDto[] = [{ sku: PURCHASED_SKU, quantity: PURCHASED_QTY }];
const OTHER_ITEMS: CheckoutItemDto[] = [{ sku: OTHER_SKU, quantity: 1 }];

describe('checkout idempotency', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  function postCheckout(items: CheckoutItemDto[], idempotencyKey: string) {
    return request(app.getHttpServer())
      .post('/checkout')
      .set(IDEMPOTENCY_KEY_HEADER, idempotencyKey)
      .send({ ...validCheckoutPayload(), items });
  }

  function stockOf(sku: string) {
    return app.get(StockRepository).find(sku);
  }

  async function orderFrom(
    items: CheckoutItemDto[],
    idempotencyKey: string,
    status: number,
  ): Promise<OrderResponse> {
    const response = await postCheckout(items, idempotencyKey).expect(status);
    const body = response.body as ApiResponse<OrderResponse>;

    expect(body.error).toBeNull();

    return body.data as OrderResponse;
  }

  it('returns 201 then 200 with the same order number', async () => {
    const placed = await orderFrom(PURCHASED_ITEMS, REUSED_KEY, 201);
    const replayed = await orderFrom(PURCHASED_ITEMS, REUSED_KEY, 200);

    expect(replayed.number).toBe(placed.number);
    expect(replayed).toEqual(placed);
  });

  it('decrements stock only once across both calls', async () => {
    await orderFrom(PURCHASED_ITEMS, REUSED_KEY, 201);
    await orderFrom(PURCHASED_ITEMS, REUSED_KEY, 200);

    expect(stockOf(PURCHASED_SKU)?.availableQty).toBe(PURCHASED_AVAILABLE_QTY - PURCHASED_QTY);
    expect(stockOf(PURCHASED_SKU)?.reservedQty).toBe(PURCHASED_QTY);
  });

  it('creates a single order for two concurrent calls with the same key', async () => {
    const responses = await Promise.all([
      postCheckout(PURCHASED_ITEMS, REUSED_KEY),
      postCheckout(PURCHASED_ITEMS, REUSED_KEY),
    ]);

    const statuses = responses.map((response) => response.status);
    const bodies = responses.map((response) => response.body as ApiResponse<OrderResponse>);

    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 200)).toHaveLength(1);
    expect(bodies[0].data?.number).toBe(bodies[1].data?.number);
    expect(stockOf(PURCHASED_SKU)?.availableQty).toBe(PURCHASED_AVAILABLE_QTY - PURCHASED_QTY);
    expect(stockOf(PURCHASED_SKU)?.reservedQty).toBe(PURCHASED_QTY);
  });

  it('creates two orders for different keys with the same payload', async () => {
    const first = await orderFrom(PURCHASED_ITEMS, REUSED_KEY, 201);
    const second = await orderFrom(PURCHASED_ITEMS, OTHER_KEY, 201);

    expect(second.number).not.toBe(first.number);
    expect(stockOf(PURCHASED_SKU)?.availableQty).toBe(PURCHASED_AVAILABLE_QTY - PURCHASED_QTY * 2);
  });

  it('returns the original order when the same key arrives with a different payload', async () => {
    const placed = await orderFrom(PURCHASED_ITEMS, REUSED_KEY, 201);
    const replayed = await orderFrom(OTHER_ITEMS, REUSED_KEY, 200);

    expect(replayed).toEqual(placed);
    expect(replayed.items).toHaveLength(1);
    expect(replayed.items[0].sku).toBe(PURCHASED_SKU);
    expect(stockOf(OTHER_SKU)?.availableQty).toBe(OTHER_AVAILABLE_QTY);
    expect(stockOf(OTHER_SKU)?.reservedQty).toBe(0);
  });
});
