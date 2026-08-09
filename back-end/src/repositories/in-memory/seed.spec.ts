import { CATALOG_VARIANTS } from './catalog-data';
import { createInitialState, INACTIVE_SKUS, INITIAL_AVAILABLE_QTY } from './seed';

const IMAGES_BASE_URL = 'https://cdn.example.com/images';

describe('catalog seed', () => {
  it('hands out independent state on every call', () => {
    const first = createInitialState(IMAGES_BASE_URL);
    const second = createInitialState(IMAGES_BASE_URL);

    first.variants[0].priceCents = 1;
    first.stock[0].availableQty = 999;
    first.products.pop();

    expect(second.variants[0].priceCents).toBe(CATALOG_VARIANTS[0].priceCents);
    expect(second.stock[0].availableQty).toBe(INITIAL_AVAILABLE_QTY[CATALOG_VARIANTS[0].sku]);
    expect(second.products.length).toBe(first.products.length + 1);
  });

  it('gives every variant its own stock row', () => {
    const { variants, stock } = createInitialState(IMAGES_BASE_URL);
    const stockedIds = new Set(stock.map((entry) => entry.variantId));
    const variantIds = new Set(variants.map((variant) => variant.id));

    expect(variants.filter((variant) => !stockedIds.has(variant.id))).toEqual([]);
    expect(stock.filter((entry) => !variantIds.has(entry.variantId))).toEqual([]);
  });

  it('spells out an initial quantity for every variant in the catalog', () => {
    const missing = CATALOG_VARIANTS.filter(
      (variant) => typeof INITIAL_AVAILABLE_QTY[variant.sku] !== 'number',
    );

    expect(missing.map((variant) => variant.sku)).toEqual([]);
  });

  it('never lists a quantity for a sku the catalog does not have', () => {
    const skus = new Set(CATALOG_VARIANTS.map((variant) => variant.sku));
    const strays = Object.keys(INITIAL_AVAILABLE_QTY).filter((sku) => !skus.has(sku));

    expect(strays).toEqual([]);
  });

  it('points every variant at a product that exists', () => {
    const { products, variants } = createInitialState(IMAGES_BASE_URL);
    const productIds = new Set(products.map((product) => product.id));

    expect(variants.filter((variant) => !productIds.has(variant.productId))).toEqual([]);
  });

  it('seeds the quantities the checkout scenarios depend on', () => {
    const { stock } = createInitialState(IMAGES_BASE_URL);
    const quantityOf = (sku: string): number | undefined =>
      stock.find((entry) => entry.variantId === sku)?.availableQty;

    expect(quantityOf('CAP-SCRAPBOOK-IP16-AIS-TRA')).toBe(12);
    expect(quantityOf('CAP-BLOOM-IP16-AIS-TRA')).toBe(3);
    expect(quantityOf('CAP-MAGNOLIA-S24-AIS-TRA')).toBe(0);
    expect(quantityOf('CAP-BUTTERFLY-IP14-AIS-TRA')).toBe(1);
    expect(quantityOf('CAP-DARKFLORAL-IP13-AIS-TRA')).toBe(25);
    expect(quantityOf('CAP-CAPPUCCINO-IP16-AIS-TRA')).toBe(7);
    expect(quantityOf('CAP-SUNRISE-S24-AIS-TRA')).toBe(10);
  });

  it('reserves nothing before the first checkout', () => {
    const { stock } = createInitialState(IMAGES_BASE_URL);

    expect(stock.filter((entry) => entry.reservedQty !== 0)).toEqual([]);
  });

  it('deactivates only the sku that serves the not found scenario', () => {
    const { variants } = createInitialState(IMAGES_BASE_URL);
    const inactive = variants.filter((variant) => !variant.active).map((variant) => variant.sku);

    expect(inactive).toEqual([...INACTIVE_SKUS]);
  });

  it('keeps every product sellable', () => {
    const { products } = createInitialState(IMAGES_BASE_URL);

    expect(products.filter((product) => !product.active)).toEqual([]);
  });

  it('builds image and thumb urls from the given base url', () => {
    const { variants } = createInitialState(IMAGES_BASE_URL);
    const variant = variants.find((candidate) => candidate.sku === 'CAP-SCRAPBOOK-IP16-AIS-TRA');

    expect(variant?.imageUrl).toBe(`${IMAGES_BASE_URL}/cap-scrapbook-ip16-ais-tra.jpg`);
    expect(variant?.thumbUrl).toBe(`${IMAGES_BASE_URL}/cap-scrapbook-ip16-ais-tra-thumb.jpg`);
  });

  it('moves every url when the base url changes', () => {
    const { variants } = createInitialState('https://other.example.com/assets');

    expect(
      variants.filter(
        (variant) => !variant.imageUrl.startsWith('https://other.example.com/assets/'),
      ),
    ).toEqual([]);
  });

  it('prices every variant in integer cents', () => {
    const { products, variants } = createInitialState(IMAGES_BASE_URL);
    const fractional = [
      ...variants.filter((variant) => !Number.isInteger(variant.priceCents)),
      ...products.filter((product) => !Number.isInteger(product.basePriceCents)),
    ];

    expect(fractional).toEqual([]);
  });

  it('never seeds a negative quantity', () => {
    const { stock } = createInitialState(IMAGES_BASE_URL);

    expect(stock.filter((entry) => entry.availableQty < 0)).toEqual([]);
  });
});
