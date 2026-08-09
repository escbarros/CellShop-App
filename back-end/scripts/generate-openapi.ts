import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { createOpenApiDocument } from '../src/common/swagger';

const OUTPUT_PATH = join(__dirname, '..', '..', 'docs', 'openapi.json');
const CHECK_FLAG = '--check';
const REGENERATE_HINT = 'Run "npm run openapi" in back-end/ and commit docs/openapi.json.';

async function renderDocument(): Promise<string> {
  const app = await NestFactory.create(AppModule, {
    logger: false,
    bodyParser: false,
    abortOnError: false,
  });

  try {
    return `${JSON.stringify(createOpenApiDocument(app), null, 2)}\n`;
  } finally {
    await app.close();
  }
}

function write(document: string): void {
  writeFileSync(OUTPUT_PATH, document, 'utf8');
  process.stdout.write(`OpenAPI document written to ${OUTPUT_PATH}\n`);
}

function check(document: string): void {
  if (!existsSync(OUTPUT_PATH)) {
    process.stderr.write(`Missing ${OUTPUT_PATH}. ${REGENERATE_HINT}\n`);
    process.exitCode = 1;
    return;
  }

  if (readFileSync(OUTPUT_PATH, 'utf8').replace(/\r\n/g, '\n') !== document) {
    process.stderr.write(`${OUTPUT_PATH} is out of date. ${REGENERATE_HINT}\n`);
    process.exitCode = 1;
    return;
  }

  process.stdout.write('OpenAPI document is up to date.\n');
}

async function main(): Promise<void> {
  const document = await renderDocument();

  if (process.argv.includes(CHECK_FLAG)) {
    check(document);
    return;
  }

  write(document);
}

void main().catch((error: unknown) => {
  process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
  process.exitCode = 1;
});
