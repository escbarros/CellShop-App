import { OrderAggregate } from '../repositories/repository.contracts';
import { OrderEventResponse } from './dto/order-event.response';
import { OrderSummaryResponse } from './dto/order-summary.response';
import { OrderResponse } from './dto/order.response';
import { RecipientResponse } from './dto/recipient.response';
import { OrderEvent, OrderRecipient } from './order.model';

const NO_ITEMS = 0;

const TAX_ID_MIDDLE_START = 3;

const TAX_ID_MIDDLE_END = 6;

const TAX_ID_TAIL_END = 9;

export function maskTaxId(taxId: string): string {
  const middle = taxId.slice(TAX_ID_MIDDLE_START, TAX_ID_MIDDLE_END);
  const tail = taxId.slice(TAX_ID_MIDDLE_END, TAX_ID_TAIL_END);

  return `***.${middle}.${tail}-**`;
}

export function toOrderResponse(aggregate: OrderAggregate): OrderResponse {
  return {
    number: aggregate.order.number,
    status: aggregate.order.status,
    items: aggregate.items.map((item) => ({
      sku: item.skuSnapshot,
      name: item.nameSnapshot,
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
      subtotalCents: item.subtotalCents,
    })),
    subtotalCents: aggregate.order.subtotalCents,
    shippingCents: aggregate.order.shippingCents,
    discountCents: aggregate.order.discountCents,
    totalCents: aggregate.order.totalCents,
    createdAt: aggregate.order.createdAt.toISOString(),
  };
}

export function toOrderSummaryResponse(aggregate: OrderAggregate): OrderSummaryResponse {
  return {
    number: aggregate.order.number,
    status: aggregate.order.status,
    itemCount: aggregate.items.reduce((total, item) => total + item.quantity, NO_ITEMS),
    totalCents: aggregate.order.totalCents,
    createdAt: aggregate.order.createdAt.toISOString(),
  };
}

export function toRecipientResponse(recipient: OrderRecipient): RecipientResponse {
  return { ...recipient, taxId: maskTaxId(recipient.taxId) };
}

export function toEventResponse(event: OrderEvent): OrderEventResponse {
  return {
    previousStatus: event.previousStatus,
    newStatus: event.newStatus,
    source: event.source,
    message: event.message,
    createdAt: event.createdAt.toISOString(),
  };
}
