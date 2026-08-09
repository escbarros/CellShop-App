import { randomBytes } from 'node:crypto';
import { NextFunction, Request, Response } from 'express';

const REQUEST_ID_BYTES = 8;

export type RequestWithId = Request & { requestId?: string };

export function generateRequestId(): string {
  return `req_${randomBytes(REQUEST_ID_BYTES).toString('hex')}`;
}

export function readRequestId(request: RequestWithId): string {
  return request.requestId ?? generateRequestId();
}

export function assignRequestId(
  request: RequestWithId,
  _response: Response,
  next: NextFunction,
): void {
  request.requestId = generateRequestId();
  next();
}
