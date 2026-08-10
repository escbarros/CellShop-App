import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { useLocation } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import type { Mock } from 'vitest';
import type { CheckoutPayload, Order } from '../api/contract';
import { CHECKOUT_RECIPIENT } from '../api/recipient';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { envelope, stubApi } from '../tests/api-mock';
import type { ApiErrorBody, StubbedRoute } from '../tests/api-mock';
import { makeVariant } from '../tests/catalog-fixtures';
import { renderWithProviders } from '../tests/render';
import { CheckoutSummary } from './CheckoutSummary';

const BLOOM = 'CAP-BLOOM-IP16-AIS-TRA';
const SAFARI = 'CAP-SAFARI-S24-AIS-TRA';

const CONFIRMED_ORDER: Order = {
  number: 'CCS-2026-000417',
  status: 'CONFIRMED',
  items: [
    {
      sku: BLOOM,
      name: 'Bloom · iPhone 16',
      quantity: 1,
      unitPriceCents: 7990,
      subtotalCents: 7990,
    },
  ],
  subtotalCents: 7990,
  shippingCents: 1990,
  discountCents: 0,
  totalCents: 9980,
  createdAt: '2026-08-09T12:00:03.104Z',
};

type FetchMock = Mock<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>;

function catalogRoutes(availableQty = 12): StubbedRoute[] {
  return [
    {
      path: '/products',
      data: [
        makeVariant({ availableQty }),
        makeVariant({
          sku: SAFARI,
          name: 'Safari · Galaxy S24',
          priceCents: 8990,
          formattedPrice: 'R$ 89,90',
          availableQty,
        }),
      ],
    },
  ];
}

function stubCatalog(availableQty = 12) {
  return stubApi(catalogRoutes(availableQty));
}

function stubCheckout(outcome: { status?: number; data?: Order; error?: ApiErrorBody }) {
  return stubApi([...catalogRoutes(), { path: '/checkout', method: 'POST', ...outcome }]);
}

function jsonResponse(status: number, body: unknown): Promise<Response> {
  return Promise.resolve(
    new Response(JSON.stringify(body), {
      status,
      headers: { 'Content-Type': 'application/json' },
    }),
  );
}

function stubCheckoutWith(
  respond: (attempt: number) => Promise<Response>,
  availableQty = 12,
): FetchMock {
  let attempts = 0;

  const fetchMock: FetchMock = vi.fn((_input: RequestInfo | URL, init?: RequestInit) => {
    if ((init?.method ?? 'GET').toUpperCase() !== 'POST') {
      return jsonResponse(200, envelope(catalogRoutes(availableQty)[0].data));
    }

    attempts += 1;

    return respond(attempts);
  });

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

function checkoutCalls(fetchMock: FetchMock) {
  return fetchMock.mock.calls.filter(
    ([, init]) => (init?.method ?? 'GET').toUpperCase() === 'POST',
  );
}

function sentPayload(fetchMock: FetchMock, index = 0): CheckoutPayload {
  return JSON.parse(checkoutCalls(fetchMock)[index][1]?.body as string) as CheckoutPayload;
}

function sentKey(fetchMock: FetchMock, index = 0): string | null {
  return new Headers(checkoutCalls(fetchMock)[index][1]?.headers).get('Idempotency-Key');
}

function amountFor(label: string | RegExp): string {
  const term = screen.getByText(label);
  const amount = term.parentElement?.querySelector('dd')?.textContent ?? '';

  return amount.replace(/\s/g, ' ');
}

function stubPendingRequest() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => undefined)),
  );
}

function stubFailureThenCatalog() {
  const fetchMock = vi
    .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
    .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
    .mockImplementation(() => jsonResponse(200, envelope([makeVariant()])));

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

function LocationProbe() {
  const location = useLocation();

  return <p>rota atual: {location.pathname}</p>;
}

function renderCheckout() {
  return renderWithProviders(
    <>
      <CheckoutSummary />
      <LocationProbe />
    </>,
    { route: '/checkout' },
  );
}

async function finishPurchase() {
  await userEvent.click(await screen.findByRole('button', { name: 'Finalizar compra' }));
}

function findOrderPageRoute() {
  return screen.findByText('rota atual: /orders/CCS-2026-000417');
}

describe('CheckoutSummary', () => {
  it('explains there is nothing to finish when the cart is empty', () => {
    stubCatalog();

    renderWithProviders(<CheckoutSummary />);

    expect(screen.getByRole('alert')).toHaveTextContent(/seu carrinho está vazio/i);
    expect(screen.getByRole('link', { name: 'Ver a vitrine' })).toHaveAttribute('href', '/');
  });

  it('shows a placeholder while the catalog is on its way', () => {
    stubPendingRequest();
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument();
  });

  it('shows an error message and a working retry button', async () => {
    stubFailureThenCatalog();
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /não conseguimos falar com o servidor/i,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Bloom · iPhone 16')).toBeInTheDocument();
  });

  it('lists one line per sku in the cart', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    useCartStore.getState().add(SAFARI);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findAllByRole('listitem')).toHaveLength(2);
    expect(screen.getByText('Bloom · iPhone 16')).toBeInTheDocument();
    expect(screen.getByText('Safari · Galaxy S24')).toBeInTheDocument();
  });

  it('multiplies the unit price by the quantity on every line', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    useCartStore.getState().add(SAFARI);

    renderWithProviders(<CheckoutSummary />);

    const [firstLine] = await screen.findAllByRole('listitem');
    const bloom = within(firstLine);

    expect(bloom.getByText('Bloom · iPhone 16')).toBeInTheDocument();
    expect(bloom.getByText('R$ 159,80')).toBeInTheDocument();
    expect(bloom.getByText(/2 unidades · R\$ 79,90 cada/)).toBeInTheDocument();
  });

  it('adds every line up into the subtotal', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    useCartStore.getState().add(SAFARI);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByText('Subtotal · 3 unidades')).toBeInTheDocument();
    expect(amountFor('Subtotal · 3 unidades')).toBe('R$ 249,70');
  });

  it('charges flat shipping and carries it into the total', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    await screen.findByText('Bloom · iPhone 16');

    expect(amountFor('Subtotal · 1 unidade')).toBe('R$ 79,90');
    expect(amountFor('Frete')).toBe('R$ 19,90');
    expect(amountFor('Total')).toBe('R$ 99,80');
  });

  it('ships for free once the subtotal reaches the free shipping threshold', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    useCartStore.getState().add(SAFARI);

    renderWithProviders(<CheckoutSummary />);

    await screen.findByText('Bloom · iPhone 16');

    expect(amountFor('Frete')).toBe('Grátis');
    expect(amountFor('Total')).toBe('R$ 249,70');
  });

  it('names who receives the order and where it goes', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByText('Eduardo Scaburi Costa Barros')).toBeInTheDocument();
    expect(screen.getByText(/Rua Jaguariaiva, 243/)).toBeInTheDocument();
    expect(screen.getByText(/Pinhais/)).toBeInTheDocument();
    expect(screen.getByText(/83327-076/)).toBeInTheDocument();
  });

  it('points the buyer at the line to fix before it lets the order through', async () => {
    stubCatalog(2);
    useCartStore.getState().add(BLOOM, 5);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByText(/revise os itens marcados/i)).toBeInTheDocument();
  });

  it('stays quiet about fixing lines while the order is sound', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    await screen.findByText('Bloom · iPhone 16');

    expect(screen.queryByText(/revise os itens marcados/i)).not.toBeInTheDocument();
  });

  it('keeps the finish button unavailable while a line is short of stock', async () => {
    stubCatalog(2);
    useCartStore.getState().add(BLOOM, 5);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByRole('button', { name: 'Finalizar compra' })).toBeDisabled();
  });

  it('warns when a line asks for more units than the stock has', async () => {
    stubCatalog(2);
    useCartStore.getState().add(BLOOM, 5);

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByText(/restam apenas 2 em estoque/i)).toBeInTheDocument();
  });

  it('stays quiet about stock while every line fits', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);

    renderWithProviders(<CheckoutSummary />);

    await screen.findByText('Bloom · iPhone 16');

    expect(screen.queryByText(/restam apenas/i)).not.toBeInTheDocument();
  });

  it('flags a line whose sku left the catalog', async () => {
    stubApi([{ path: '/products', data: [] }]);
    useCartStore.getState().add('CAP-SUMIU-IP16-AIS-TRA');

    renderWithProviders(<CheckoutSummary />);

    expect(await screen.findByText(/saiu do catálogo/i)).toBeInTheDocument();
  });

  it('opens the cart drawer to edit the order', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    await userEvent.click(await screen.findByRole('button', { name: 'Editar carrinho' }));

    expect(useCartDrawerStore.getState().status).toBe('open');
  });

  it('sends the cart lines and the fixed recipient when the buyer finishes the purchase', async () => {
    const fetchMock = stubCheckoutWith(() => jsonResponse(201, envelope(CONFIRMED_ORDER)));
    useCartStore.getState().add(BLOOM, 2);

    renderCheckout();
    await finishPurchase();

    await findOrderPageRoute();

    expect(sentPayload(fetchMock)).toEqual({
      items: [{ sku: BLOOM, quantity: 2 }],
      recipient: CHECKOUT_RECIPIENT,
    });
  });

  it('sends an idempotency key on every attempt', async () => {
    const fetchMock = stubCheckoutWith(() => jsonResponse(201, envelope(CONFIRMED_ORDER)));
    useCartStore.getState().add(BLOOM);

    renderCheckout();
    await finishPurchase();

    await findOrderPageRoute();

    expect(sentKey(fetchMock)).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
    );
  });

  it('sends the same key on a retry after a network failure', async () => {
    const fetchMock = stubCheckoutWith((attempt) =>
      attempt === 1
        ? Promise.reject(new TypeError('Failed to fetch'))
        : jsonResponse(201, envelope(CONFIRMED_ORDER)),
    );
    useCartStore.getState().add(BLOOM);

    renderCheckout();
    await finishPurchase();

    await screen.findByRole('alert');
    await finishPurchase();

    await findOrderPageRoute();

    expect(checkoutCalls(fetchMock)).toHaveLength(2);
    expect(sentKey(fetchMock, 1)).toBe(sentKey(fetchMock, 0));
  });

  it('triggers a single request for five rapid clicks', async () => {
    const fetchMock = stubCheckoutWith(() => new Promise<Response>(() => undefined));
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);

    const button = await screen.findByRole('button', { name: 'Finalizar compra' });

    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);
    await userEvent.click(button);

    expect(checkoutCalls(fetchMock)).toHaveLength(1);
  });

  it('announces the purchase in progress while the request is pending', async () => {
    stubCheckoutWith(() => new Promise<Response>(() => undefined));
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);
    await finishPurchase();

    expect(await screen.findByRole('button', { name: 'Finalizando compra...' })).toBeDisabled();
  });

  it('sends the buyer to the order page and empties the cart when the purchase goes through', async () => {
    stubCheckout({ status: 201, data: CONFIRMED_ORDER });
    useCartStore.getState().add(BLOOM);

    renderCheckout();
    await finishPurchase();

    expect(await findOrderPageRoute()).toBeInTheDocument();
    expect(useCartStore.getState().items).toHaveLength(0);
  });

  it('keeps the buyer on the summary and lets them try again when the stock runs out', async () => {
    stubCheckout({
      status: 409,
      error: { code: 'INSUFFICIENT_STOCK', message: 'Não temos essa quantidade em estoque.' },
    });
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);
    await finishPurchase();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não temos essa quantidade em estoque.',
    );
    expect(screen.getByRole('button', { name: 'Finalizar compra' })).toBeEnabled();
  });

  it('spells out what the api rejected instead of only the generic message', async () => {
    stubCheckout({
      status: 422,
      error: {
        code: 'VALIDATION_FAILED',
        message: 'Confira os dados informados e tente de novo.',
        details: [
          {
            field: 'items',
            message: 'Cada capinha pode aparecer uma vez só. Some as unidades no mesmo item.',
          },
        ],
      },
    });
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);
    await finishPurchase();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Cada capinha pode aparecer uma vez só. Some as unidades no mesmo item.',
    );
  });

  it('names the capinha that ran short when the stock conflicts', async () => {
    stubCheckout({
      status: 409,
      error: {
        code: 'INSUFFICIENT_STOCK',
        message: 'Não temos essa quantidade em estoque.',
        details: [
          {
            field: 'items.0.quantity',
            message: 'Restam apenas 2 unidades de Bloom · iPhone 16.',
          },
        ],
      },
    });
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);
    await finishPurchase();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Restam apenas 2 unidades de Bloom · iPhone 16.',
    );
  });

  it('never shows an http status when the purchase fails', async () => {
    stubCheckout({
      status: 503,
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Serviço temporariamente indisponível. Tente de novo em instantes.',
      },
    });
    useCartStore.getState().add(BLOOM);

    renderWithProviders(<CheckoutSummary />);
    await finishPurchase();

    expect(await screen.findByRole('alert')).not.toHaveTextContent(/503/);
  });
});
