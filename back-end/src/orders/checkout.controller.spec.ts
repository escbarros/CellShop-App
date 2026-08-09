import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import {
  IDEMPOTENCY_KEY_HEADER,
  SAMPLE_IDEMPOTENCY_KEY,
  validCheckoutPayload,
} from '../../test/checkout-payload';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';
import { OrderRepository } from '../repositories/repository.contracts';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { OrderResponse } from './dto/order.response';

const SCRAPBOOK_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const SCRAPBOOK_NAME = 'Floral Scrapbook · iPhone 16';
const SCRAPBOOK_PRICE_CENTS = 7990;

const CAPPUCCINO_SKU = 'CAP-CAPPUCCINO-IP16-AIS-TRA';
const INACTIVE_SKU = 'CAP-SUNRISE-S24-AIS-TRA';
const UNKNOWN_SKU = 'CAP-NOT-A-REAL-SKU';

const ORDER_NUMBER_PATTERN = /^CCS-\d{4}-\d{6}$/;

describe('checkout endpoint', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  function postCheckout(items: CheckoutItemDto[]) {
    return request(app.getHttpServer())
      .post('/checkout')
      .set(IDEMPOTENCY_KEY_HEADER, SAMPLE_IDEMPOTENCY_KEY)
      .send({ ...validCheckoutPayload(), items });
  }

  async function placeOrder(items: CheckoutItemDto[]): Promise<OrderResponse> {
    const response = await postCheckout(items).expect(201);
    const body = response.body as ApiResponse<OrderResponse>;

    expect(body.error).toBeNull();

    return body.data as OrderResponse;
  }

  async function rejectedCheckout(items: CheckoutItemDto[]): Promise<ApiResponse<never>> {
    const response = await postCheckout(items).expect(404);

    return response.body as ApiResponse<never>;
  }

  it('computes subtotal, shipping and total for a single item', async () => {
    const order = await placeOrder([{ sku: SCRAPBOOK_SKU, quantity: 2 }]);

    expect(order.subtotalCents).toBe(15980);
    expect(order.shippingCents).toBe(1990);
    expect(order.discountCents).toBe(0);
    expect(order.totalCents).toBe(17970);
    expect(order.status).toBe('PENDING');
    expect(new Date(order.createdAt).toISOString()).toBe(order.createdAt);
  });

  it('waives shipping above the free threshold', async () => {
    const order = await placeOrder([{ sku: CAPPUCCINO_SKU, quantity: 2 }]);

    expect(order.subtotalCents).toBe(21980);
    expect(order.shippingCents).toBe(0);
    expect(order.totalCents).toBe(21980);
  });

  it('returns 404 for an unknown sku', async () => {
    const body = await rejectedCheckout([{ sku: UNKNOWN_SKU, quantity: 1 }]);

    expect(body.data).toBeNull();
    expect(body.error?.code).toBe('SKU_NOT_FOUND');
    expect(body.error?.details?.[0].field).toBe('items.0.sku');
    expect(body.error?.details?.[0].message).toContain(UNKNOWN_SKU);
  });

  it('returns 404 for an inactive sku', async () => {
    const body = await rejectedCheckout([{ sku: INACTIVE_SKU, quantity: 1 }]);

    expect(body.error?.code).toBe('SKU_NOT_FOUND');
    expect(body.error?.details?.[0].message).toContain(INACTIVE_SKU);
  });

  it('reads back a saved order without touching the catalog', async () => {
    const order = await placeOrder([{ sku: SCRAPBOOK_SKU, quantity: 2 }]);
    const saved = app.get(OrderRepository).findByNumber(order.number);

    expect(saved?.items).toEqual([
      {
        variantId: SCRAPBOOK_SKU,
        quantity: 2,
        unitPriceCents: SCRAPBOOK_PRICE_CENTS,
        subtotalCents: 15980,
        skuSnapshot: SCRAPBOOK_SKU,
        nameSnapshot: SCRAPBOOK_NAME,
      },
    ]);
    expect(order.items).toEqual([
      {
        sku: SCRAPBOOK_SKU,
        name: SCRAPBOOK_NAME,
        quantity: 2,
        unitPriceCents: SCRAPBOOK_PRICE_CENTS,
        subtotalCents: 15980,
      },
    ]);
  });

  it('generates an order number matching CCS-YYYY-NNNNNN', async () => {
    const order = await placeOrder([{ sku: SCRAPBOOK_SKU, quantity: 1 }]);

    expect(order.number).toMatch(ORDER_NUMBER_PATTERN);
  });
});
