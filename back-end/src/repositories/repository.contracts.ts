import { Product, ProductVariant } from '../catalog/catalog.model';
import { Order, OrderEvent, OrderItem, OrderRecipient } from '../orders/order.model';
import { Stock } from '../stock/stock.model';

export type OrderAggregate = {
  order: Order;
  items: readonly OrderItem[];
  recipient: OrderRecipient;
};

export type OrderDraft = {
  order: Omit<Order, 'id' | 'number'>;
  items: readonly OrderItem[];
  recipient: OrderRecipient;
};

export abstract class CatalogRepository {
  abstract listActiveVariants(): readonly ProductVariant[];
  abstract findVariantBySku(sku: string): ProductVariant | undefined;
  abstract findProduct(id: string): Product | undefined;
}

export abstract class StockRepository {
  abstract find(variantId: string): Stock | undefined;
  abstract decrementIfAvailable(variantId: string, qty: number): boolean;
  abstract restore(variantId: string, qty: number): void;
}

export abstract class OrderRepository {
  abstract save(draft: OrderDraft): OrderAggregate;
  abstract findByIdempotencyKey(key: string): OrderAggregate | undefined;
  abstract findByNumber(number: string): OrderAggregate | undefined;
  abstract appendEvent(orderId: string, event: OrderEvent): void;
  abstract eventsOf(orderId: string): readonly OrderEvent[];
}
