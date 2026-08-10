import type { ResponseMeta, StockShortage, ValidationDetail } from './contract';
import { readDetails, readEnvelope, readMessage, readShortage } from './envelope';

export type ApiResult<T> =
  | { kind: 'success'; data: T; meta: ResponseMeta }
  | { kind: 'validation'; message: string; details: ValidationDetail[] }
  | {
      kind: 'conflict';
      message: string;
      shortage: StockShortage | null;
      details: ValidationDetail[];
    }
  | { kind: 'notFound'; message: string }
  | { kind: 'unavailable'; message: string }
  | { kind: 'network'; message: string }
  | { kind: 'unknown'; message: string };

export type ApiFailureKind = Exclude<ApiResult<unknown>['kind'], 'success'>;

export class ApiFailure extends Error {
  readonly kind: ApiFailureKind;

  constructor(kind: ApiFailureKind, message: string) {
    super(message);
    this.name = 'ApiFailure';
    this.kind = kind;
  }
}

const NETWORK_MESSAGE = 'Não conseguimos falar com o servidor.';
export const UNKNOWN_MESSAGE = 'Algo deu errado do nosso lado. Tente de novo em instantes.';

export function networkFailure<T>(): ApiResult<T> {
  return { kind: 'network', message: NETWORK_MESSAGE };
}

export async function interpret<T>(response: Response): Promise<ApiResult<T>> {
  const body = await readEnvelope(response);

  if (body === null) {
    return { kind: 'unknown', message: UNKNOWN_MESSAGE };
  }

  if (response.ok) {
    return { kind: 'success', data: body.data as T, meta: body.meta };
  }

  const message = readMessage(body) ?? UNKNOWN_MESSAGE;

  switch (response.status) {
    case 404:
      return { kind: 'notFound', message };
    case 409:
      return {
        kind: 'conflict',
        message,
        shortage: readShortage(body),
        details: readDetails(body),
      };
    case 422:
      return { kind: 'validation', message, details: readDetails(body) };
    case 503:
      return { kind: 'unavailable', message };
    default:
      return { kind: 'unknown', message };
  }
}
