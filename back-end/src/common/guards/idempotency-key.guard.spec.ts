import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { validCheckoutPayload } from '../../../test/checkout-payload';
import { createTestApp } from '../../../test/create-test-app';
import { ApiResponse } from '../http/api-response';

describe('idempotency key guard', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('returns 400 when the idempotency key header is missing', async () => {
    const response = await request(app.getHttpServer())
      .post('/checkout')
      .send(validCheckoutPayload())
      .expect(400);
    const payload = response.body as ApiResponse<never>;

    expect(payload.data).toBeNull();
    expect(payload.error?.code).toBe('MISSING_IDEMPOTENCY_KEY');
    expect(payload.error?.message).toBe(
      'A requisição chegou sem a chave que evita compra duplicada.',
    );
  });
});
