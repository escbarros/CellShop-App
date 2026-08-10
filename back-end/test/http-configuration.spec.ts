import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'node:http';
import request from 'supertest';
import { createTestApp } from './create-test-app';

const ALLOWED_ORIGIN = 'http://localhost:5173';

describe('http configuration', () => {
  let app: NestExpressApplication;
  let server: Server;

  beforeEach(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('answers a preflight allowing the idempotency key the front-end sends', async () => {
    const response = await request(server)
      .options('/checkout')
      .set('Origin', ALLOWED_ORIGIN)
      .set('Access-Control-Request-Method', 'POST')
      .set('Access-Control-Request-Headers', 'Idempotency-Key');

    expect(response.headers['access-control-allow-origin']).toBe(ALLOWED_ORIGIN);
    expect(response.headers['access-control-allow-headers']).toContain('Idempotency-Key');
  });

  it('refuses a body over the limit instead of taking the process down', async () => {
    const oversizedBody = { padding: 'a'.repeat(200 * 1024) };

    const response = await request(server).post('/checkout').send(oversizedBody);

    expect(response.status).toBe(413);
  });

  it('accepts a body under the limit', async () => {
    const response = await request(server).post('/checkout').send({ padding: 'a' });

    expect(response.status).not.toBe(413);
  });
});
