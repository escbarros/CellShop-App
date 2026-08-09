import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { createInitialState } from './seed';
import { InMemoryStockRepository } from './stock.repository';

const IMAGES_BASE_URL = 'https://cdn.example.com/images';

const ABUNDANT_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const SCARCE_SKU = 'CAP-BLOOM-IP16-AIS-TRA';
const LAST_UNIT_SKU = 'CAP-BUTTERFLY-IP14-AIS-TRA';

function createRepository(): InMemoryStockRepository {
  return new InMemoryStockRepository(createInitialState(IMAGES_BASE_URL));
}

describe('in-memory stock repository', () => {
  it('decrements when stock is sufficient', () => {
    const repository = createRepository();

    expect(repository.decrementIfAvailable(ABUNDANT_SKU, 3)).toBe(true);

    const stock = repository.find(ABUNDANT_SKU);

    expect(stock?.availableQty).toBe(9);
    expect(stock?.reservedQty).toBe(3);
    expect(stock?.version).toBe(1);
  });

  it('refuses and leaves stock untouched when insufficient', () => {
    const repository = createRepository();

    expect(repository.decrementIfAvailable(SCARCE_SKU, 5)).toBe(false);

    const stock = repository.find(SCARCE_SKU);

    expect(stock?.availableQty).toBe(3);
    expect(stock?.reservedQty).toBe(0);
    expect(stock?.version).toBe(0);
  });

  it('sells exactly one unit under ten concurrent requests', async () => {
    const repository = createRepository();

    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        Promise.resolve().then(() => repository.decrementIfAvailable(LAST_UNIT_SKU, 1)),
      ),
    );

    expect(results.filter((sold) => sold)).toHaveLength(1);
    expect(repository.find(LAST_UNIT_SKU)?.availableQty).toBe(0);
    expect(repository.find(LAST_UNIT_SKU)?.reservedQty).toBe(1);
  });

  it('does not yield the event loop between check and decrement', () => {
    const source = readFileSync(join(__dirname, 'stock.repository.ts'), 'utf8');

    expect(source).not.toMatch(/\basync\b|\bawait\b|\.then\(/);
    expect(createRepository().decrementIfAvailable(ABUNDANT_SKU, 1)).toBe(true);
  });

  it('never lets available quantity go negative', () => {
    const repository = createRepository();

    for (let attempt = 0; attempt < 10; attempt += 1) {
      repository.decrementIfAvailable(SCARCE_SKU, 2);

      expect(repository.find(SCARCE_SKU)?.availableQty).toBeGreaterThanOrEqual(0);
    }

    expect(repository.find(SCARCE_SKU)?.availableQty).toBe(1);
  });

  it('refuses a decrement that is not a positive quantity', () => {
    const repository = createRepository();

    expect(repository.decrementIfAvailable(ABUNDANT_SKU, 0)).toBe(false);
    expect(repository.decrementIfAvailable(ABUNDANT_SKU, -5)).toBe(false);
    expect(repository.find(ABUNDANT_SKU)?.availableQty).toBe(12);
  });

  it('refuses to decrement a variant it does not know', () => {
    const repository = createRepository();

    expect(repository.decrementIfAvailable('CAP-NOPE-IP16-AIS-TRA', 1)).toBe(false);
    expect(repository.find('CAP-NOPE-IP16-AIS-TRA')).toBeUndefined();
  });

  it('restore puts the quantity back without exceeding the initial value', () => {
    const repository = createRepository();

    repository.decrementIfAvailable(ABUNDANT_SKU, 3);
    repository.restore(ABUNDANT_SKU, 3);

    expect(repository.find(ABUNDANT_SKU)?.availableQty).toBe(12);
    expect(repository.find(ABUNDANT_SKU)?.reservedQty).toBe(0);

    repository.restore(ABUNDANT_SKU, 5);

    expect(repository.find(ABUNDANT_SKU)?.availableQty).toBe(12);
    expect(repository.find(ABUNDANT_SKU)?.reservedQty).toBe(0);
  });

  it('ignores a restore it cannot apply', () => {
    const repository = createRepository();

    repository.restore('CAP-NOPE-IP16-AIS-TRA', 1);
    repository.restore(ABUNDANT_SKU, 0);
    repository.restore(ABUNDANT_SKU, -5);

    expect(repository.find(ABUNDANT_SKU)?.availableQty).toBe(12);
  });

  it('does not expose mutable internal state', () => {
    const repository = createRepository();

    repository.find(ABUNDANT_SKU)!.availableQty = 999;

    expect(repository.find(ABUNDANT_SKU)?.availableQty).toBe(12);
  });
});
