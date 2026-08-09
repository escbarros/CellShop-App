import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { APP_FILTER, APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { CatalogModule } from './catalog/catalog.module';
import { validateEnvironment } from './common/config/environment';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { ApiResponseInterceptor } from './common/interceptors/api-response.interceptor';
import { createValidationPipe } from './common/pipes/validation.pipe';
import { HealthModule } from './health/health.module';
import { OrdersModule } from './orders/orders.module';
import { StockModule } from './stock/stock.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      cache: true,
      validate: validateEnvironment,
    }),
    HealthModule,
    CatalogModule,
    StockModule,
    OrdersModule,
  ],
  controllers: [],
  providers: [
    { provide: APP_PIPE, useFactory: createValidationPipe },
    { provide: APP_INTERCEPTOR, useClass: ApiResponseInterceptor },
    { provide: APP_FILTER, useClass: AllExceptionsFilter },
  ],
})
export class AppModule {}
