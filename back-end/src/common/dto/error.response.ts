import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { ERROR_CODES } from '../errors/error-catalog';
import type { ErrorCode } from '../errors/error-catalog';

export class ErrorDetail {
  @ApiProperty({
    description: 'Path of the field that failed validation, dotted for nested fields.',
    example: 'items.0.quantity',
  })
  field!: string;

  @ApiProperty({
    description: 'Human readable explanation, written in Brazilian Portuguese.',
    example: 'Informe ao menos uma unidade.',
  })
  message!: string;

  @ApiPropertyOptional({
    description: 'Sku the failure refers to, present when stock is the reason.',
    example: 'CAP-BLOOM-IP16-AIS-TRA',
  })
  sku?: string;

  @ApiPropertyOptional({
    description: 'Units still available for that sku at the moment the order was refused.',
    example: 3,
  })
  available?: number;
}

export class ErrorBody {
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
    type: [ErrorDetail],
  })
  details?: ErrorDetail[];
}

export class ResponseMeta {
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

export class ErrorResponse {
  @ApiProperty({
    description: 'Always null when the request failed.',
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: null,
  })
  data!: null;

  @ApiProperty({ description: 'What went wrong.', type: ErrorBody })
  error!: ErrorBody;

  @ApiProperty({ description: 'Metadata attached to every response.', type: ResponseMeta })
  meta!: ResponseMeta;
}
