import { Module } from '@nestjs/common';
import { InMemoryOrderRepository } from '../repositories/in-memory/order.repository';
import { OrderRepository } from '../repositories/repository.contracts';

@Module({
  providers: [{ provide: OrderRepository, useClass: InMemoryOrderRepository }],
  exports: [OrderRepository],
})
export class OrdersModule {}
