import { NestExpressApplication } from '@nestjs/platform-express';
import { createTestApp } from '../../test/create-test-app';
import { InMemoryCatalogRepository } from '../repositories/in-memory/catalog.repository';
import { CatalogRepository } from '../repositories/repository.contracts';

describe('catalog module', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  it('resolves the catalog repository from the abstract class token', () => {
    expect(app.get(CatalogRepository)).toBeInstanceOf(InMemoryCatalogRepository);
  });

  it('builds image urls from the configured base url', () => {
    const [variant] = app.get(CatalogRepository).listActiveVariants();

    expect(variant.imageUrl.startsWith('http://localhost:3333/images/')).toBe(true);
  });
});
