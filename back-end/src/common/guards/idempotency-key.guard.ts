import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { MissingIdempotencyKeyError } from '../errors/domain.errors';

export const IDEMPOTENCY_KEY_HEADER = 'idempotency-key';

@Injectable()
export class IdempotencyKeyGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const key = request.header(IDEMPOTENCY_KEY_HEADER)?.trim();

    if (!key) {
      throw new MissingIdempotencyKeyError();
    }

    return true;
  }
}
