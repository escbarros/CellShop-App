import { Injectable } from '@nestjs/common';
import { OrderNotFoundError } from '../common/errors/domain.errors';
import { OrderRepository } from '../repositories/repository.contracts';
import { OrderDetailResponse } from './dto/order-detail.response';
import { OrderSummaryResponse } from './dto/order-summary.response';
import {
  toEventResponse,
  toOrderResponse,
  toOrderSummaryResponse,
  toRecipientResponse,
} from './order.mapper';

@Injectable()
export class OrdersService {
  constructor(private readonly orders: OrderRepository) {}

  list(): OrderSummaryResponse[] {
    return this.orders.listNewestFirst().map(toOrderSummaryResponse);
  }

  findByNumber(number: string): OrderDetailResponse {
    const aggregate = this.orders.findByNumber(number);

    if (aggregate === undefined) {
      throw new OrderNotFoundError();
    }

    return {
      ...toOrderResponse(aggregate),
      recipient: toRecipientResponse(aggregate.recipient),
      events: this.orders.eventsOf(aggregate.order.id).map(toEventResponse),
    };
  }
}
