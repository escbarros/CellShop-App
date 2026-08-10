import { Injectable } from '@nestjs/common';
import { variantDisplayName } from '../catalog/catalog.model';
import { InsufficientStockError, SkuNotFoundError } from '../common/errors/domain.errors';
import { Cents, multiply, sum } from '../common/money';
import {
  CatalogRepository,
  DuplicateIdempotencyKeyError,
  OrderAggregate,
  OrderDraft,
  OrderRepository,
  StockRepository,
} from '../repositories/repository.contracts';
import { CheckoutItemDto } from './dto/checkout-item.dto';
import { CreateCheckoutDto } from './dto/create-checkout.dto';
import {
  FLAT_SHIPPING_CENTS,
  FREE_SHIPPING_THRESHOLD_CENTS,
  OrderResponse,
} from './dto/order.response';
import { RecipientDto } from './dto/recipient.dto';
import {
  ORDER_STATUSES,
  OrderEvent,
  OrderItem,
  OrderRecipient,
  OrderStatus,
  canTransition,
} from './order.model';

const NO_DISCOUNT_CENTS = 0;

const NO_SHIPPING_CENTS = 0;

const NOTHING_AVAILABLE = 0;

const SINGLE_UNIT = 1;

const EVENT_SOURCE = 'API';

const PLACED_MESSAGE = 'Pedido recebido pela API.';

const CONFIRMED_MESSAGE = 'Estoque reservado e pedido confirmado.';

type Shortage = {
  item: OrderItem;
  index: number;
  available: number;
};

export function transitionEvent(
  previousStatus: OrderStatus | null,
  newStatus: OrderStatus,
  message: string,
  createdAt: Date,
): OrderEvent {
  if (previousStatus !== null && !canTransition(previousStatus, newStatus)) {
    throw new Error(`An order cannot move from ${previousStatus} to ${newStatus}`);
  }

  return { previousStatus, newStatus, source: EVENT_SOURCE, message, createdAt };
}

function shortageMessage(name: string, available: number): string {
  if (available === NOTHING_AVAILABLE) {
    return `${name} está esgotado.`;
  }

  return `Restam apenas ${available} ${available === SINGLE_UNIT ? 'unidade' : 'unidades'} de ${name}.`;
}

function shortageError(shortage: Shortage): InsufficientStockError {
  return new InsufficientStockError([
    {
      field: `items.${shortage.index}.quantity`,
      message: shortageMessage(shortage.item.nameSnapshot, shortage.available),
      sku: shortage.item.skuSnapshot,
      available: shortage.available,
    },
  ]);
}

function shippingFor(subtotalCents: Cents): Cents {
  return subtotalCents >= FREE_SHIPPING_THRESHOLD_CENTS ? NO_SHIPPING_CENTS : FLAT_SHIPPING_CENTS;
}

function toRecipient(recipient: RecipientDto): OrderRecipient {
  return {
    name: recipient.name,
    taxId: recipient.taxId,
    email: recipient.email,
    phone: recipient.phone ?? null,
    zipCode: recipient.zipCode,
    street: recipient.street,
    number: recipient.number,
    complement: recipient.complement ?? null,
    district: recipient.district,
    city: recipient.city,
    state: recipient.state,
  };
}

function toResponse(aggregate: OrderAggregate): OrderResponse {
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

export type CheckoutOutcome = {
  order: OrderResponse;
  replayed: boolean;
};

@Injectable()
export class CheckoutService {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly orders: OrderRepository,
    private readonly stock: StockRepository,
  ) {}

  create(payload: CreateCheckoutDto, idempotencyKey: string): CheckoutOutcome {
    const known = this.orders.findByIdempotencyKey(idempotencyKey);

    if (known !== undefined) {
      return { order: toResponse(known), replayed: true };
    }

    const items = payload.items.map((line, index) => this.freeze(line, index));
    const shortage = this.take(items);

    if (shortage !== null) {
      this.record(
        this.draftOf(payload, items, idempotencyKey, ORDER_STATUSES.CANCELLED),
        `Sem estoque para ${shortage.item.skuSnapshot}.`,
      );

      throw shortageError(shortage);
    }

    const outcome = this.record(
      this.draftOf(payload, items, idempotencyKey, ORDER_STATUSES.CONFIRMED),
      CONFIRMED_MESSAGE,
    );

    if (outcome.replayed) {
      this.release(items);
    }

    return outcome;
  }

  private draftOf(
    payload: CreateCheckoutDto,
    items: readonly OrderItem[],
    idempotencyKey: string,
    status: OrderStatus,
  ): OrderDraft {
    const subtotalCents = sum(...items.map((item) => item.subtotalCents));
    const shippingCents = shippingFor(subtotalCents);
    const createdAt = new Date();

    return {
      order: {
        idempotencyKey,
        status,
        subtotalCents,
        shippingCents,
        discountCents: NO_DISCOUNT_CENTS,
        totalCents: sum(subtotalCents, shippingCents),
        createdAt,
        updatedAt: createdAt,
      },
      items,
      recipient: toRecipient(payload.recipient),
    };
  }

  private record(draft: OrderDraft, closingMessage: string): CheckoutOutcome {
    try {
      const aggregate = this.orders.save(draft);

      this.trail(aggregate, closingMessage);

      return { order: toResponse(aggregate), replayed: false };
    } catch (error) {
      if (!(error instanceof DuplicateIdempotencyKeyError)) {
        throw error;
      }

      const known = this.orders.findByIdempotencyKey(error.idempotencyKey);

      if (known === undefined) {
        throw error;
      }

      return { order: toResponse(known), replayed: true };
    }
  }

  private trail(aggregate: OrderAggregate, closingMessage: string): void {
    const { order } = aggregate;

    this.orders.appendEvent(
      order.id,
      transitionEvent(null, ORDER_STATUSES.PENDING, PLACED_MESSAGE, order.createdAt),
    );
    this.orders.appendEvent(
      order.id,
      transitionEvent(ORDER_STATUSES.PENDING, order.status, closingMessage, order.updatedAt),
    );
  }

  private take(items: readonly OrderItem[]): Shortage | null {
    const taken: OrderItem[] = [];

    for (const [index, item] of items.entries()) {
      if (this.stock.decrementIfAvailable(item.variantId, item.quantity)) {
        taken.push(item);

        continue;
      }

      this.release(taken);

      return {
        item,
        index,
        available: this.stock.find(item.variantId)?.availableQty ?? NOTHING_AVAILABLE,
      };
    }

    return null;
  }

  private release(items: readonly OrderItem[]): void {
    for (const item of items) {
      this.stock.restore(item.variantId, item.quantity);
    }
  }

  private freeze(line: CheckoutItemDto, index: number): OrderItem {
    const variant = this.catalog.findVariantBySku(line.sku);

    if (variant === undefined) {
      throw new SkuNotFoundError([
        { field: `items.${index}.sku`, message: `Não encontramos o produto ${line.sku}.` },
      ]);
    }

    const product = this.catalog.findProduct(variant.productId);

    if (product === undefined) {
      throw new Error(`Variant ${variant.sku} points to unknown product ${variant.productId}`);
    }

    return {
      variantId: variant.id,
      quantity: line.quantity,
      unitPriceCents: variant.priceCents,
      subtotalCents: multiply(variant.priceCents, line.quantity),
      skuSnapshot: variant.sku,
      nameSnapshot: variantDisplayName(product, variant),
    };
  }
}
