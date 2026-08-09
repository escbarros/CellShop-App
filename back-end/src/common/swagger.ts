import { ApiProperty, ApiPropertyOptional, DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { ERROR_CODES } from './errors/error-catalog';
import type { ErrorCode } from './errors/error-catalog';
import { readPackageVersion } from './package-info';

export const SWAGGER_PATH = 'docs';

export const API_TAGS = {
  catalog: 'catalog',
  checkout: 'checkout',
  orders: 'orders',
  health: 'health',
} as const;

export class ApiErrorDetailSchema {
  @ApiProperty({ description: 'Name of the field that failed validation.', example: 'quantity' })
  field!: string;

  @ApiProperty({
    description: 'Human readable explanation, written in Brazilian Portuguese.',
    example: 'Informe ao menos uma unidade.',
  })
  message!: string;
}

export class ApiErrorSchema {
  @ApiProperty({
    description: 'Machine readable error code. Clients branch on this, never on the message.',
    enum: Object.values(ERROR_CODES),
    example: ERROR_CODES.INSUFFICIENT_STOCK,
  })
  code!: ErrorCode;

  @ApiProperty({
    description: 'Human readable message, written in Brazilian Portuguese and safe to display.',
    example: 'Não temos essa quantidade em estoque.',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Field level failures, present only when the error is a validation failure.',
    type: [ApiErrorDetailSchema],
  })
  details?: ApiErrorDetailSchema[];
}

export class ApiMetaSchema {
  @ApiProperty({
    description: 'Identifier assigned to the request, echoed back for correlation in logs.',
    example: 'req_9f2c1a4b7d3e5081',
  })
  requestId!: string;

  @ApiProperty({
    description: 'Moment the response was built, in ISO 8601.',
    example: '2026-08-09T12:00:00.000Z',
  })
  timestamp!: string;
}

export class ApiErrorResponseSchema {
  @ApiProperty({
    description: 'Always null when the request failed.',
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: null,
  })
  data!: null;

  @ApiProperty({ description: 'What went wrong.', type: ApiErrorSchema })
  error!: ApiErrorSchema;

  @ApiProperty({ description: 'Metadata attached to every response.', type: ApiMetaSchema })
  meta!: ApiMetaSchema;
}

export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setTitle('CellShop API')
    .setDescription('Checkout API for phone case orders.')
    .setVersion(readPackageVersion())
    .addTag(API_TAGS.catalog, 'Catalog')
    .addTag(API_TAGS.checkout, 'Purchase.')
    .addTag(API_TAGS.orders, 'Placed orders.')
    .addTag(API_TAGS.health, 'Service health.')
    .build();

  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiErrorResponseSchema, ApiErrorSchema, ApiErrorDetailSchema, ApiMetaSchema],
  });

  SwaggerModule.setup(SWAGGER_PATH, app, document);
}
