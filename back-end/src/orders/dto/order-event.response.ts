import { ApiProperty } from '@nestjs/swagger';
import { ORDER_STATUS_VALUES } from './order-status';
import type { OrderStatusValue } from './order-status';

export class OrderEventResponse {
  @ApiProperty({
    description: 'Status the order held before this event. Null on the event that created it.',
    enum: ORDER_STATUS_VALUES,
    nullable: true,
    example: 'PENDING',
  })
  previousStatus!: OrderStatusValue | null;

  @ApiProperty({
    description: 'Status the order moved to.',
    enum: ORDER_STATUS_VALUES,
    example: 'CONFIRMED',
  })
  newStatus!: OrderStatusValue;

  @ApiProperty({
    description: 'What caused the transition, such as the checkout flow or an operator action.',
    example: 'checkout',
  })
  source!: string;

  @ApiProperty({
    description: 'Explanation of the transition, written in Brazilian Portuguese.',
    example: 'Estoque reservado e pedido confirmado.',
  })
  message!: string;

  @ApiProperty({
    description: 'Moment the transition happened, in ISO 8601.',
    example: '2026-08-09T12:00:03.117Z',
  })
  createdAt!: string;
}
