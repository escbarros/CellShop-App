import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Environment } from '../common/config/environment';
import { InMemoryCatalogRepository } from '../repositories/in-memory/catalog.repository';
import { createInitialState } from '../repositories/in-memory/seed';
import { CatalogRepository } from '../repositories/repository.contracts';
import { StockModule } from '../stock/stock.module';
import { CatalogController } from './catalog.controller';
import { CatalogService } from './catalog.service';

@Module({
  imports: [StockModule],
  controllers: [CatalogController],
  providers: [
    CatalogService,
    {
      provide: CatalogRepository,
      useFactory: (config: ConfigService<Environment, true>): CatalogRepository =>
        new InMemoryCatalogRepository(
          createInitialState(config.get('IMAGES_BASE_URL', { infer: true })),
        ),
      inject: [ConfigService],
    },
  ],
  exports: [CatalogRepository],
})
export class CatalogModule {}
