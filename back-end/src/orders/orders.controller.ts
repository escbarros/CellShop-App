import { Controller, Get, HttpStatus, NotImplementedException } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope, ApiEnvelopeError } from '../common/dto/api-envelope.decorator';
import { API_TAGS } from '../common/swagger';
import { OrderResponse } from './dto/order.response';

@ApiTags(API_TAGS.orders)
@Controller('orders')
export class OrdersController {
  @Get(':number')
  @ApiOperation({
    summary: 'Read a placed order',
    description:
      'Returns the order as it was recorded, with sku, name and price frozen at purchase time.',
  })
  @ApiParam({
    name: 'number',
    description: 'Order number handed back by POST /checkout.',
    example: 'CCS-2026-000417',
  })
  @ApiEnvelope({
    status: HttpStatus.OK,
    description: 'The requested order.',
    type: OrderResponse,
  })
  @ApiEnvelopeError({
    status: HttpStatus.NOT_FOUND,
    description: 'ORDER_NOT_FOUND. No order carries this number.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected failure. The cause is logged under meta.requestId.',
  })
  find(): OrderResponse {
    throw new NotImplementedException();
  }
}
