import { ApiProperty } from '@nestjs/swagger';
import { OrderItemResponse } from './order-item.response';
import { ORDER_STATUS_VALUES } from './order-status';
import type { OrderStatusValue } from './order-status';

export const FLAT_SHIPPING_CENTS = 1990;
export const FREE_SHIPPING_THRESHOLD_CENTS = 19900;

export class OrderResponse {
  @ApiProperty({
    description: 'Human readable order number, the reference the customer quotes to support.',
    example: 'CCS-2026-000417',
  })
  number!: string;

  @ApiProperty({
    description: 'Where the order stands. Only PENDING can still move to another status.',
    enum: ORDER_STATUS_VALUES,
    example: 'CONFIRMED',
  })
  status!: OrderStatusValue;

  @ApiProperty({
    description: 'Lines of the order, with sku, name and price frozen at purchase time.',
    type: [OrderItemResponse],
  })
  items!: OrderItemResponse[];

  @ApiProperty({
    description: 'Sum of every line total, as an integer amount of cents.',
    type: 'integer',
    example: 15980,
  })
  subtotalCents!: number;

  @ApiProperty({
    description: `Shipping in cents. Flat ${FLAT_SHIPPING_CENTS}, or 0 when subtotalCents is at least ${FREE_SHIPPING_THRESHOLD_CENTS}.`,
    type: 'integer',
    example: FLAT_SHIPPING_CENTS,
  })
  shippingCents!: number;

  @ApiProperty({
    description: 'Discount in cents. Always 0 in this delivery, there is no coupon yet.',
    type: 'integer',
    example: 0,
  })
  discountCents!: number;

  @ApiProperty({
    description: 'What the customer pays: subtotalCents plus shippingCents minus discountCents.',
    type: 'integer',
    example: 17970,
  })
  totalCents!: number;

  @ApiProperty({
    description: 'Moment the order was placed, in ISO 8601.',
    example: '2026-08-09T12:00:03.104Z',
  })
  createdAt!: string;
}
