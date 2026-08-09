import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import { Environment } from '../src/common/config/environment';
import { configureHttp } from '../src/common/config/http-configuration';

const TEST_ENVIRONMENT: Record<string, string> = {
  PORT: '3333',
  CORS_ORIGIN: 'http://localhost:5173',
  CHAOS_ENABLED: 'false',
  IMAGES_BASE_URL: '/images',
};

function applyTestEnvironment(): void {
  for (const [name, value] of Object.entries(TEST_ENVIRONMENT)) {
    process.env[name] ??= value;
  }
}

export async function createTestApp(): Promise<NestExpressApplication> {
  applyTestEnvironment();

  const moduleRef = await Test.createTestingModule({
    imports: [AppModule],
  }).compile();

  const app = moduleRef.createNestApplication<NestExpressApplication>({ bodyParser: false });
  const environment = app.get<ConfigService<Environment, true>>(ConfigService);

  configureHttp(app, environment.get('CORS_ORIGIN', { infer: true }));

  await app.init();

  return app;
}
