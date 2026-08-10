import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope, ApiEnvelopeError } from '../common/dto/api-envelope.decorator';
import { API_TAGS } from '../common/swagger';
import { OrderDetailResponse } from './dto/order-detail.response';
import { OrderSummaryResponse } from './dto/order-summary.response';
import { OrdersService } from './orders.service';

@ApiTags(API_TAGS.orders)
@Controller('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  @ApiOperation({
    summary: 'List placed orders',
    description:
      'Returns every order placed so far, newest first, summarised. The route has no authentication, so the summary carries no recipient data; use GET /orders/:number for the full record.',
  })
  @ApiEnvelope({
    status: HttpStatus.OK,
    description: 'The orders placed so far, newest first.',
    type: OrderSummaryResponse,
    isArray: true,
  })
  @ApiEnvelopeError({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected failure. The cause is logged under meta.requestId.',
  })
  list(): OrderSummaryResponse[] {
    return this.orders.list();
  }

  @Get(':number')
  @ApiOperation({
    summary: 'Read a placed order',
    description:
      'Returns the order as it was recorded, with sku, name and price frozen at purchase time, the recipient with a masked tax id, and the full transition trail.',
  })
  @ApiParam({
    name: 'number',
    description: 'Order number handed back by POST /checkout.',
    example: 'CCS-2026-000417',
  })
  @ApiEnvelope({
    status: HttpStatus.OK,
    description: 'The requested order, with its recipient and its event trail.',
    type: OrderDetailResponse,
  })
  @ApiEnvelopeError({
    status: HttpStatus.NOT_FOUND,
    description: 'ORDER_NOT_FOUND. No order carries this number.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected failure. The cause is logged under meta.requestId.',
  })
  find(@Param('number') number: string): OrderDetailResponse {
    return this.orders.findByNumber(number);
  }
}
