import { Controller, Get, HttpStatus, Param } from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { ApiEnvelope, ApiEnvelopeError } from '../common/dto/api-envelope.decorator';
import { API_TAGS } from '../common/swagger';
import { CatalogService } from './catalog.service';
import { VariantResponse } from './dto/variant.response';

@ApiTags(API_TAGS.catalog)
@Controller('products')
export class CatalogController {
  constructor(private readonly catalog: CatalogService) {}

  @Get()
  @ApiOperation({
    summary: 'List every sellable variant',
    description:
      'Returns the storefront catalog. Inactive variants are left out; sold out ones are listed with available set to false, so the shopper sees them without being able to buy.',
  })
  @ApiEnvelope({
    status: HttpStatus.OK,
    description: 'The catalog, one entry per active variant.',
    type: VariantResponse,
    isArray: true,
  })
  @ApiEnvelopeError({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected failure. The cause is logged under meta.requestId.',
  })
  list(): VariantResponse[] {
    return this.catalog.list();
  }

  @Get(':sku')
  @ApiOperation({
    summary: 'Read a single variant by sku',
    description: 'Returns one variant with its current stock, for the product detail screen.',
  })
  @ApiParam({
    name: 'sku',
    description: 'Stock keeping unit, as listed by GET /products.',
    example: 'CAP-SCRAPBOOK-IP16-AIS-TRA',
  })
  @ApiEnvelope({
    status: HttpStatus.OK,
    description: 'The requested variant.',
    type: VariantResponse,
  })
  @ApiEnvelopeError({
    status: HttpStatus.NOT_FOUND,
    description: 'SKU_NOT_FOUND. Unknown sku, or a variant that is no longer active.',
  })
  @ApiEnvelopeError({
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'Unexpected failure. The cause is logged under meta.requestId.',
  })
  find(@Param('sku') sku: string): VariantResponse {
    return this.catalog.findBySku(sku);
  }
}
