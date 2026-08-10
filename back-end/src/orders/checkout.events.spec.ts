import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { IDEMPOTENCY_KEY_HEADER, validCheckoutPayload } from '../../test/checkout-payload';
import { createTestApp } from '../../test/create-test-app';
import { OrderRepository } from '../repositories/repository.contracts';
import { transitionEvent } from './checkout.service';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { ORDER_STATUSES, OrderEvent } from './order.model';

const PURCHASED_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const SOLD_OUT_SKU = 'CAP-MAGNOLIA-S24-AIS-TRA';

const EVENT_SOURCE = 'API';

const IDEMPOTENCY_KEY = '8f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f';

const PURCHASED_ITEMS: CheckoutItemDto[] = [{ sku: PURCHASED_SKU, quantity: 2 }];
const SOLD_OUT_ITEMS: CheckoutItemDto[] = [{ sku: SOLD_OUT_SKU, quantity: 1 }];

const CREATED_AT = new Date('2026-08-09T12:00:00.000Z');

describe('order event trail', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  function postCheckout(items: CheckoutItemDto[], status: number) {
    return request(app.getHttpServer())
      .post('/checkout')
      .set(IDEMPOTENCY_KEY_HEADER, IDEMPOTENCY_KEY)
      .send({ ...validCheckoutPayload(), items })
      .expect(status);
  }

  function trailOf(idempotencyKey: string): readonly OrderEvent[] {
    const orders = app.get(OrderRepository);
    const aggregate = orders.findByIdempotencyKey(idempotencyKey);

    return aggregate === undefined ? [] : orders.eventsOf(aggregate.order.id);
  }

  it('records two events in order for a successful purchase', async () => {
    await postCheckout(PURCHASED_ITEMS, 201);

    const events = trailOf(IDEMPOTENCY_KEY);

    expect(events).toHaveLength(2);
    expect(events[0]).toMatchObject({
      previousStatus: null,
      newStatus: ORDER_STATUSES.PENDING,
      source: EVENT_SOURCE,
    });
    expect(events[1]).toMatchObject({
      previousStatus: ORDER_STATUSES.PENDING,
      newStatus: ORDER_STATUSES.CONFIRMED,
      source: EVENT_SOURCE,
    });
  });

  it('records a cancellation event naming the unavailable sku', async () => {
    await postCheckout(SOLD_OUT_ITEMS, 409);

    const cancelled = app.get(OrderRepository).findByIdempotencyKey(IDEMPOTENCY_KEY);
    const events = trailOf(IDEMPOTENCY_KEY);

    expect(cancelled?.order.status).toBe(ORDER_STATUSES.CANCELLED);
    expect(events).toHaveLength(2);
    expect(events[1]).toMatchObject({
      previousStatus: ORDER_STATUSES.PENDING,
      newStatus: ORDER_STATUSES.CANCELLED,
      source: EVENT_SOURCE,
    });
    expect(events[1].message).toContain(SOLD_OUT_SKU);
  });

  it('throws on an invalid transition', () => {
    expect(() =>
      transitionEvent(ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.PENDING, 'Reaberto', CREATED_AT),
    ).toThrow();

    expect(() =>
      transitionEvent(ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED, 'Confirmado', CREATED_AT),
    ).not.toThrow();
  });

  it('does not record new events for an idempotent replay', async () => {
    await postCheckout(PURCHASED_ITEMS, 201);
    await postCheckout(PURCHASED_ITEMS, 200);

    expect(trailOf(IDEMPOTENCY_KEY)).toHaveLength(2);
  });
});
