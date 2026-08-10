import type { components } from './types.generated';

type Schemas = components['schemas'];

export type Variant = Schemas['VariantResponse'];
export type Order = Schemas['OrderResponse'];
export type OrderDetail = Schemas['OrderDetailResponse'];
export type OrderSummary = Schemas['OrderSummaryResponse'];
export type OrderItem = Schemas['OrderItemResponse'];
export type OrderEvent = Schemas['OrderEventResponse'];
export type OrderStatus = Order['status'];
export type CheckoutPayload = Schemas['CreateCheckoutDto'];
export type Recipient = Schemas['RecipientDto'];
export type ValidationDetail = Schemas['ErrorDetail'];
export type ResponseMeta = Schemas['ResponseMeta'];

export type StockShortage = {
  sku: string;
  available: number;
};
