import { vi, type Mock } from 'vitest';

export type ApiErrorBody = {
  code: string;
  message: string;
  details?: Array<{ field: string; message: string }>;
};

export type ApiEnvelope<T> = {
  data: T | null;
  error: ApiErrorBody | null;
  meta: { requestId: string; timestamp: string };
};

export type StubbedRoute = {
  path: string;
  method?: string;
  status?: number;
  data?: unknown;
  error?: ApiErrorBody;
};

export function envelope<T>(data: T | null, error: ApiErrorBody | null = null): ApiEnvelope<T> {
  return {
    data,
    error,
    meta: { requestId: 'req_test', timestamp: '2026-01-01T00:00:00.000Z' },
  };
}

function urlOf(input: RequestInfo | URL): string {
  if (typeof input === 'string') {
    return input;
  }

  return input instanceof URL ? input.href : input.url;
}

function pathnameOf(url: string): string {
  return new URL(url, 'http://localhost').pathname;
}

function methodOf(input: RequestInfo | URL, init?: RequestInit): string {
  if (init?.method) {
    return init.method.toUpperCase();
  }

  if (typeof input !== 'string' && !(input instanceof URL)) {
    return input.method.toUpperCase();
  }

  return 'GET';
}

function statusOf(route: StubbedRoute): number {
  if (route.status) {
    return route.status;
  }

  return route.error ? 400 : 200;
}

export function stubApi(routes: StubbedRoute[]): Mock {
  const fetchMock = vi.fn((input: RequestInfo | URL, init?: RequestInit) => {
    const url = urlOf(input);
    const method = methodOf(input, init);
    const pathname = pathnameOf(url);
    const route = routes.find(
      (candidate) =>
        pathnameOf(candidate.path) === pathname &&
        (candidate.method ?? 'GET').toUpperCase() === method,
    );

    if (!route) {
      return Promise.reject(new Error(`unstubbed network request to ${method} ${url}`));
    }

    const body = envelope(route.data ?? null, route.error ?? null);

    return Promise.resolve(
      new Response(JSON.stringify(body), {
        status: statusOf(route),
        headers: { 'Content-Type': 'application/json' },
      }),
    );
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

export function stubNetworkFailure(): Mock {
  const fetchMock = vi.fn(() => Promise.reject(new TypeError('Failed to fetch')));

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}
