import { Injectable } from '@nestjs/common';
import { Stock } from '../../stock/stock.model';
import { StockRepository } from '../repository.contracts';
import type { CatalogState } from './seed';

@Injectable()
export class InMemoryStockRepository extends StockRepository {
  private readonly stockByVariantId: Map<string, Stock>;

  constructor(state: CatalogState) {
    super();

    this.stockByVariantId = new Map(state.stock.map((entry) => [entry.variantId, { ...entry }]));
  }

  find(variantId: string): Stock | undefined {
    const entry = this.stockByVariantId.get(variantId);

    return entry === undefined ? undefined : { ...entry };
  }

  decrementIfAvailable(variantId: string, qty: number): boolean {
    const entry = this.stockByVariantId.get(variantId);

    if (entry === undefined || qty <= 0 || entry.availableQty < qty) {
      return false;
    }

    entry.availableQty -= qty;
    entry.reservedQty += qty;
    entry.version += 1;
    entry.updatedAt = new Date();

    return true;
  }

  restore(variantId: string, qty: number): void {
    const entry = this.stockByVariantId.get(variantId);

    if (entry === undefined || qty <= 0) {
      return;
    }

    const restored = Math.min(qty, entry.reservedQty);

    entry.availableQty += restored;
    entry.reservedQty -= restored;
    entry.version += 1;
    entry.updatedAt = new Date();
  }
}
