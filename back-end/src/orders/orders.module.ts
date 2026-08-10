import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { InMemoryOrderRepository } from '../repositories/in-memory/order.repository';
import { OrderRepository } from '../repositories/repository.contracts';
import { StockModule } from '../stock/stock.module';
import { CheckoutController } from './checkout.controller';
import { CheckoutService } from './checkout.service';
import { OrdersController } from './orders.controller';
import { OrdersService } from './orders.service';

@Module({
  imports: [CatalogModule, StockModule],
  controllers: [CheckoutController, OrdersController],
  providers: [
    CheckoutService,
    OrdersService,
    { provide: OrderRepository, useClass: InMemoryOrderRepository },
  ],
  exports: [OrderRepository],
})
export class OrdersModule {}
