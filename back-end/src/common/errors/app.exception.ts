import { HttpException } from '@nestjs/common';
import { ApiErrorDetail } from '../http/api-response';
import { ErrorCode, HTTP_STATUS_BY_ERROR_CODE, MESSAGE_BY_ERROR_CODE } from './error-catalog';

export class AppException extends HttpException {
  readonly code: ErrorCode;

  readonly details?: ApiErrorDetail[];

  constructor(
    code: ErrorCode,
    details?: ApiErrorDetail[],
    message: string = MESSAGE_BY_ERROR_CODE[code],
  ) {
    super(message, HTTP_STATUS_BY_ERROR_CODE[code]);
    this.code = code;
    this.details = details;
  }
}
