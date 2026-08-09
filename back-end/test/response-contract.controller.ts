import { Controller, Get, NotFoundException } from '@nestjs/common';
import { InsufficientStockError, ValidationFailedError } from '../src/common/errors/domain.errors';
import { withMeta } from '../src/common/http/api-response';

@Controller('contract-fixtures')
export class ResponseContractController {
  @Get('plain-payload')
  plainPayload(): { orderNumber: string } {
    return { orderNumber: 'PED-2026-000148' };
  }

  @Get('payload-with-meta')
  payloadWithMeta() {
    return withMeta({ orderNumber: 'PED-2026-000148' }, { statusUrl: '/checkout/PED-2026-000148' });
  }

  @Get('domain-error')
  domainError(): never {
    throw new InsufficientStockError();
  }

  @Get('validation-error')
  validationError(): never {
    throw new ValidationFailedError([
      { field: 'quantity', message: 'Informe ao menos uma unidade.' },
    ]);
  }

  @Get('nest-http-error')
  nestHttpError(): never {
    throw new NotFoundException('Cannot find the internal record 42');
  }

  @Get('raw-error')
  rawError(): never {
    throw new Error('connection to the secret database at 10.0.0.7 failed');
  }
}
