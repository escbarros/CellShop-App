import { Logger } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ApiResponse } from '../src/common/http/api-response';
import { createTestApp } from './create-test-app';
import { ResponseContractController } from './response-contract.controller';

const REQUEST_ID_PATTERN = /^req_[0-9a-f]{16}$/;

describe('response contract', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    jest.spyOn(Logger.prototype, 'error').mockImplementation(() => undefined);
    jest.spyOn(Logger.prototype, 'warn').mockImplementation(() => undefined);
    app = await createTestApp({ controllers: [ResponseContractController] });
  });

  afterAll(async () => {
    await app.close();
    jest.restoreAllMocks();
  });

  function get(path: string) {
    return request(app.getHttpServer()).get(path);
  }

  describe('success', () => {
    it('wraps a plain payload in data, null error and meta', async () => {
      const response = await get('/contract-fixtures/plain-payload').expect(200);
      const body = response.body as ApiResponse<{ orderNumber: string }>;

      expect(body.data).toEqual({ orderNumber: 'PED-2026-000148' });
      expect(body.error).toBeNull();
      expect(body.meta.requestId).toMatch(REQUEST_ID_PATTERN);
      expect(new Date(body.meta.timestamp).toISOString()).toBe(body.meta.timestamp);
    });

    it('merges controller supplied meta alongside requestId and timestamp', async () => {
      const response = await get('/contract-fixtures/payload-with-meta').expect(200);
      const body = response.body as ApiResponse<{ orderNumber: string }>;

      expect(body.data).toEqual({ orderNumber: 'PED-2026-000148' });
      expect(body.meta.statusUrl).toBe('/checkout/PED-2026-000148');
      expect(body.meta.requestId).toMatch(REQUEST_ID_PATTERN);
    });

    it('gives each request its own requestId', async () => {
      const first = await get('/contract-fixtures/plain-payload').expect(200);
      const second = await get('/contract-fixtures/plain-payload').expect(200);

      expect((first.body as ApiResponse<unknown>).meta.requestId).not.toBe(
        (second.body as ApiResponse<unknown>).meta.requestId,
      );
    });
  });

  describe('error', () => {
    it('answers a domain exception with its own status and code', async () => {
      const response = await get('/contract-fixtures/domain-error').expect(409);
      const body = response.body as ApiResponse<never>;

      expect(body.data).toBeNull();
      expect(body.error).toEqual({
        code: 'INSUFFICIENT_STOCK',
        message: 'Não temos essa quantidade em estoque.',
      });
      expect(body.meta.requestId).toMatch(REQUEST_ID_PATTERN);
    });

    it('carries field level details when the exception provides them', async () => {
      const response = await get('/contract-fixtures/validation-error').expect(422);
      const body = response.body as ApiResponse<never>;

      expect(body.error?.code).toBe('VALIDATION_FAILED');
      expect(body.error?.details).toEqual([
        { field: 'quantity', message: 'Informe ao menos uma unidade.' },
      ]);
    });

    it('rewrites a native nest exception into the contract format', async () => {
      const response = await get('/contract-fixtures/nest-http-error').expect(404);
      const body = response.body as ApiResponse<never>;

      expect(body.error).toEqual({ code: 'ROUTE_NOT_FOUND', message: 'Endereço não encontrado.' });
      expect(JSON.stringify(body)).not.toContain('internal record 42');
    });

    it('answers an unexpected error with 500 without leaking its message', async () => {
      const response = await get('/contract-fixtures/raw-error').expect(500);
      const body = response.body as ApiResponse<never>;

      expect(body.error).toEqual({
        code: 'INTERNAL_ERROR',
        message: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
      });
      expect(JSON.stringify(body)).not.toContain('10.0.0.7');
    });

    it('answers malformed json with invalid body instead of a body parser stack', async () => {
      const response = await request(app.getHttpServer())
        .post('/contract-fixtures/plain-payload')
        .set('Content-Type', 'application/json')
        .send('{"quantity":')
        .expect(400);
      const body = response.body as ApiResponse<never>;

      expect(body.error).toEqual({
        code: 'INVALID_BODY',
        message: 'Não conseguimos ler os dados enviados.',
      });
      expect(body.meta.requestId).toMatch(REQUEST_ID_PATTERN);
    });

    it('keeps the payload too large status while answering in the contract format', async () => {
      const response = await request(app.getHttpServer())
        .post('/contract-fixtures/plain-payload')
        .send({ padding: 'a'.repeat(200 * 1024) })
        .expect(413);
      const body = response.body as ApiResponse<never>;

      expect(body.error?.code).toBe('INVALID_BODY');
      expect(body.data).toBeNull();
    });

    it('answers an unknown route with json instead of html', async () => {
      const response = await get('/rota-inexistente').expect(404);
      const body = response.body as ApiResponse<never>;

      expect(response.headers['content-type']).toContain('application/json');
      expect(body.error?.code).toBe('ROUTE_NOT_FOUND');
      expect(body.meta.requestId).toMatch(REQUEST_ID_PATTERN);
    });
  });
});
