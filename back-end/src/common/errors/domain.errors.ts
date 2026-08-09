import { ApiErrorDetail } from '../http/api-response';
import { AppException } from './app.exception';
import { ERROR_CODES } from './error-catalog';

export class InvalidBodyError extends AppException {
  constructor() {
    super(ERROR_CODES.INVALID_BODY);
  }
}

export class MissingIdempotencyKeyError extends AppException {
  constructor() {
    super(ERROR_CODES.MISSING_IDEMPOTENCY_KEY);
  }
}

export class RouteNotFoundError extends AppException {
  constructor() {
    super(ERROR_CODES.ROUTE_NOT_FOUND);
  }
}

export class SkuNotFoundError extends AppException {
  constructor(details?: ApiErrorDetail[]) {
    super(ERROR_CODES.SKU_NOT_FOUND, details);
  }
}

export class OrderNotFoundError extends AppException {
  constructor() {
    super(ERROR_CODES.ORDER_NOT_FOUND);
  }
}

export class InsufficientStockError extends AppException {
  constructor() {
    super(ERROR_CODES.INSUFFICIENT_STOCK);
  }
}

export class ValidationFailedError extends AppException {
  constructor(details: ApiErrorDetail[]) {
    super(ERROR_CODES.VALIDATION_FAILED, details);
  }
}

export class ServiceUnavailableError extends AppException {
  constructor() {
    super(ERROR_CODES.SERVICE_UNAVAILABLE);
  }
}
