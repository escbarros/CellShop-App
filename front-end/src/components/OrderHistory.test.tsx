import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { OrderSummary } from '../api/contract';
import { envelope, stubApi } from '../tests/api-mock';
import { renderWithProviders } from '../tests/render';
import { OrderHistory } from './OrderHistory';

const PLACED: OrderSummary[] = [
  {
    number: 'CCS-2026-000002',
    status: 'CONFIRMED',
    itemCount: 3,
    totalCents: 23970,
    createdAt: '2026-08-09T12:10:00.000Z',
  },
  {
    number: 'CCS-2026-000001',
    status: 'CANCELLED',
    itemCount: 1,
    totalCents: 9980,
    createdAt: '2026-08-08T12:00:00.000Z',
  },
];

function stubOrders(orders: OrderSummary[] = PLACED) {
  return stubApi([{ path: '/orders', data: orders }]);
}

function renderHistory() {
  return renderWithProviders(<OrderHistory />, { route: '/orders' });
}

describe('OrderHistory', () => {
  it('shows a placeholder while the orders are on their way', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => undefined)),
    );

    renderHistory();

    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument();
  });

  it('lists one entry per order placed', async () => {
    stubOrders();

    renderHistory();

    expect(await screen.findAllByRole('listitem')).toHaveLength(2);
  });

  it('shows the number, the status, the date, the units and the total of an order', async () => {
    stubOrders();

    renderHistory();

    const [newest] = await screen.findAllByRole('listitem');
    const order = within(newest);

    expect(order.getByText('CCS-2026-000002')).toBeInTheDocument();
    expect(order.getByText('Confirmado')).toBeInTheDocument();
    expect(order.getByText(/09\/08\/2026/)).toBeInTheDocument();
    expect(order.getByText(/3 unidades/)).toBeInTheDocument();
    expect(order.getByText('R$ 239,70')).toBeInTheDocument();
  });

  it('tells a cancelled order apart from a confirmed one', async () => {
    stubOrders();

    renderHistory();

    const [, oldest] = await screen.findAllByRole('listitem');

    expect(within(oldest).getByText('Cancelado')).toBeInTheDocument();
  });

  it('opens the order when its entry is followed', async () => {
    stubOrders();

    renderHistory();

    expect(await screen.findByRole('link', { name: /CCS-2026-000002/ })).toHaveAttribute(
      'href',
      '/orders/CCS-2026-000002',
    );
  });

  it('explains there is nothing to show before the first purchase', async () => {
    stubOrders([]);

    renderHistory();

    expect(await screen.findByRole('alert')).toHaveTextContent(/nenhum pedido/i);
    expect(screen.getByRole('link', { name: 'Ver a vitrine' })).toHaveAttribute('href', '/');
  });

  it('offers a retry when the orders cannot be loaded', async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(envelope(PLACED)), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    renderHistory();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /não conseguimos falar com o servidor/i,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('CCS-2026-000002')).toBeInTheDocument();
  });
});
