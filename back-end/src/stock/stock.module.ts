import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../common/config/environment';
import { createInitialState } from '../repositories/in-memory/seed';
import { InMemoryStockRepository } from '../repositories/in-memory/stock.repository';
import { StockRepository } from '../repositories/repository.contracts';

@Module({
  providers: [
    {
      provide: StockRepository,
      useFactory: (config: ConfigService<Environment, true>): StockRepository =>
        new InMemoryStockRepository(
          createInitialState(config.get('IMAGES_BASE_URL', { infer: true })),
        ),
      inject: [ConfigService],
    },
  ],
  exports: [StockRepository],
})
export class StockModule {}
