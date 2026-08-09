import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Response } from 'express';
import { AppException } from '../errors/app.exception';
import {
  ERROR_CODES,
  ErrorCode,
  MESSAGE_BY_ERROR_CODE,
  errorCodeForStatus,
} from '../errors/error-catalog';
import { ApiError, buildErrorResponse } from '../http/api-response';
import { RequestWithId, readRequestId } from '../http/request-id';

const LOWEST_ERROR_STATUS = 400;

const LOWEST_SERVER_ERROR_STATUS = 500;

const HIGHEST_ERROR_STATUS = 599;

type ResolvedError = {
  status: number;
  code: ErrorCode;
  error: ApiError;
};

function readTransportStatus(exception: unknown): number | undefined {
  if (typeof exception !== 'object' || exception === null) {
    return undefined;
  }

  const candidate =
    (exception as { status?: unknown; statusCode?: unknown }).status ??
    (exception as { statusCode?: unknown }).statusCode;

  const isHttpErrorStatus =
    typeof candidate === 'number' &&
    candidate >= LOWEST_ERROR_STATUS &&
    candidate <= HIGHEST_ERROR_STATUS;

  return isHttpErrorStatus ? candidate : undefined;
}

function resolve(exception: unknown): ResolvedError {
  if (exception instanceof AppException) {
    const status = exception.getStatus();
    const error: ApiError = { code: exception.code, message: exception.message };

    return {
      status,
      code: exception.code,
      error: exception.details ? { ...error, details: exception.details } : error,
    };
  }

  if (exception instanceof HttpException) {
    const status = exception.getStatus();
    const code = errorCodeForStatus(status);

    return { status, code, error: { code, message: MESSAGE_BY_ERROR_CODE[code] } };
  }

  const transportStatus = readTransportStatus(exception);

  if (transportStatus !== undefined) {
    const code = errorCodeForStatus(transportStatus);

    return { status: transportStatus, code, error: { code, message: MESSAGE_BY_ERROR_CODE[code] } };
  }

  return {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    code: ERROR_CODES.INTERNAL_ERROR,
    error: { code: ERROR_CODES.INTERNAL_ERROR, message: MESSAGE_BY_ERROR_CODE.INTERNAL_ERROR },
  };
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const http = host.switchToHttp();
    const request = http.getRequest<RequestWithId>();
    const response = http.getResponse<Response>();

    const requestId = readRequestId(request);
    const { status, code, error } = resolve(exception);

    this.record(exception, { requestId, status, code, route: `${request.method} ${request.url}` });

    response.status(status).json(buildErrorResponse(error, requestId));
  }

  private record(
    exception: unknown,
    context: { requestId: string; status: number; code: ErrorCode; route: string },
  ): void {
    const summary = `${context.requestId} ${context.route} ${context.status} ${context.code}`;

    if (context.status >= LOWEST_SERVER_ERROR_STATUS) {
      this.logger.error(summary, exception instanceof Error ? exception.stack : String(exception));

      return;
    }

    this.logger.warn(summary);
  }
}
