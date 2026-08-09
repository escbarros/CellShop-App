import { existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { CATALOG_PATTERNS, CATALOG_VARIANTS } from './catalog-data';

const IMAGES_DIRECTORY = join(__dirname, '..', '..', '..', 'public', 'images');

function imagePath(fileName: string): string {
  return join(IMAGES_DIRECTORY, fileName);
}

describe('catalog data', () => {
  it('has a pattern for every variant', () => {
    const codes = new Set(CATALOG_PATTERNS.map((pattern) => pattern.code));
    const orphans = CATALOG_VARIANTS.filter((variant) => !codes.has(variant.patternCode));

    expect(orphans).toEqual([]);
  });

  it('has a variant for every pattern', () => {
    const codes = new Set(CATALOG_VARIANTS.map((variant) => variant.patternCode));
    const unused = CATALOG_PATTERNS.filter((pattern) => !codes.has(pattern.code));

    expect(unused).toEqual([]);
  });

  it('never repeats a sku', () => {
    const skus = CATALOG_VARIANTS.map((variant) => variant.sku);

    expect(new Set(skus).size).toBe(skus.length);
  });

  it('prices every variant in integer cents', () => {
    const fractional = CATALOG_VARIANTS.filter(
      (variant) => !Number.isInteger(variant.priceCents) || variant.priceCents <= 0,
    );

    expect(fractional).toEqual([]);
  });

  it('ships an image file for every variant', () => {
    const missing = CATALOG_VARIANTS.filter((variant) => !existsSync(imagePath(variant.imageFile)));

    expect(missing.map((variant) => variant.imageFile)).toEqual([]);
  });

  it('ships a thumb file for every variant', () => {
    const missing = CATALOG_VARIANTS.filter((variant) => !existsSync(imagePath(variant.thumbFile)));

    expect(missing.map((variant) => variant.thumbFile)).toEqual([]);
  });

  it('keeps every thumb lighter than its full-size image', () => {
    const heavier = CATALOG_VARIANTS.filter(
      (variant) =>
        statSync(imagePath(variant.thumbFile)).size >= statSync(imagePath(variant.imageFile)).size,
    );

    expect(heavier.map((variant) => variant.sku)).toEqual([]);
  });

  it('names every image file after its own sku in lowercase', () => {
    const mismatched = CATALOG_VARIANTS.filter(
      (variant) => variant.imageFile !== `${variant.sku.toLowerCase()}.jpg`,
    );

    expect(mismatched.map((variant) => variant.sku)).toEqual([]);
  });
});
