import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Controller, Get } from '@nestjs/common';

export type HealthStatus = {
  status: 'ok';
  version: string;
  uptime: number;
};

function readPackageVersion(): string {
  const raw = readFileSync(join(__dirname, '..', '..', 'package.json'), 'utf8');

  return (JSON.parse(raw) as { version: string }).version;
}

@Controller('health')
export class HealthController {
  private readonly version = readPackageVersion();

  @Get()
  check(): HealthStatus {
    return {
      status: 'ok',
      version: this.version,
      uptime: Math.round(process.uptime()),
    };
  }
}
