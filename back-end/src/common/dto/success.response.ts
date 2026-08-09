import { ApiProperty } from '@nestjs/swagger';
import { ResponseMeta } from './error.response';

export class SuccessResponse {
  @ApiProperty({
    description: 'Payload of the request. Its shape changes per route.',
    type: 'object',
    additionalProperties: true,
    nullable: true,
  })
  data!: unknown;

  @ApiProperty({
    description: 'Always null when the request succeeded.',
    type: 'object',
    additionalProperties: true,
    nullable: true,
    example: null,
  })
  error!: null;

  @ApiProperty({ description: 'Metadata attached to every response.', type: ResponseMeta })
  meta!: ResponseMeta;
}
