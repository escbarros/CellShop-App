import { Injectable } from '@nestjs/common';
import { formatBRL } from '../common/money';
import { CatalogRepository, StockRepository } from '../repositories/repository.contracts';
import { ProductVariant } from './catalog.model';
import { VariantResponse } from './dto/variant.response';

@Injectable()
export class CatalogService {
  constructor(
    private readonly catalog: CatalogRepository,
    private readonly stock: StockRepository,
  ) {}

  list(): VariantResponse[] {
    return this.catalog.listActiveVariants().map((variant) => this.toResponse(variant));
  }

  private toResponse(variant: ProductVariant): VariantResponse {
    const product = this.catalog.findProduct(variant.productId);

    if (product === undefined) {
      throw new Error(`Variant ${variant.sku} points to unknown product ${variant.productId}`);
    }

    const availableQty = this.stock.find(variant.id)?.availableQty ?? 0;

    return {
      sku: variant.sku,
      name: `${product.name} · ${variant.device}`,
      description: product.description,
      priceCents: variant.priceCents,
      formattedPrice: formatBRL(variant.priceCents),
      availableQty,
      available: availableQty > 0,
      imageUrl: variant.imageUrl,
      thumbUrl: variant.thumbUrl,
    };
  }
}
