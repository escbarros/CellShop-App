import { HttpStatus } from '@nestjs/common';

export const ERROR_CODES = {
  INVALID_BODY: 'INVALID_BODY',
  MISSING_IDEMPOTENCY_KEY: 'MISSING_IDEMPOTENCY_KEY',
  ROUTE_NOT_FOUND: 'ROUTE_NOT_FOUND',
  SKU_NOT_FOUND: 'SKU_NOT_FOUND',
  ORDER_NOT_FOUND: 'ORDER_NOT_FOUND',
  INSUFFICIENT_STOCK: 'INSUFFICIENT_STOCK',
  VALIDATION_FAILED: 'VALIDATION_FAILED',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
} as const;

export type ErrorCode = (typeof ERROR_CODES)[keyof typeof ERROR_CODES];

export const HTTP_STATUS_BY_ERROR_CODE: Record<ErrorCode, HttpStatus> = {
  INVALID_BODY: HttpStatus.BAD_REQUEST,
  MISSING_IDEMPOTENCY_KEY: HttpStatus.BAD_REQUEST,
  ROUTE_NOT_FOUND: HttpStatus.NOT_FOUND,
  SKU_NOT_FOUND: HttpStatus.NOT_FOUND,
  ORDER_NOT_FOUND: HttpStatus.NOT_FOUND,
  INSUFFICIENT_STOCK: HttpStatus.CONFLICT,
  VALIDATION_FAILED: HttpStatus.UNPROCESSABLE_ENTITY,
  SERVICE_UNAVAILABLE: HttpStatus.SERVICE_UNAVAILABLE,
  INTERNAL_ERROR: HttpStatus.INTERNAL_SERVER_ERROR,
};

export const MESSAGE_BY_ERROR_CODE: Record<ErrorCode, string> = {
  INVALID_BODY: 'Não conseguimos ler os dados enviados.',
  MISSING_IDEMPOTENCY_KEY: 'A requisição chegou sem a chave que evita compra duplicada.',
  ROUTE_NOT_FOUND: 'Endereço não encontrado.',
  SKU_NOT_FOUND: 'Não encontramos esse produto.',
  ORDER_NOT_FOUND: 'Não encontramos esse pedido.',
  INSUFFICIENT_STOCK: 'Não temos essa quantidade em estoque.',
  VALIDATION_FAILED: 'Confira os dados informados e tente de novo.',
  SERVICE_UNAVAILABLE: 'Serviço temporariamente indisponível. Tente de novo em instantes.',
  INTERNAL_ERROR: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
};

const ERROR_CODE_BY_HTTP_STATUS: Partial<Record<number, ErrorCode>> = {
  [HttpStatus.BAD_REQUEST]: ERROR_CODES.INVALID_BODY,
  [HttpStatus.PAYLOAD_TOO_LARGE]: ERROR_CODES.INVALID_BODY,
  [HttpStatus.NOT_FOUND]: ERROR_CODES.ROUTE_NOT_FOUND,
  [HttpStatus.CONFLICT]: ERROR_CODES.INSUFFICIENT_STOCK,
  [HttpStatus.UNPROCESSABLE_ENTITY]: ERROR_CODES.VALIDATION_FAILED,
  [HttpStatus.SERVICE_UNAVAILABLE]: ERROR_CODES.SERVICE_UNAVAILABLE,
};

export function errorCodeForStatus(status: number): ErrorCode {
  return ERROR_CODE_BY_HTTP_STATUS[status] ?? ERROR_CODES.INTERNAL_ERROR;
}
