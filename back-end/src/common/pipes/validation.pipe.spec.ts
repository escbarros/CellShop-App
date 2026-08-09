import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import {
  IDEMPOTENCY_KEY_HEADER,
  SAMPLE_IDEMPOTENCY_KEY,
  validCheckoutPayload,
} from '../../../test/checkout-payload';
import { createTestApp } from '../../../test/create-test-app';
import { ApiErrorDetail, ApiResponse } from '../http/api-response';

const REJECTED_QUANTITIES = [-1, 1.5, '2'];

describe('checkout payload validation', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  function postCheckout(body: object) {
    return request(app.getHttpServer())
      .post('/checkout')
      .set(IDEMPOTENCY_KEY_HEADER, SAMPLE_IDEMPOTENCY_KEY)
      .send(body);
  }

  async function detailsOf(body: object): Promise<ApiErrorDetail[]> {
    const response = await postCheckout(body).expect(422);
    const payload = response.body as ApiResponse<never>;

    expect(payload.data).toBeNull();
    expect(payload.error?.code).toBe('VALIDATION_FAILED');
    expect(payload.error?.message).toBe('Confira os dados informados e tente de novo.');

    return payload.error?.details ?? [];
  }

  function fieldsOf(details: ApiErrorDetail[]): string[] {
    return [...new Set(details.map((detail) => detail.field))].sort();
  }

  function messagesFor(details: ApiErrorDetail[], field: string): string[] {
    return details.filter((detail) => detail.field === field).map((detail) => detail.message);
  }

  function payloadWithQuantity(quantity: unknown) {
    const payload = validCheckoutPayload();

    return { ...payload, items: [{ ...payload.items[0], quantity }] };
  }

  it('reports every missing field in a single response', async () => {
    const details = await detailsOf({});

    expect(fieldsOf(details)).toEqual(['items', 'recipient']);
    expect(messagesFor(details, 'items')[0]).toBe('Informe os itens da compra.');
    expect(messagesFor(details, 'recipient')[0]).toBe('Informe os dados de entrega.');
  });

  it('rejects zero quantity', async () => {
    const details = await detailsOf(payloadWithQuantity(0));

    expect(fieldsOf(details)).toEqual(['items.0.quantity']);
    expect(messagesFor(details, 'items.0.quantity')).toContain('Leve ao menos uma unidade.');
  });

  it('rejects negative, fractional and string quantities', async () => {
    for (const quantity of REJECTED_QUANTITIES) {
      const details = await detailsOf(payloadWithQuantity(quantity));

      expect(fieldsOf(details)).toEqual(['items.0.quantity']);
    }
  });

  it('rejects a malformed tax id', async () => {
    const payload = validCheckoutPayload();
    const details = await detailsOf({
      ...payload,
      recipient: { ...payload.recipient, taxId: '390.533.447-05' },
    });

    expect(fieldsOf(details)).toEqual(['recipient.taxId']);
    expect(messagesFor(details, 'recipient.taxId')).toContain(
      'Informe o CPF com 11 números, sem pontos nem traço.',
    );
  });

  it('rejects duplicated skus in the same order', async () => {
    const payload = validCheckoutPayload();
    const details = await detailsOf({
      ...payload,
      items: [payload.items[0], { ...payload.items[0], quantity: 1 }],
    });

    expect(fieldsOf(details)).toEqual(['items']);
    expect(messagesFor(details, 'items')).toContain(
      'Cada capinha pode aparecer uma vez só. Some as unidades no mesmo item.',
    );
  });

  it('rejects unknown fields instead of ignoring them', async () => {
    const details = await detailsOf({ ...validCheckoutPayload(), coupon: 'FRETEGRATIS' });

    expect(fieldsOf(details)).toEqual(['coupon']);
    expect(messagesFor(details, 'coupon')).toEqual(['Campo não reconhecido.']);
  });

  it('lets a valid payload through unchanged', async () => {
    const response = await postCheckout(validCheckoutPayload()).expect(201);
    const payload = response.body as ApiResponse<{ items: { quantity: number }[] }>;

    expect(payload.error).toBeNull();
    expect(payload.data?.items).toEqual([
      expect.objectContaining({ sku: 'CAP-SCRAPBOOK-IP16-AIS-TRA', quantity: 2 }),
    ]);
  });
});
