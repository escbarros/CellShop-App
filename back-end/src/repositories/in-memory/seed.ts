import { Product, ProductVariant } from '../../catalog/catalog.model';
import { Stock } from '../../stock/stock.model';
import { CATALOG_PATTERNS, CATALOG_VARIANTS } from './catalog-data';

export type CatalogState = {
  products: Product[];
  variants: ProductVariant[];
  stock: Stock[];
};

export const INITIAL_AVAILABLE_QTY: Readonly<Record<string, number>> = {
  'CAP-SCRAPBOOK-IP16-AIS-TRA': 12,
  'CAP-SCRAPBOOK-IP15P-AIS-TRA': 18,
  'CAP-SCRAPBOOK-IP14-AIS-TRA': 22,
  'CAP-SCRAPBOOK-IP13-AIS-TRA': 14,
  'CAP-SCRAPBOOK-S24-AIS-TRA': 9,
  'CAP-BLOOM-IP16-AIS-TRA': 3,
  'CAP-BLOOM-IP15P-AIS-TRA': 16,
  'CAP-BLOOM-IP14-AIS-TRA': 21,
  'CAP-BLOOM-IP13-AIS-TRA': 11,
  'CAP-BLOOM-S24-AIS-TRA': 8,
  'CAP-MAGNOLIA-IP16-AIS-TRA': 15,
  'CAP-MAGNOLIA-IP15P-AIS-TRA': 12,
  'CAP-MAGNOLIA-IP14-AIS-TRA': 19,
  'CAP-MAGNOLIA-IP13-AIS-TRA': 6,
  'CAP-MAGNOLIA-S24-AIS-TRA': 0,
  'CAP-BUTTERFLY-IP16-AIS-TRA': 24,
  'CAP-BUTTERFLY-IP15P-AIS-TRA': 17,
  'CAP-BUTTERFLY-IP14-AIS-TRA': 1,
  'CAP-BUTTERFLY-IP13-AIS-TRA': 13,
  'CAP-BUTTERFLY-S24-AIS-TRA': 10,
  'CAP-DARKFLORAL-IP16-AIS-TRA': 20,
  'CAP-DARKFLORAL-IP15P-AIS-TRA': 15,
  'CAP-DARKFLORAL-IP14-AIS-TRA': 18,
  'CAP-DARKFLORAL-IP13-AIS-TRA': 25,
  'CAP-DARKFLORAL-S24-AIS-TRA': 12,
  'CAP-CAPPUCCINO-IP16-AIS-TRA': 7,
  'CAP-CAPPUCCINO-IP15P-AIS-TRA': 14,
  'CAP-CAPPUCCINO-IP14-AIS-TRA': 16,
  'CAP-CAPPUCCINO-IP13-AIS-TRA': 9,
  'CAP-CAPPUCCINO-S24-AIS-TRA': 5,
  'CAP-LINEART-IP16-AIS-TRA': 26,
  'CAP-LINEART-IP15P-AIS-TRA': 19,
  'CAP-LINEART-IP14-AIS-TRA': 23,
  'CAP-LINEART-IP13-AIS-TRA': 15,
  'CAP-LINEART-S24-AIS-TRA': 11,
  'CAP-SAFARI-IP16-AIS-TRA': 21,
  'CAP-SAFARI-IP15P-AIS-TRA': 13,
  'CAP-SAFARI-IP14-AIS-TRA': 17,
  'CAP-SAFARI-IP13-AIS-TRA': 8,
  'CAP-SAFARI-S24-AIS-TRA': 6,
  'CAP-GARDENIA-IP16-AIS-TRA': 28,
  'CAP-GARDENIA-IP15P-AIS-TRA': 22,
  'CAP-GARDENIA-IP14-AIS-TRA': 20,
  'CAP-GARDENIA-IP13-AIS-TRA': 16,
  'CAP-GARDENIA-S24-AIS-TRA': 12,
  'CAP-HEARTS-IP16-AIS-TRA': 30,
  'CAP-HEARTS-IP15P-AIS-TRA': 24,
  'CAP-HEARTS-IP14-AIS-TRA': 18,
  'CAP-HEARTS-IP13-AIS-TRA': 14,
  'CAP-HEARTS-S24-AIS-TRA': 9,
  'CAP-BOTANICA-IP16-AIS-TRA': 19,
  'CAP-BOTANICA-IP15P-AIS-TRA': 16,
  'CAP-BOTANICA-IP14-AIS-TRA': 14,
  'CAP-BOTANICA-IP13-AIS-TRA': 10,
  'CAP-BOTANICA-S24-AIS-TRA': 7,
  'CAP-SUNRISE-IP16-AIS-TRA': 23,
  'CAP-SUNRISE-IP15P-AIS-TRA': 18,
  'CAP-SUNRISE-IP14-AIS-TRA': 15,
  'CAP-SUNRISE-IP13-AIS-TRA': 12,
  'CAP-SUNRISE-S24-AIS-TRA': 10,
};

export const INACTIVE_SKUS: readonly string[] = ['CAP-SUNRISE-S24-AIS-TRA'];

export function createInitialState(imagesBaseUrl: string): CatalogState {
  const products = CATALOG_PATTERNS.map<Product>((pattern) => ({
    id: pattern.code,
    name: pattern.name,
    slug: pattern.slug,
    description: pattern.description,
    basePriceCents: pattern.basePriceCents,
    active: true,
  }));

  const variants = CATALOG_VARIANTS.map<ProductVariant>((variant) => ({
    id: variant.sku,
    productId: variant.patternCode,
    sku: variant.sku,
    device: variant.device,
    material: variant.material,
    color: variant.color,
    priceCents: variant.priceCents,
    weightGrams: variant.weightGrams,
    imageUrl: `${imagesBaseUrl}/${variant.imageFile}`,
    thumbUrl: `${imagesBaseUrl}/${variant.thumbFile}`,
    active: !INACTIVE_SKUS.includes(variant.sku),
  }));

  const stock = CATALOG_VARIANTS.map<Stock>((variant) => ({
    variantId: variant.sku,
    availableQty: INITIAL_AVAILABLE_QTY[variant.sku],
    reservedQty: 0,
    version: 0,
    updatedAt: new Date(),
  }));

  return { products, variants, stock };
}
