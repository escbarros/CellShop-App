import { NestExpressApplication } from '@nestjs/platform-express';
import { Server } from 'node:http';
import request from 'supertest';
import { createTestApp } from './create-test-app';

const CATALOG_IMAGE = '/images/cap-scrapbook-ip16-ais-tra.jpg';
const CATALOG_THUMB = '/images/cap-scrapbook-ip16-ais-tra-thumb.jpg';

const JPEG_MAGIC = Buffer.from([0xff, 0xd8, 0xff]);

describe('static images', () => {
  let app: NestExpressApplication;
  let server: Server;

  beforeEach(async () => {
    app = await createTestApp();
    server = app.getHttpServer();
  });

  afterEach(async () => {
    await app.close();
  });

  it('serves a product image straight from the back-end', async () => {
    const response = await request(server).get(CATALOG_IMAGE);

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('image/jpeg');
  });

  it('serves image bytes raw, outside the response envelope', async () => {
    const response = await request(server).get(CATALOG_IMAGE);
    const body = response.body as Buffer;

    expect(body.subarray(0, 3).equals(JPEG_MAGIC)).toBe(true);
  });

  it('serves a thumb that is lighter than the full-size image', async () => {
    const full = await request(server).get(CATALOG_IMAGE);
    const thumb = await request(server).get(CATALOG_THUMB);

    expect(thumb.status).toBe(200);
    expect((thumb.body as Buffer).length).toBeLessThan((full.body as Buffer).length);
  });

  it('keeps a generic placeholder for a variant without art', async () => {
    const response = await request(server).get('/images/placeholder.svg');

    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('image/svg+xml');
  });

  it('answers not found for an image that does not exist', async () => {
    const response = await request(server).get('/images/cap-unknown-sku.jpg');

    expect(response.status).toBe(404);
  });
});
