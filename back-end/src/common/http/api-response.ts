export type ApiErrorDetail = {
  field: string;
  message: string;
  sku?: string;
  available?: number;
};

export type ApiError = {
  code: string;
  message: string;
  details?: ApiErrorDetail[];
};

export type ApiMeta = {
  requestId: string;
  timestamp: string;
} & Record<string, unknown>;

export type ApiResponse<T> = {
  data: T | null;
  error: ApiError | null;
  meta: ApiMeta;
};

export class ResponseWithMeta<T> {
  constructor(
    readonly data: T,
    readonly meta: Record<string, unknown>,
  ) {}
}

export function withMeta<T>(data: T, meta: Record<string, unknown>): ResponseWithMeta<T> {
  return new ResponseWithMeta(data, meta);
}

function buildMeta(requestId: string, extra: Record<string, unknown> = {}): ApiMeta {
  return { requestId, timestamp: new Date().toISOString(), ...extra };
}

export function buildSuccessResponse<T>(
  payload: T | ResponseWithMeta<T>,
  requestId: string,
): ApiResponse<T> {
  const isWrapped = payload instanceof ResponseWithMeta;

  return {
    data: isWrapped ? payload.data : (payload ?? null),
    error: null,
    meta: buildMeta(requestId, isWrapped ? payload.meta : undefined),
  };
}

export function buildErrorResponse(error: ApiError, requestId: string): ApiResponse<never> {
  return { data: null, error, meta: buildMeta(requestId) };
}
