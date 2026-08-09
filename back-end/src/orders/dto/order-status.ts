export const ORDER_STATUS_VALUES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'FAILED'] as const;

export type OrderStatusValue = (typeof ORDER_STATUS_VALUES)[number];
