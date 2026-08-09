import { ValidationError, ValidationPipe } from '@nestjs/common';
import { ValidationFailedError } from '../errors/domain.errors';
import { ApiErrorDetail } from '../http/api-response';

const NESTED_VALIDATION = 'nestedValidation';

const MESSAGE_BY_GENERATED_CONSTRAINT: Record<string, string> = {
  whitelistValidation: 'Campo não reconhecido.',
  nestedValidation: 'Formato inválido.',
};

function pathOf(error: ValidationError, parentPath: string): string {
  return parentPath ? `${parentPath}.${error.property}` : error.property;
}

function detailsOf(error: ValidationError, parentPath: string): ApiErrorDetail[] {
  const field = pathOf(error, parentPath);
  const children = (error.children ?? []).flatMap((child) => detailsOf(child, field));
  const constraints = Object.entries(error.constraints ?? {}).reverse();
  const isExplainedElsewhere = constraints.length > 1 || children.length > 0;
  const own = isExplainedElsewhere
    ? constraints.filter(([constraint]) => constraint !== NESTED_VALIDATION)
    : constraints;

  return [
    ...own.map(([constraint, message]) => ({
      field,
      message: MESSAGE_BY_GENERATED_CONSTRAINT[constraint] ?? message,
    })),
    ...children,
  ];
}

export function toValidationDetails(errors: ValidationError[]): ApiErrorDetail[] {
  return errors.flatMap((error) => detailsOf(error, ''));
}

export function createValidationPipe(): ValidationPipe {
  return new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: true,
    transform: true,
    exceptionFactory: (errors: ValidationError[]) =>
      new ValidationFailedError(toValidationDetails(errors)),
  });
}
