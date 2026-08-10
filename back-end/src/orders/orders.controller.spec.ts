import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import {
  IDEMPOTENCY_KEY_HEADER,
  SAMPLE_IDEMPOTENCY_KEY,
  validCheckoutPayload,
} from '../../test/checkout-payload';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';
import { OrderEventResponse } from './dto/order-event.response';
import { OrderResponse } from './dto/order.response';
import { ORDER_STATUSES } from './order.model';

type OrderDetail = OrderResponse & {
  recipient: Record<'name' | 'taxId' | 'city', string>;
  events: OrderEventResponse[];
};

const PURCHASED_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const PURCHASED_QTY = 2;

const MASKED_TAX_ID = '***.533.447-**';

const UNKNOWN_NUMBER = 'CCS-2026-999999';

describe('order lookup', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  async function placeOrder(): Promise<OrderResponse> {
    const response = await request(app.getHttpServer())
      .post('/checkout')
      .set(IDEMPOTENCY_KEY_HEADER, SAMPLE_IDEMPOTENCY_KEY)
      .send({ ...validCheckoutPayload(), items: [{ sku: PURCHASED_SKU, quantity: PURCHASED_QTY }] })
      .expect(201);

    return (response.body as ApiResponse<OrderResponse>).data as OrderResponse;
  }

  async function lookup(number: string): Promise<OrderDetail> {
    const response = await request(app.getHttpServer()).get(`/orders/${number}`).expect(200);

    return (response.body as ApiResponse<OrderDetail>).data as OrderDetail;
  }

  it('returns a created order with the same total', async () => {
    const placed = await placeOrder();
    const found = await lookup(placed.number);

    expect(found.number).toBe(placed.number);
    expect(found.status).toBe(ORDER_STATUSES.CONFIRMED);
    expect(found.subtotalCents).toBe(placed.subtotalCents);
    expect(found.shippingCents).toBe(placed.shippingCents);
    expect(found.totalCents).toBe(placed.totalCents);
    expect(found.items).toEqual(placed.items);
  });

  it('returns 404 ORDER_NOT_FOUND for an unknown number', async () => {
    const response = await request(app.getHttpServer())
      .get(`/orders/${UNKNOWN_NUMBER}`)
      .expect(404);
    const body = response.body as ApiResponse<never>;

    expect(body.data).toBeNull();
    expect(body.error?.code).toBe('ORDER_NOT_FOUND');
  });

  it('masks the tax id in the response', async () => {
    const placed = await placeOrder();
    const found = await lookup(placed.number);

    expect(found.recipient.taxId).toBe(MASKED_TAX_ID);
    expect(found.recipient.taxId).not.toContain(validCheckoutPayload().recipient.taxId);
    expect(found.recipient.name).toBe(validCheckoutPayload().recipient.name);
    expect(found.recipient.city).toBe(validCheckoutPayload().recipient.city);
  });

  it('returns events in chronological order', async () => {
    const placed = await placeOrder();
    const found = await lookup(placed.number);

    expect(found.events).toHaveLength(2);
    expect(found.events[0]).toMatchObject({
      previousStatus: null,
      newStatus: ORDER_STATUSES.PENDING,
    });
    expect(found.events[1]).toMatchObject({
      previousStatus: ORDER_STATUSES.PENDING,
      newStatus: ORDER_STATUSES.CONFIRMED,
    });

    const timestamps = found.events.map((event) => Date.parse(event.createdAt));

    expect(timestamps).toEqual([...timestamps].sort((first, second) => first - second));
  });
});
