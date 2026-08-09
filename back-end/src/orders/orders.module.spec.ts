import { NestExpressApplication } from '@nestjs/platform-express';
import { createTestApp } from '../../test/create-test-app';
import { InMemoryOrderRepository } from '../repositories/in-memory/order.repository';
import { OrderRepository } from '../repositories/repository.contracts';

describe('orders module', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves the order repository from the abstract class token', () => {
    expect(app.get(OrderRepository)).toBeInstanceOf(InMemoryOrderRepository);
  });

  it('starts with no orders', () => {
    expect(app.get(OrderRepository).findByNumber('CCS-2026-000001')).toBeUndefined();
  });
});
