import { Type } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Environment } from '../src/common/config/environment';
import { configureHttp } from '../src/common/config/http-configuration';
import { setupSwagger } from '../src/common/swagger';

const TEST_ENVIRONMENT: Record<string, string> = {
  PORT: '3333',
  CORS_ORIGIN: 'http://localhost:5173',
  CHAOS_ENABLED: 'false',
  IMAGES_BASE_URL: 'http://localhost:3333/images',
};

function applyTestEnvironment(): void {
  for (const [name, value] of Object.entries(TEST_ENVIRONMENT)) {
    process.env[name] ??= value;
  }
}

type TestAppOptions = {
  controllers?: Type<unknown>[];
};

export async function createTestApp(options: TestAppOptions = {}): Promise<NestExpressApplication> {
  applyTestEnvironment();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
    controllers: options.controllers ?? [],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
  const environment = app.get<ConfigService<Environment, true>>(ConfigService);

  configureHttp(app, environment.get('CORS_ORIGIN', { infer: true }));
  setupSwagger(app);

  await app.init();

  return app;
}
