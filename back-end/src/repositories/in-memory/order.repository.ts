import { Injectable } from '@nestjs/common';
import { Order, OrderEvent } from '../../orders/order.model';
import {
  DuplicateIdempotencyKeyError,
  OrderAggregate,
  OrderDraft,
  OrderRepository,
} from '../repository.contracts';

const NUMBER_PREFIX = 'CCS';

const SEQUENCE_LENGTH = 6;

@Injectable()
export class InMemoryOrderRepository extends OrderRepository {
  private readonly ordersByIdempotencyKey = new Map<string, OrderAggregate>();

  private readonly ordersByNumber = new Map<string, OrderAggregate>();

  private readonly eventsByOrderId = new Map<string, OrderEvent[]>();

  private nextSequence = 1;

  save(draft: OrderDraft): OrderAggregate {
    if (this.ordersByIdempotencyKey.has(draft.order.idempotencyKey)) {
      throw new DuplicateIdempotencyKeyError(draft.order.idempotencyKey);
    }

    const sequence = this.nextSequence;

    this.nextSequence += 1;

    const order: Order = {
      ...draft.order,
      id: String(sequence),
      number: this.numberFor(draft.order.createdAt, sequence),
    };

    const aggregate: OrderAggregate = {
      order,
      items: draft.items.map((item) => ({ ...item })),
      recipient: { ...draft.recipient },
    };

    this.ordersByIdempotencyKey.set(order.idempotencyKey, aggregate);
    this.ordersByNumber.set(order.number, aggregate);
    this.eventsByOrderId.set(order.id, []);

    return copyOf(aggregate);
  }

  findByIdempotencyKey(key: string): OrderAggregate | undefined {
    const aggregate = this.ordersByIdempotencyKey.get(key);

    return aggregate === undefined ? undefined : copyOf(aggregate);
  }

  findByNumber(number: string): OrderAggregate | undefined {
    const aggregate = this.ordersByNumber.get(number);

    return aggregate === undefined ? undefined : copyOf(aggregate);
  }

  appendEvent(orderId: string, event: OrderEvent): void {
    this.eventsByOrderId.get(orderId)?.push({ ...event });
  }

  eventsOf(orderId: string): readonly OrderEvent[] {
    return (this.eventsByOrderId.get(orderId) ?? []).map((event) => ({ ...event }));
  }

  private numberFor(createdAt: Date, sequence: number): string {
    const year = createdAt.getFullYear();

    return `${NUMBER_PREFIX}-${year}-${String(sequence).padStart(SEQUENCE_LENGTH, '0')}`;
  }
}

function copyOf(aggregate: OrderAggregate): OrderAggregate {
  return {
    order: { ...aggregate.order },
    items: aggregate.items.map((item) => ({ ...item })),
    recipient: { ...aggregate.recipient },
  };
}
