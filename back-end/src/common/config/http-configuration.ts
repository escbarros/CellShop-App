import { NestExpressApplication } from '@nestjs/platform-express';
import { assignRequestId } from '../http/request-id';

export const BODY_SIZE_LIMIT = '100kb';

export const ALLOWED_HEADERS = ['Content-Type', 'Accept', 'Idempotency-Key', 'X-Chaos'];

const ALLOWED_METHODS = ['GET', 'POST', 'OPTIONS'];

function configureCors(app: NestExpressApplication, corsOrigin: string): void {
  app.enableCors({
    origin: corsOrigin,
    methods: ALLOWED_METHODS,
    allowedHeaders: ALLOWED_HEADERS,
  });
}

function configureBodyLimit(app: NestExpressApplication): void {
  app.useBodyParser('json', { limit: BODY_SIZE_LIMIT });
  app.useBodyParser('urlencoded', { limit: BODY_SIZE_LIMIT, extended: true });
}

export function configureHttp(app: NestExpressApplication, corsOrigin: string): void {
  app.use(assignRequestId);
  configureCors(app, corsOrigin);
  configureBodyLimit(app);
}
