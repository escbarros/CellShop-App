import { Module } from '@nestjs/common';
import { InMemoryOrderRepository } from '../repositories/in-memory/order.repository';
import { OrderRepository } from '../repositories/repository.contracts';
import { CheckoutController } from './checkout.controller';
import { OrdersController } from './orders.controller';

@Module({
  controllers: [CheckoutController, OrdersController],
  providers: [{ provide: OrderRepository, useClass: InMemoryOrderRepository }],
  exports: [OrderRepository],
})
export class OrdersModule {}
