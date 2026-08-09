import { CATALOG_VARIANTS } from './catalog-data';
import { InMemoryCatalogRepository } from './catalog.repository';
import { createInitialState, INACTIVE_SKUS } from './seed';

const IMAGES_BASE_URL = 'https://cdn.example.com/images';

const SELLABLE_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const INACTIVE_SKU = 'CAP-SUNRISE-S24-AIS-TRA';

function createRepository(): InMemoryCatalogRepository {
  return new InMemoryCatalogRepository(createInitialState(IMAGES_BASE_URL));
}

describe('in-memory catalog repository', () => {
  it('lists only active variants', () => {
    const shelf = createRepository().listActiveVariants();

    expect(shelf).toHaveLength(CATALOG_VARIANTS.length - INACTIVE_SKUS.length);
    expect(shelf.map((variant) => variant.sku)).not.toContain(INACTIVE_SKU);
  });

  it('keeps a sold out variant on the shelf', () => {
    const shelf = createRepository().listActiveVariants();

    expect(shelf.map((variant) => variant.sku)).toContain('CAP-MAGNOLIA-S24-AIS-TRA');
  });

  it('orders the shelf by price', () => {
    const prices = createRepository()
      .listActiveVariants()
      .map((variant) => variant.priceCents);

    expect(prices).toEqual([...prices].sort((left, right) => left - right));
  });

  it('finds an active variant by sku', () => {
    expect(createRepository().findVariantBySku(SELLABLE_SKU)?.sku).toBe(SELLABLE_SKU);
  });

  it('returns undefined for an inactive sku', () => {
    expect(createRepository().findVariantBySku(INACTIVE_SKU)).toBeUndefined();
  });

  it('returns undefined for an unknown sku', () => {
    expect(createRepository().findVariantBySku('CAP-NOPE-IP16-AIS-TRA')).toBeUndefined();
  });

  it('finds the product a variant belongs to', () => {
    const repository = createRepository();
    const variant = repository.findVariantBySku(SELLABLE_SKU);

    expect(repository.findProduct(variant!.productId)?.name).toBe('Floral Scrapbook');
  });

  it('returns undefined for an unknown product', () => {
    expect(createRepository().findProduct('NOPE')).toBeUndefined();
  });

  it('does not expose mutable internal state', () => {
    const repository = createRepository();

    repository.listActiveVariants()[0].priceCents = 1;
    repository.findVariantBySku(SELLABLE_SKU)!.sku = 'TAMPERED';
    repository.findProduct('SCRAPBOOK')!.name = 'Tampered';

    expect(repository.listActiveVariants()[0].priceCents).not.toBe(1);
    expect(repository.findVariantBySku(SELLABLE_SKU)?.sku).toBe(SELLABLE_SKU);
    expect(repository.findProduct('SCRAPBOOK')?.name).toBe('Floral Scrapbook');
  });
});
