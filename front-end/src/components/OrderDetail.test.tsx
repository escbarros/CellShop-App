import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { envelope, stubApi } from '../tests/api-mock';
import { makeOrderDetail } from '../tests/order-fixtures';
import { renderWithProviders } from '../tests/render';
import { OrderDetail } from './OrderDetail';

const NUMBER = 'CCS-2026-000417';

const PATH = `/orders/${NUMBER}`;

function stubOrder(order = makeOrderDetail()) {
  return stubApi([{ path: PATH, data: order }]);
}

function renderOrder(number = NUMBER) {
  return renderWithProviders(<OrderDetail number={number} />, { route: PATH });
}

describe('OrderDetail', () => {
  it('shows a placeholder while the order is on its way', () => {
    vi.stubGlobal(
      'fetch',
      vi.fn(() => new Promise<Response>(() => undefined)),
    );

    renderOrder();

    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument();
  });

  it('leads with the order number and the status in plain portuguese', async () => {
    stubOrder();

    renderOrder();

    expect(await screen.findByRole('heading', { name: `Pedido ${NUMBER}` })).toBeInTheDocument();
    expect(screen.getByText('Confirmado')).toBeInTheDocument();
  });

  it('reads the status back from the order instead of assuming it went through', async () => {
    stubOrder(makeOrderDetail({ status: 'CANCELLED' }));

    renderOrder();

    expect(await screen.findByText('Cancelado')).toBeInTheDocument();
    expect(screen.queryByText('Confirmado')).not.toBeInTheDocument();
  });

  it('lists every item with the price frozen at purchase time', async () => {
    stubOrder();

    renderOrder();

    const line = within((await screen.findAllByRole('listitem'))[0]);

    expect(line.getByText('Bloom · iPhone 16')).toBeInTheDocument();
    expect(line.getByText(/2 unidades · R\$ 79,90 cada/)).toBeInTheDocument();
    expect(line.getByText('R$ 159,80')).toBeInTheDocument();
  });

  it('shows the amounts the api recorded, not a recalculated total', async () => {
    stubOrder(
      makeOrderDetail({
        subtotalCents: 15980,
        shippingCents: 1990,
        totalCents: 17970,
      }),
    );

    renderOrder();

    await screen.findByText('Bloom · iPhone 16');

    expect(amountFor(/^Subtotal/)).toBe('R$ 159,80');
    expect(amountFor('Frete')).toBe('R$ 19,90');
    expect(amountFor('Total')).toBe('R$ 179,70');
  });

  it('calls the shipping free when the order paid nothing for it', async () => {
    stubOrder(makeOrderDetail({ shippingCents: 0, totalCents: 15980 }));

    renderOrder();

    await screen.findByText('Bloom · iPhone 16');

    expect(amountFor('Frete')).toBe('Grátis');
  });

  it('shows who receives the order with the tax id the api masked', async () => {
    stubOrder();

    renderOrder();

    expect(await screen.findByText('Eduardo Scaburi Costa Barros')).toBeInTheDocument();
    expect(screen.getByText(/\*\*\*\.038\.739-\*\*/)).toBeInTheDocument();
    expect(screen.getByText(/Rua Jaguariaiva, 243/)).toBeInTheDocument();
    expect(screen.getByText(/83327-076/)).toBeInTheDocument();
  });

  it('walks through every transition the order went through', async () => {
    stubOrder();

    renderOrder();

    expect(await screen.findByText('Pedido recebido pela API.')).toBeInTheDocument();
    expect(screen.getByText('Estoque reservado e pedido confirmado.')).toBeInTheDocument();
  });

  it('says the order does not exist instead of failing silently', async () => {
    stubApi([
      {
        path: PATH,
        status: 404,
        error: { code: 'ORDER_NOT_FOUND', message: 'Não encontramos esse pedido.' },
      },
    ]);

    renderOrder();

    expect(await screen.findByRole('alert')).toHaveTextContent(/não encontramos esse pedido/i);
  });

  it('offers a retry when the order cannot be loaded', async () => {
    const fetchMock = vi
      .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
      .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
      .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
      .mockImplementation(() =>
        Promise.resolve(
          new Response(JSON.stringify(envelope(makeOrderDetail())), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
          }),
        ),
      );

    vi.stubGlobal('fetch', fetchMock);

    renderOrder();

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /não conseguimos falar com o servidor/i,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { name: `Pedido ${NUMBER}` })).toBeInTheDocument();
  });
});

function amountFor(label: string | RegExp): string {
  const term = screen.getByText(label);
  const amount = term.parentElement?.querySelector('dd')?.textContent ?? '';

  return amount.replace(/\s/g, ' ');
}
