import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS_VALUES } from './order-status';
import type { OrderStatusValue } from './order-status';

export class OrderSummaryResponse {
  @ApiProperty({
    description: 'Human readable order number, the reference the customer quotes to support.',
    example: 'CCS-2026-000417',
  })
  number!: string;

  @ApiProperty({
    description: 'Where the order stands.',
    enum: ORDER_STATUS_VALUES,
    example: 'CONFIRMED',
  })
  status!: OrderStatusValue;

  @ApiProperty({
    description: 'How many units the order carries, summed across every line.',
    type: 'integer',
    example: 3,
  })
  itemCount!: number;

  @ApiProperty({
    description: 'What the customer pays, as an integer amount of cents.',
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
