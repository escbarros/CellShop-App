import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { envelope, stubApi } from '../tests/api-mock';
import { makeVariant } from '../tests/catalog-fixtures';
import { renderWithProviders } from '../tests/render';
import { CheckoutSummary } from './CheckoutSummary';

const BLOOM = 'CAP-BLOOM-IP16-AIS-TRA';
const SAFARI = 'CAP-SAFARI-S24-AIS-TRA';

function stubCatalog(availableQty = 12) {
  return stubApi([
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
  ]);
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
    .mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(envelope([makeVariant()])), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
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

    expect(await screen.findByText('R$ 249,70')).toBeInTheDocument();
    expect(screen.getByText('Subtotal · 3 unidades')).toBeInTheDocument();
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

  it('keeps the finish button unavailable while there is no order route', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);

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
});
