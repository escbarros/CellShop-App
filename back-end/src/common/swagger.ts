import { DocumentBuilder, OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ErrorBody, ErrorDetail, ErrorResponse, ResponseMeta } from './dto/error.response';
import { SuccessResponse } from './dto/success.response';
import { VariantResponse } from '../catalog/dto/variant.response';
import { CheckoutItemDto } from '../orders/dto/checkout-item.dto';
import { CreateCheckoutDto } from '../orders/dto/create-checkout.dto';
import { OrderEventResponse } from '../orders/dto/order-event.response';
import { OrderItemResponse } from '../orders/dto/order-item.response';
import { OrderResponse } from '../orders/dto/order.response';
import { RecipientDto } from '../orders/dto/recipient.dto';
import { readPackageVersion } from './package-info';

export const SWAGGER_PATH = 'docs';

export const API_TAGS = {
  catalog: 'catalog',
  checkout: 'checkout',
  orders: 'orders',
  health: 'health',
} as const;

export function createOpenApiDocument(app: INestApplication): OpenAPIObject {
  const config = new DocumentBuilder()
    .setTitle('CellShop API')
    .setDescription('Checkout API for phone case orders.')
    .setVersion(readPackageVersion())
    .addTag(API_TAGS.catalog, 'Catalog')
    .addTag(API_TAGS.checkout, 'Purchase.')
    .addTag(API_TAGS.orders, 'Placed orders.')
    .addTag(API_TAGS.health, 'Service health.')
    .build();

  return SwaggerModule.createDocument(app, config, {
    extraModels: [
      SuccessResponse,
      ErrorResponse,
      ErrorBody,
      ErrorDetail,
      ResponseMeta,
      CreateCheckoutDto,
      CheckoutItemDto,
      RecipientDto,
      VariantResponse,
      OrderResponse,
      OrderItemResponse,
      OrderEventResponse,
    ],
  });
}

export function setupSwagger(app: INestApplication): void {
  SwaggerModule.setup(SWAGGER_PATH, app, createOpenApiDocument(app));
}
