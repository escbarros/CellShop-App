import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { ApiResponse } from '../src/common/http/api-response';
import { createTestApp } from './create-test-app';

type DeclaredRoute = {
  method: 'get' | 'post';
  path: string;
};

const DECLARED_ROUTES: DeclaredRoute[] = [
  { method: 'post', path: '/checkout' },
  { method: 'get', path: '/orders/CCS-2026-000417' },
];

describe('controller skeletons', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it.each(DECLARED_ROUTES)(
    'every declared route responds 501 before implementation: $method $path',
    async ({ method, path }) => {
      await request(app.getHttpServer())[method](path).expect(501);
    },
  );

  it('answers inside the response envelope while still unimplemented', async () => {
    const response = await request(app.getHttpServer()).get('/orders/CCS-2026-000417').expect(501);
    const body = response.body as ApiResponse<never>;

    expect(body.data).toBeNull();
    expect(typeof body.error?.code).toBe('string');
    expect(typeof body.error?.message).toBe('string');
    expect(body.meta.requestId).toMatch(/^req_[0-9a-f]{16}$/);
  });
});
