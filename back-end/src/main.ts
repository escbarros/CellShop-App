import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { AppModule } from './app.module';
import { Environment } from './common/config/environment';
import { configureHttp } from './common/config/http-configuration';
import { setupSwagger } from './common/swagger';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { bodyParser: false });
  const environment = app.get<ConfigService<Environment, true>>(ConfigService);

  configureHttp(app, environment.get('CORS_ORIGIN', { infer: true }));
  setupSwagger(app);

  await app.listen(environment.get('PORT', { infer: true }));
}

void bootstrap();
