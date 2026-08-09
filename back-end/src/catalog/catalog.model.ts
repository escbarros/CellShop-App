import { Cents } from '../common/money';

export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePriceCents: Cents;
  active: boolean;
};

export type ProductVariant = {
  id: string;
  productId: string;
  sku: string;
  device: string;
  material: string;
  color: string;
  priceCents: Cents;
  weightGrams: number;
  imageUrl: string;
  thumbUrl: string;
  active: boolean;
};
