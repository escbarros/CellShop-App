import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ORDER_STATUSES, OrderEvent } from '../../orders/order.model';
import { DuplicateIdempotencyKeyError, OrderDraft } from '../repository.contracts';
import { InMemoryOrderRepository } from './order.repository';

const CREATED_AT = new Date('2026-08-09T12:00:00.000Z');

function createDraft(idempotencyKey: string): OrderDraft {
  return {
    order: {
      idempotencyKey,
      status: ORDER_STATUSES.PENDING,
      subtotalCents: 7990,
      shippingCents: 0,
      discountCents: 0,
      totalCents: 7990,
      createdAt: CREATED_AT,
      updatedAt: CREATED_AT,
    },
    items: [
      {
        variantId: 'CAP-SCRAPBOOK-IP16-AIS-TRA',
        quantity: 1,
        unitPriceCents: 7990,
        subtotalCents: 7990,
        skuSnapshot: 'CAP-SCRAPBOOK-IP16-AIS-TRA',
        nameSnapshot: 'Floral Scrapbook',
      },
    ],
    recipient: {
      name: 'Ana Souza',
      taxId: '39053344705',
      email: 'ana@example.com',
      phone: '11988887777',
      zipCode: '01310100',
      street: 'Avenida Paulista',
      number: '1000',
      complement: null,
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
  };
}

function createEvent(message: string): OrderEvent {
  return {
    previousStatus: null,
    newStatus: ORDER_STATUSES.PENDING,
    source: 'checkout',
    message,
    createdAt: CREATED_AT,
  };
}

describe('in-memory order repository', () => {
  it('rejects a second order with the same idempotency key', () => {
    const repository = new InMemoryOrderRepository();

    repository.save(createDraft('key-1'));

    expect(() => repository.save(createDraft('key-1'))).toThrow(DuplicateIdempotencyKeyError);
  });

  it('keeps the first order intact when a duplicate is rejected', () => {
    const repository = new InMemoryOrderRepository();
    const first = repository.save(createDraft('key-1'));

    expect(() => repository.save(createDraft('key-1'))).toThrow(DuplicateIdempotencyKeyError);

    expect(repository.findByIdempotencyKey('key-1')?.order).toEqual(first.order);
    expect(repository.save(createDraft('key-2')).order.number).toBe('CCS-2026-000002');
  });

  it('generates unique sequential order numbers', () => {
    const repository = new InMemoryOrderRepository();
    const numbers = ['key-1', 'key-2', 'key-3'].map(
      (key) => repository.save(createDraft(key)).order.number,
    );

    expect(numbers).toEqual(['CCS-2026-000001', 'CCS-2026-000002', 'CCS-2026-000003']);
    expect(new Set(numbers).size).toBe(numbers.length);
  });

  it('writes the idempotency key in the same synchronous operation that creates the order', async () => {
    const source = readFileSync(join(__dirname, 'order.repository.ts'), 'utf8');

    expect(source).not.toMatch(/\basync\b|\bawait\b|\.then\(/);

    const repository = new InMemoryOrderRepository();
    const results = await Promise.all(
      Array.from({ length: 10 }, () =>
        Promise.resolve()
          .then(() => repository.save(createDraft('key-1')))
          .then(() => true)
          .catch(() => false),
      ),
    );

    expect(results.filter((saved) => saved)).toHaveLength(1);
  });

  it('finds a saved order by its number', () => {
    const repository = new InMemoryOrderRepository();
    const saved = repository.save(createDraft('key-1'));

    expect(repository.findByNumber(saved.order.number)?.order.id).toBe(saved.order.id);
  });

  it('returns undefined for a key or a number it never saw', () => {
    const repository = new InMemoryOrderRepository();

    expect(repository.findByIdempotencyKey('key-1')).toBeUndefined();
    expect(repository.findByNumber('CCS-2026-000001')).toBeUndefined();
  });

  it('returns events in insertion order', () => {
    const repository = new InMemoryOrderRepository();
    const { order } = repository.save(createDraft('key-1'));

    repository.appendEvent(order.id, createEvent('Pedido recebido'));
    repository.appendEvent(order.id, createEvent('Estoque reservado'));

    expect(repository.eventsOf(order.id).map((event) => event.message)).toEqual([
      'Pedido recebido',
      'Estoque reservado',
    ]);
  });

  it('does not allow an event to be removed or edited', () => {
    const repository = new InMemoryOrderRepository();
    const { order } = repository.save(createDraft('key-1'));

    repository.appendEvent(order.id, createEvent('Pedido recebido'));

    const events = repository.eventsOf(order.id) as OrderEvent[];

    events[0].message = 'Adulterado';
    events.pop();

    expect(repository.eventsOf(order.id)).toHaveLength(1);
    expect(repository.eventsOf(order.id)[0].message).toBe('Pedido recebido');
  });

  it('returns no events for an order it does not know', () => {
    const repository = new InMemoryOrderRepository();

    expect(repository.eventsOf('404')).toEqual([]);
    repository.appendEvent('404', createEvent('Pedido recebido'));

    expect(repository.eventsOf('404')).toEqual([]);
  });

  it('does not expose mutable internal state', () => {
    const repository = new InMemoryOrderRepository();
    const saved = repository.save(createDraft('key-1'));

    saved.order.totalCents = 1;
    saved.recipient.name = 'Adulterado';

    expect(repository.findByIdempotencyKey('key-1')?.order.totalCents).toBe(7990);
    expect(repository.findByIdempotencyKey('key-1')?.recipient.name).toBe('Ana Souza');
  });
});
