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
import { ORDER_STATUSES, OrderItem, OrderRecipient } from './order.model';

const NO_DISCOUNT_CENTS = 0;

const NO_SHIPPING_CENTS = 0;

const NOTHING_AVAILABLE = 0;

const SINGLE_UNIT = 1;

function shortageMessage(name: string, available: number): string {
  if (available === NOTHING_AVAILABLE) {
    return `${name} está esgotado.`;
  }

  return `Restam apenas ${available} ${available === SINGLE_UNIT ? 'unidade' : 'unidades'} de ${name}.`;
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

    this.take(items);

    const subtotalCents = sum(...items.map((item) => item.subtotalCents));
    const shippingCents = shippingFor(subtotalCents);
    const createdAt = new Date();

    const draft: OrderDraft = {
      order: {
        idempotencyKey,
        status: ORDER_STATUSES.CONFIRMED,
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

    return this.record(draft);
  }

  private record(draft: OrderDraft): CheckoutOutcome {
    try {
      return { order: toResponse(this.orders.save(draft)), replayed: false };
    } catch (error) {
      if (!(error instanceof DuplicateIdempotencyKeyError)) {
        throw error;
      }

      const known = this.orders.findByIdempotencyKey(error.idempotencyKey);

      if (known === undefined) {
        throw error;
      }

      this.release(draft.items);

      return { order: toResponse(known), replayed: true };
    }
  }

  private take(items: readonly OrderItem[]): void {
    const taken: OrderItem[] = [];

    for (const [index, item] of items.entries()) {
      if (this.stock.decrementIfAvailable(item.variantId, item.quantity)) {
        taken.push(item);

        continue;
      }

      this.release(taken);

      const available = this.stock.find(item.variantId)?.availableQty ?? NOTHING_AVAILABLE;

      throw new InsufficientStockError([
        {
          field: `items.${index}.quantity`,
          message: shortageMessage(item.nameSnapshot, available),
          sku: item.skuSnapshot,
          available,
        },
      ]);
    }
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
