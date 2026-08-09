import { Cents } from '../common/money';

export const ORDER_STATUSES = {
  PENDING: 'PENDING',
  CONFIRMED: 'CONFIRMED',
  CANCELLED: 'CANCELLED',
  FAILED: 'FAILED',
} as const;

export type OrderStatus = (typeof ORDER_STATUSES)[keyof typeof ORDER_STATUSES];

const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING: [ORDER_STATUSES.CONFIRMED, ORDER_STATUSES.CANCELLED, ORDER_STATUSES.FAILED],
  CONFIRMED: [],
  CANCELLED: [],
  FAILED: [],
};

export function canTransition(from: OrderStatus, to: OrderStatus): boolean {
  return ALLOWED_TRANSITIONS[from].includes(to);
}

export type Order = {
  id: string;
  number: string;
  idempotencyKey: string;
  status: OrderStatus;
  subtotalCents: Cents;
  shippingCents: Cents;
  discountCents: Cents;
  totalCents: Cents;
  createdAt: Date;
  updatedAt: Date;
};

export type OrderItem = {
  variantId: string;
  quantity: number;
  unitPriceCents: Cents;
  subtotalCents: Cents;
  skuSnapshot: string;
  nameSnapshot: string;
};

export type OrderRecipient = {
  name: string;
  taxId: string;
  email: string;
  phone: string;
  zipCode: string;
  street: string;
  number: string;
  complement: string | null;
  district: string;
  city: string;
  state: string;
};

export type OrderEvent = {
  previousStatus: OrderStatus | null;
  newStatus: OrderStatus;
  source: string;
  message: string;
  createdAt: Date;
};
