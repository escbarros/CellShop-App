import { ApiProperty } from '@nestjs/swagger';
import { OrderEventResponse } from './order-event.response';
import { OrderResponse } from './order.response';
import { RecipientResponse } from './recipient.response';

export class OrderDetailResponse extends OrderResponse {
  @ApiProperty({
    description: 'Who receives the order, with the tax id masked.',
    type: RecipientResponse,
  })
  recipient!: RecipientResponse;

  @ApiProperty({
    description: 'Every status transition the order went through, oldest first.',
    type: [OrderEventResponse],
  })
  events!: OrderEventResponse[];
}
