import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { IDEMPOTENCY_KEY_HEADER, validCheckoutPayload } from '../../test/checkout-payload';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { OrderStatusValue } from './dto/order-status';
import { ORDER_STATUSES } from './order.model';

type OrderSummary = {
  number: string;
  status: OrderStatusValue;
  itemCount: number;
  totalCents: number;
  createdAt: string;
};

const PURCHASED_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const SOLD_OUT_SKU = 'CAP-MAGNOLIA-S24-AIS-TRA';

const FIRST_KEY = '8f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f';
const SECOND_KEY = '5c7d8e9f-0a1b-4c2d-8e3f-4a5b6c7d8e9f';

describe('order list', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  function postCheckout(items: CheckoutItemDto[], idempotencyKey: string, status: number) {
    return request(app.getHttpServer())
      .post('/checkout')
      .set(IDEMPOTENCY_KEY_HEADER, idempotencyKey)
      .send({ ...validCheckoutPayload(), items })
      .expect(status);
  }

  async function listOrders(): Promise<OrderSummary[]> {
    const response = await request(app.getHttpServer()).get('/orders').expect(200);
    const body = response.body as ApiResponse<OrderSummary[]>;

    expect(body.error).toBeNull();

    return body.data as OrderSummary[];
  }

  it('returns an empty list before any purchase', async () => {
    expect(await listOrders()).toEqual([]);
  });

  it('summarises a placed order without any personal data', async () => {
    await postCheckout([{ sku: PURCHASED_SKU, quantity: 2 }], FIRST_KEY, 201);

    const [summary] = await listOrders();

    expect(summary).toEqual({
      number: expect.stringMatching(/^CCS-\d{4}-\d{6}$/) as unknown,
      status: ORDER_STATUSES.CONFIRMED,
      itemCount: 2,
      totalCents: 17970,
      createdAt: expect.any(String) as unknown,
    });
  });

  it('lists the newest order first', async () => {
    await postCheckout([{ sku: PURCHASED_SKU, quantity: 1 }], FIRST_KEY, 201);
    await postCheckout([{ sku: PURCHASED_SKU, quantity: 1 }], SECOND_KEY, 201);

    const numbers = (await listOrders()).map((summary) => summary.number);

    expect(numbers).toEqual(['CCS-2026-000002', 'CCS-2026-000001']);
  });

  it('lists an order that was cancelled for lack of stock', async () => {
    await postCheckout([{ sku: SOLD_OUT_SKU, quantity: 1 }], FIRST_KEY, 409);

    const summaries = await listOrders();

    expect(summaries).toHaveLength(1);
    expect(summaries[0].status).toBe(ORDER_STATUSES.CANCELLED);
  });
});
