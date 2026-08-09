import { INestApplication } from '@nestjs/common';
import { AppModule } from '../src/app.module';
import { createTestApp } from './create-test-app';

describe('createTestApp', () => {
  let apps: INestApplication[];

  beforeEach(() => {
    apps = [];
  });

  afterEach(async () => {
    await Promise.all(apps.map((app) => app.close()));
  });

  it('builds an application ready to answer http requests', async () => {
    const app = await createTestApp();
    apps.push(app);

    expect(app.getHttpServer()).toBeDefined();
  });

  it('gives two consecutive tests their own container instead of a shared one', async () => {
    const first = await createTestApp();
    const second = await createTestApp();
    apps.push(first, second);

    expect(second.get(AppModule)).not.toBe(first.get(AppModule));
  });
});
