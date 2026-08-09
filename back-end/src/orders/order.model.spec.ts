import { ORDER_STATUSES, OrderStatus, canTransition } from './order.model';

const statuses = Object.values(ORDER_STATUSES) as OrderStatus[];

const TERMINAL_STATUSES: OrderStatus[] = [
  ORDER_STATUSES.CONFIRMED,
  ORDER_STATUSES.CANCELLED,
  ORDER_STATUSES.FAILED,
];

describe('order state machine', () => {
  it('confirms an order that is still pending', () => {
    expect(canTransition(ORDER_STATUSES.PENDING, ORDER_STATUSES.CONFIRMED)).toBe(true);
  });

  it('lets a pending order be cancelled or fail', () => {
    expect(canTransition(ORDER_STATUSES.PENDING, ORDER_STATUSES.CANCELLED)).toBe(true);
    expect(canTransition(ORDER_STATUSES.PENDING, ORDER_STATUSES.FAILED)).toBe(true);
  });

  it('refuses reopening a confirmed order', () => {
    expect(canTransition(ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.PENDING)).toBe(false);
  });

  it.each(TERMINAL_STATUSES)('treats %s as terminal', (from) => {
    statuses.forEach((to) => {
      expect(canTransition(from, to)).toBe(false);
    });
  });

  it.each(statuses)('refuses %s as a transition to itself', (status) => {
    expect(canTransition(status, status)).toBe(false);
  });

  it('leaves pending as the only status an order can move away from', () => {
    const movable = statuses.filter((from) => statuses.some((to) => canTransition(from, to)));

    expect(movable).toEqual([ORDER_STATUSES.PENDING]);
  });
});
