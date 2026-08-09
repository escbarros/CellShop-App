import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { readPackageVersion } from '../common/package-info';
import { API_TAGS } from '../common/swagger';

export type HealthStatus = {
  status: 'ok';
  version: string;
  uptime: number;
};

@ApiTags(API_TAGS.health)
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
