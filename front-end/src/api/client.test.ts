import { afterEach, describe, expect, it, vi } from 'vitest';
import { envelope, stubNetworkFailure } from '../tests/api-mock';
import { REQUEST_TIMEOUT_MS, listProducts, submitCheckout } from './client';
import type { CheckoutPayload, Order, Variant } from './contract';

const variant: Variant = {
  sku: 'CAP-BLOOM-IP16-AIS-TRA',
  name: 'Bloom · iPhone 16',
  description: 'Flores em aquarela sobre fundo claro.',
  priceCents: 7990,
  formattedPrice: 'R$ 79,90',
  availableQty: 3,
  available: true,
  imageUrl: 'http://localhost:3333/images/cap-bloom-ip16-ais-tra.jpg',
  thumbUrl: 'http://localhost:3333/images/cap-bloom-ip16-ais-tra-thumb.jpg',
};

const order: Order = {
  number: 'CCS-2026-000417',
  status: 'CONFIRMED',
  items: [
    {
      sku: 'CAP-BLOOM-IP16-AIS-TRA',
      name: 'Bloom · iPhone 16',
      quantity: 2,
      unitPriceCents: 7990,
      subtotalCents: 15980,
    },
  ],
  subtotalCents: 15980,
  shippingCents: 1990,
  discountCents: 0,
  totalCents: 17970,
  createdAt: '2026-08-09T12:00:03.104Z',
};

const checkoutPayload: CheckoutPayload = {
  items: [{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 2 }],
  recipient: {
    name: 'Ana Beatriz Nogueira',
    taxId: '39053344705',
    email: 'ana.nogueira@example.com',
    zipCode: '01310930',
    street: 'Avenida Paulista',
    number: '1578',
    district: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  },
};

const IDEMPOTENCY_KEY = 'b3f1c0de-0000-4000-8000-000000000001';

const META = { requestId: 'req_test', timestamp: '2026-01-01T00:00:00.000Z' };

function stubJson(status: number, body: unknown) {
  const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
    Promise.resolve(
      new Response(JSON.stringify(body), {
        status,
        headers: { 'Content-Type': 'application/json' },
      }),
    ),
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

function stubText(status: number, body: string) {
  const fetchMock = vi.fn((_input: RequestInfo | URL, _init?: RequestInit) =>
    Promise.resolve(new Response(body, { status, headers: { 'Content-Type': 'text/html' } })),
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

function stubHangingFetch() {
  const fetchMock = vi.fn(
    (_input: RequestInfo | URL, init?: RequestInit) =>
      new Promise<Response>((_resolve, reject) => {
        init?.signal?.addEventListener('abort', () => {
          reject(new DOMException('The operation was aborted.', 'AbortError'));
        });
      }),
  );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

afterEach(() => {
  vi.useRealTimers();
});

describe('listProducts', () => {
  it('returns the catalog as a success result carrying the response meta', async () => {
    stubJson(200, envelope([variant]));

    const result = await listProducts();

    expect(result).toEqual({ kind: 'success', data: [variant], meta: META });
  });

  it('asks the api url configured for the environment', async () => {
    const fetchMock = stubJson(200, envelope([variant]));

    await listProducts();

    expect(fetchMock.mock.calls[0][0]).toBe('http://localhost:3333/products');
  });

  it('maps a rejected fetch to a network result', async () => {
    stubNetworkFailure();

    const result = await listProducts();

    expect(result.kind).toBe('network');
  });

  it('maps a timeout to a network result', async () => {
    vi.useFakeTimers();
    stubHangingFetch();

    const pending = listProducts();
    await vi.advanceTimersByTimeAsync(REQUEST_TIMEOUT_MS);

    await expect(pending).resolves.toMatchObject({ kind: 'network' });
  });

  it('never claims a purchase failed when the network is the one that failed', async () => {
    stubNetworkFailure();

    const result = await listProducts();

    expect(result.kind === 'network' && result.message).not.toMatch(/compra/i);
  });

  it('maps 500 to an unknown result', async () => {
    stubJson(
      500,
      envelope(null, {
        code: 'INTERNAL_ERROR',
        message: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
      }),
    );

    const result = await listProducts();

    expect(result).toEqual({
      kind: 'unknown',
      message: 'Algo deu errado do nosso lado. Tente de novo em instantes.',
    });
  });

  it('maps a body that is not json to an unknown result', async () => {
    stubText(502, '<html>bad gateway</html>');

    const result = await listProducts();

    expect(result.kind).toBe('unknown');
  });
});

describe('submitCheckout', () => {
  it('sends the idempotency key as a header', async () => {
    const fetchMock = stubJson(201, envelope(order));

    await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    const headers = new Headers(fetchMock.mock.calls[0][1]?.headers);
    expect(headers.get('Idempotency-Key')).toBe(IDEMPOTENCY_KEY);
  });

  it('treats 200 and 201 alike on checkout', async () => {
    stubJson(201, envelope(order));
    const created = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    stubJson(200, envelope(order));
    const repeated = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(created).toEqual({ kind: 'success', data: order, meta: META });
    expect(repeated).toEqual(created);
  });

  it('maps 422 to a validation result keeping the field list', async () => {
    const details = [
      { field: 'recipient.taxId', message: 'Informe um CPF válido.' },
      { field: 'items.0.quantity', message: 'Informe ao menos uma unidade.' },
    ];

    stubJson(
      422,
      envelope(null, {
        code: 'VALIDATION_FAILED',
        message: 'Confira os dados informados e tente de novo.',
        details,
      }),
    );

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result).toEqual({
      kind: 'validation',
      message: 'Confira os dados informados e tente de novo.',
      details,
    });
  });

  it('maps 409 to a conflict result with sku and available quantity', async () => {
    const details = [
      {
        field: 'items.0.quantity',
        message: 'Restam 3 unidades.',
        sku: 'CAP-BLOOM-IP16-AIS-TRA',
        available: 3,
      },
    ];

    stubJson(409, {
      data: null,
      error: {
        code: 'INSUFFICIENT_STOCK',
        message: 'Não temos essa quantidade em estoque.',
        details,
      },
      meta: META,
    });

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result).toEqual({
      kind: 'conflict',
      message: 'Não temos essa quantidade em estoque.',
      shortage: { sku: 'CAP-BLOOM-IP16-AIS-TRA', available: 3 },
      details,
    });
  });

  it('keeps the shortage sentence the api wrote for the buyer', async () => {
    stubJson(
      409,
      envelope(null, {
        code: 'INSUFFICIENT_STOCK',
        message: 'Não temos essa quantidade em estoque.',
        details: [{ field: 'items.0.quantity', message: 'Restam apenas 2 unidades de Bloom.' }],
      }),
    );

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result.kind === 'conflict' && result.details[0].message).toBe(
      'Restam apenas 2 unidades de Bloom.',
    );
  });

  it('maps 409 without a usable detail to a conflict result with no shortage', async () => {
    stubJson(
      409,
      envelope(null, {
        code: 'INSUFFICIENT_STOCK',
        message: 'Não temos essa quantidade em estoque.',
      }),
    );

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result).toEqual({
      kind: 'conflict',
      message: 'Não temos essa quantidade em estoque.',
      shortage: null,
      details: [],
    });
  });

  it('maps 404 to a not found result', async () => {
    stubJson(
      404,
      envelope(null, { code: 'SKU_NOT_FOUND', message: 'Não encontramos esse produto.' }),
    );

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result).toEqual({ kind: 'notFound', message: 'Não encontramos esse produto.' });
  });

  it('maps 503 to an unavailable result', async () => {
    stubJson(
      503,
      envelope(null, {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Serviço temporariamente indisponível. Tente de novo em instantes.',
      }),
    );

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result).toEqual({
      kind: 'unavailable',
      message: 'Serviço temporariamente indisponível. Tente de novo em instantes.',
    });
  });

  it('maps a rejected fetch to a network result without deciding whether the order went through', async () => {
    stubNetworkFailure();

    const result = await submitCheckout(checkoutPayload, IDEMPOTENCY_KEY);

    expect(result.kind).toBe('network');
  });
});
