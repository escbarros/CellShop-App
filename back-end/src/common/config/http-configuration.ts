import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'node:path';
import { assignRequestId } from '../http/request-id';

export const BODY_SIZE_LIMIT = '100kb';

export const IMAGES_PATH = '/images';

const IMAGES_DIRECTORY = join(__dirname, '..', '..', '..', 'public', 'images');

export const ALLOWED_HEADERS = ['Content-Type', 'Accept', 'Idempotency-Key'];

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

function configureStaticImages(app: NestExpressApplication): void {
  app.useStaticAssets(IMAGES_DIRECTORY, { prefix: IMAGES_PATH, fallthrough: true });
}

export function configureHttp(app: NestExpressApplication, corsOrigin: string): void {
  app.use(assignRequestId);
  configureCors(app, corsOrigin);
  configureBodyLimit(app);
  configureStaticImages(app);
}
