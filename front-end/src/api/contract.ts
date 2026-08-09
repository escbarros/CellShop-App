import type { components } from './types.generated';

type Schemas = components['schemas'];

export type Variant = Schemas['VariantResponse'];
export type Order = Schemas['OrderResponse'];
export type CheckoutPayload = Schemas['CreateCheckoutDto'];
export type ValidationDetail = Schemas['ErrorDetail'];
export type ResponseMeta = Schemas['ResponseMeta'];

export type StockShortage = {
  sku: string;
  available: number;
};
