import { NestExpressApplication } from '@nestjs/platform-express';
import request from 'supertest';
import { createTestApp } from '../../test/create-test-app';
import { ApiResponse } from '../common/http/api-response';
import { INACTIVE_SKUS, INITIAL_AVAILABLE_QTY } from '../repositories/in-memory/seed';
import { VariantResponse } from './dto/variant.response';

const SELLABLE_SKU = 'CAP-SCRAPBOOK-IP16-AIS-TRA';
const SOLD_OUT_SKU = 'CAP-MAGNOLIA-S24-AIS-TRA';
const INACTIVE_SKU = 'CAP-SUNRISE-S24-AIS-TRA';

const ACTIVE_SKU_COUNT = Object.keys(INITIAL_AVAILABLE_QTY).length - INACTIVE_SKUS.length;

const VARIANT_FIELDS: readonly (keyof VariantResponse)[] = [
  'sku',
  'name',
  'description',
  'priceCents',
  'formattedPrice',
  'availableQty',
  'available',
  'imageUrl',
  'thumbUrl',
];

describe('products endpoint', () => {
  let app: NestExpressApplication;

  beforeAll(async () => {
    app = await createTestApp();
  });

  afterAll(async () => {
    await app.close();
  });

  async function listProducts(): Promise<VariantResponse[]> {
    const response = await request(app.getHttpServer()).get('/products').expect(200);
    const body = response.body as ApiResponse<VariantResponse[]>;

    expect(body.error).toBeNull();

    return body.data ?? [];
  }

  function findBySku(variants: VariantResponse[], sku: string): VariantResponse | undefined {
    return variants.find((variant) => variant.sku === sku);
  }

  it('returns 200 with every sellable variant', async () => {
    const variants = await listProducts();

    expect(variants).toHaveLength(ACTIVE_SKU_COUNT);
    expect(findBySku(variants, SELLABLE_SKU)?.available).toBe(true);
  });

  it('omits inactive variants', async () => {
    const variants = await listProducts();

    expect(findBySku(variants, INACTIVE_SKU)).toBeUndefined();
  });

  it('shows sold-out variants as unavailable', async () => {
    const variants = await listProducts();
    const soldOut = findBySku(variants, SOLD_OUT_SKU);

    expect(soldOut).toBeDefined();
    expect(soldOut?.availableQty).toBe(0);
    expect(soldOut?.available).toBe(false);
  });

  it('formats prices as brazilian currency', async () => {
    const variants = await listProducts();
    const sellable = findBySku(variants, SELLABLE_SKU);

    expect(sellable?.priceCents).toBe(7990);
    expect(sellable?.formattedPrice).toBe('R$ 79,90');
  });

  it('includes image and thumb urls for every variant', async () => {
    const variants = await listProducts();

    for (const variant of variants) {
      expect(variant.imageUrl).toMatch(/^http:\/\/localhost:3333\/images\/.+\.(?:jpg|svg)$/);
      expect(variant.thumbUrl).toMatch(/^http:\/\/localhost:3333\/images\/.+-thumb\.(?:jpg|svg)$/);
    }
  });

  it('matches the documented response schema', async () => {
    const variants = await listProducts();
    const sellable = findBySku(variants, SELLABLE_SKU);

    expect(Object.keys(sellable ?? {}).sort()).toEqual([...VARIANT_FIELDS].sort());
    expect(sellable?.name).toBe('Floral Scrapbook · iPhone 16');
    expect(sellable?.description).toBe(
      'Colagem de flores prensadas, fitas e polaroides sobre fundo bege, com espaço para nome e fotos.',
    );
    expect(Number.isInteger(sellable?.availableQty)).toBe(true);
  });
});
