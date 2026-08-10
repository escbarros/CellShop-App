import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { IDEMPOTENCY_KEY_HEADER, validCheckoutPayload } from '../../test/checkout-payload';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';
import { StockRepository } from '../repositories/repository.contracts';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { OrderResponse } from './dto/order.response';

const ABUNDANT_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const ABUNDANT_AVAILABLE_QTY = 12;

const SCARCE_SKU = 'CAP-BLOOM-IP16-AIS-TRA';
const SCARCE_AVAILABLE_QTY = 3;

const SOLD_OUT_SKU = 'CAP-MAGNOLIA-S24-AIS-TRA';
const LAST_UNIT_SKU = 'CAP-BUTTERFLY-IP14-AIS-TRA';

const CONCURRENT_ATTEMPTS = 10;

const PURCHASED_QTY = 2;

describe('checkout stock decrement', () => {
  let app: NestExpressApplication;

  beforeEach(async () => {
    app = await createTestApp();
  });

  afterEach(async () => {
    await app.close();
  });

  function postCheckout(items: CheckoutItemDto[], attempt = 0) {
    return request(app.getHttpServer())
      .post('/checkout')
      .set(
        IDEMPOTENCY_KEY_HEADER,
        `8f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e${String(attempt).padStart(2, '0')}`,
      )
      .send({ ...validCheckoutPayload(), items });
  }

  function stockOf(sku: string) {
    return app.get(StockRepository).find(sku);
  }

  async function rejectedCheckout(items: CheckoutItemDto[]): Promise<ApiResponse<never>> {
    const response = await postCheckout(items).expect(409);

    return response.body as ApiResponse<never>;
  }

  it('returns 409 when the requested quantity exceeds stock', async () => {
    const body = await rejectedCheckout([{ sku: SCARCE_SKU, quantity: 5 }]);

    expect(body.data).toBeNull();
    expect(body.error?.code).toBe('INSUFFICIENT_STOCK');
    expect(body.error?.details?.[0]).toMatchObject({
      sku: SCARCE_SKU,
      available: SCARCE_AVAILABLE_QTY,
    });
    expect(stockOf(SCARCE_SKU)?.availableQty).toBe(SCARCE_AVAILABLE_QTY);
    expect(stockOf(SCARCE_SKU)?.reservedQty).toBe(0);
  });

  it('returns 409 for a sold-out variant', async () => {
    const body = await rejectedCheckout([{ sku: SOLD_OUT_SKU, quantity: 1 }]);

    expect(body.error?.code).toBe('INSUFFICIENT_STOCK');
    expect(body.error?.details?.[0]).toMatchObject({ sku: SOLD_OUT_SKU, available: 0 });
  });

  it('restores the first item when a later item is unavailable', async () => {
    await rejectedCheckout([
      { sku: ABUNDANT_SKU, quantity: PURCHASED_QTY },
      { sku: SOLD_OUT_SKU, quantity: 1 },
    ]);

    expect(stockOf(ABUNDANT_SKU)?.availableQty).toBe(ABUNDANT_AVAILABLE_QTY);
    expect(stockOf(ABUNDANT_SKU)?.reservedQty).toBe(0);
  });

  it('confirms exactly one of ten concurrent purchases of the last unit', async () => {
    const responses = await Promise.all(
      Array.from({ length: CONCURRENT_ATTEMPTS }, (_unused, attempt) =>
        postCheckout([{ sku: LAST_UNIT_SKU, quantity: 1 }], attempt),
      ),
    );

    const statuses = responses.map((response) => response.status);

    expect(statuses.filter((status) => status === 201)).toHaveLength(1);
    expect(statuses.filter((status) => status === 409)).toHaveLength(CONCURRENT_ATTEMPTS - 1);
    expect(stockOf(LAST_UNIT_SKU)?.availableQty).toBe(0);
    expect(stockOf(LAST_UNIT_SKU)?.reservedQty).toBe(1);
  });

  it('leaves stock with the exact difference after a successful purchase', async () => {
    const response = await postCheckout([{ sku: ABUNDANT_SKU, quantity: PURCHASED_QTY }]).expect(
      201,
    );
    const body = response.body as ApiResponse<OrderResponse>;

    expect(body.data?.status).toBe('CONFIRMED');
    expect(stockOf(ABUNDANT_SKU)?.availableQty).toBe(ABUNDANT_AVAILABLE_QTY - PURCHASED_QTY);
    expect(stockOf(ABUNDANT_SKU)?.reservedQty).toBe(PURCHASED_QTY);
  });
});
