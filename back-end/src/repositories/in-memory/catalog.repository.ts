import { Injectable } from '@nestjs/common';
import { Product, ProductVariant } from '../../catalog/catalog.model';
import { CatalogRepository } from '../repository.contracts';
import { CatalogState } from './seed';

@Injectable()
export class InMemoryCatalogRepository extends CatalogRepository {
  private readonly productsById: Map<string, Product>;

  private readonly activeVariantsBySku: Map<string, ProductVariant>;

  private readonly shelf: readonly ProductVariant[];

  constructor(state: CatalogState) {
    super();

    this.productsById = new Map(state.products.map((product) => [product.id, { ...product }]));

    this.shelf = state.variants
      .filter((variant) => variant.active)
      .map((variant) => ({ ...variant }))
      .sort((left, right) => left.priceCents - right.priceCents);

    this.activeVariantsBySku = new Map(this.shelf.map((variant) => [variant.sku, variant]));
  }

  listActiveVariants(): readonly ProductVariant[] {
    return this.shelf.map((variant) => ({ ...variant }));
  }

  findVariantBySku(sku: string): ProductVariant | undefined {
    const variant = this.activeVariantsBySku.get(sku);

    return variant === undefined ? undefined : { ...variant };
  }

  findProduct(id: string): Product | undefined {
    const product = this.productsById.get(id);

    return product === undefined ? undefined : { ...product };
  }
}
