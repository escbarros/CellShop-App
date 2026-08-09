import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';

type HealthPayload = {
  status: string;
  version: string;
  uptime: number;
};

const packageVersion = (
  JSON.parse(readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8')) as {
    version: string;
  }
).version;

describe('health endpoint', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  function getHealth() {
    return request(app.getHttpServer()).get('/health');
  }

  it('reports ok', async () => {
    const response = await getHealth().expect(200);
    const body = response.body as ApiResponse<HealthPayload>;

    expect(body.data?.status).toBe('ok');
    expect(body.error).toBeNull();
  });

  it('reports the version declared in package.json', async () => {
    const response = await getHealth().expect(200);
    const body = response.body as ApiResponse<HealthPayload>;

    expect(body.data?.version).toBe(packageVersion);
  });

  it('reports how long the process has been up', async () => {
    const response = await getHealth().expect(200);
    const body = response.body as ApiResponse<HealthPayload>;

    expect(typeof body.data?.uptime).toBe('number');
    expect(body.data?.uptime).toBeGreaterThanOrEqual(0);
  });

  it('answers inside the response envelope', async () => {
    const response = await getHealth().expect(200);
    const body = response.body as ApiResponse<HealthPayload>;

    expect(body.meta.requestId).toMatch(/^req_[0-9a-f]{16}$/);
    expect(new Date(body.meta.timestamp).toISOString()).toBe(body.meta.timestamp);
  });
});
