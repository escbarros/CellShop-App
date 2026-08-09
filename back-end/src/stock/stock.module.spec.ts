import { NestExpressApplication } from '@nestjs/platform-express';
import { createTestApp } from '../../test/create-test-app';
import { InMemoryStockRepository } from '../repositories/in-memory/stock.repository';
import { StockRepository } from '../repositories/repository.contracts';

describe('stock module', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves the stock repository from the abstract class token', () => {
    expect(app.get(StockRepository)).toBeInstanceOf(InMemoryStockRepository);
  });

  it('starts from the seeded quantities', () => {
    expect(app.get(StockRepository).find('CAP-BUTTERFLY-IP14-AIS-TRA')?.availableQty).toBe(1);
  });
});
