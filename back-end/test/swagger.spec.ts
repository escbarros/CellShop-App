import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from './create-test-app';

type OpenApiDocument = {
  info: { title: string; description: string; version: string };
  tags: { name: string }[];
  paths: Record<string, Record<string, { tags?: string[] }>>;
  components: { schemas: Record<string, { properties?: Record<string, unknown> }> };
};

describe('swagger', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('serves the documentation ui at /docs', async () => {
    const response = await request(app.getHttpServer()).get('/docs').expect(200);

    expect(response.headers['content-type']).toContain('text/html');
  });

  it('lists the health endpoint in the generated document', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);
    const document = response.body as OpenApiDocument;

    expect(document.paths['/health']).toBeDefined();
    expect(document.paths['/health'].get.tags).toContain('health');
  });

  it('declares one tag per domain', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);
    const document = response.body as OpenApiDocument;

    expect(document.tags.map((tag) => tag.name)).toEqual(
      expect.arrayContaining(['catalog', 'checkout', 'orders', 'health']),
    );
  });

  it('exposes the error response as a reusable schema', async () => {
    const response = await request(app.getHttpServer()).get('/docs-json').expect(200);
    const document = response.body as OpenApiDocument;

    expect(document.components.schemas.ApiErrorResponseSchema).toBeDefined();
    expect(document.components.schemas.ApiErrorSchema.properties).toHaveProperty('code');
    expect(document.components.schemas.ApiErrorSchema.properties).toHaveProperty('message');
  });
});
