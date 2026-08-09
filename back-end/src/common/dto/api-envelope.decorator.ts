import { Type, applyDecorators } from '@nestjs/common';
import { ApiExtraModels, ApiResponse, getSchemaPath } from '@nestjs/swagger';
import { ErrorResponse } from './error.response';
import { SuccessResponse } from './success.response';

type EnvelopeOptions = {
  status: number;
  description: string;
  type: Type<unknown>;
  isArray?: boolean;
};

type EnvelopeErrorOptions = {
  status: number;
  description: string;
};

export function ApiEnvelope(options: EnvelopeOptions): MethodDecorator {
  const payload = options.isArray
    ? { type: 'array', items: { $ref: getSchemaPath(options.type) } }
    : { $ref: getSchemaPath(options.type) };

  return applyDecorators(
    ApiExtraModels(SuccessResponse, options.type),
    ApiResponse({
      status: options.status,
      description: options.description,
      schema: {
        allOf: [{ $ref: getSchemaPath(SuccessResponse) }, { properties: { data: payload } }],
      },
    }),
  );
}

export function ApiEnvelopeError(options: EnvelopeErrorOptions): MethodDecorator {
  return applyDecorators(
    ApiExtraModels(ErrorResponse),
    ApiResponse({
      status: options.status,
      description: options.description,
      type: ErrorResponse,
    }),
  );
}
