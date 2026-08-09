import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { envelope, stubApi } from '../tests/api-mock';
import { makeVariant } from '../tests/catalog-fixtures';
import { renderWithProviders } from '../tests/render';
import { ProductDetail } from './ProductDetail';

const SKU = 'CAP-BLOOM-IP16-AIS-TRA';

function stubPendingRequest() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => undefined)),
  );
}

function stubFailureThenProduct() {
  const fetchMock = vi
    .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
    .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
    .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
    .mockImplementation(() =>
      Promise.resolve(
        new Response(JSON.stringify(envelope(makeVariant())), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }),
      ),
    );

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

describe('ProductDetail', () => {
  it('shows a loading placeholder while fetching the variant', () => {
    stubPendingRequest();

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument();
  });

  it('asks the api for the sku it was given', async () => {
    const fetchMock = stubApi([{ path: `/products/${SKU}`, data: makeVariant() }]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
    expect(fetchMock.mock.calls[0][0]).toBe(`http://localhost:3333/products/${SKU}`);
  });

  it('renders the name, the description and the price formatted by the api', async () => {
    stubApi([
      {
        path: `/products/${SKU}`,
        data: makeVariant({ priceCents: 7990, formattedPrice: 'R$ 79,90' }),
      },
    ]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bloom · iPhone 16' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Flores em aquarela sobre fundo claro.')).toBeInTheDocument();
    expect(screen.getByText('R$ 79,90')).toBeInTheDocument();
    expect(screen.queryByText('7990')).not.toBeInTheDocument();
  });

  it('explains that the sku is gone instead of showing a generic failure', async () => {
    stubApi([
      {
        path: `/products/${SKU}`,
        status: 404,
        error: { code: 'SKU_NOT_FOUND', message: 'Não encontramos esse produto.' },
      },
    ]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(await screen.findByText(/não encontramos essa capinha/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /voltar para a vitrine/i })).toBeInTheDocument();
  });

  it('shows an error message and a working retry button', async () => {
    stubFailureThenProduct();

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /não conseguimos falar com o servidor/i,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByRole('heading', { level: 1 })).toBeInTheDocument();
  });

  it('adds the chosen quantity to the cart and opens the drawer', async () => {
    stubApi([{ path: `/products/${SKU}`, data: makeVariant({ availableQty: 12 }) }]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Aumentar quantidade' }));
    await userEvent.click(screen.getByRole('button', { name: /adicionar no carrinho/i }));

    expect(useCartStore.getState().items).toEqual([{ sku: SKU, quantity: 2 }]);
    expect(useCartDrawerStore.getState().status).toBe('open');
  });

  it('never lets the quantity go below one unit', async () => {
    stubApi([{ path: `/products/${SKU}`, data: makeVariant({ availableQty: 12 }) }]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    await userEvent.click(await screen.findByRole('button', { name: 'Diminuir quantidade' }));
    await userEvent.click(screen.getByRole('button', { name: /adicionar no carrinho/i }));

    expect(useCartStore.getState().items).toEqual([{ sku: SKU, quantity: 1 }]);
  });

  it('stops the quantity at the units left in stock', async () => {
    stubApi([{ path: `/products/${SKU}`, data: makeVariant({ availableQty: 2 }) }]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    const increase = await screen.findByRole('button', { name: 'Aumentar quantidade' });
    await userEvent.click(increase);

    expect(increase).toBeDisabled();
  });

  it('shuts the add button once the variant is in the cart', async () => {
    stubApi([{ path: `/products/${SKU}`, data: makeVariant({ availableQty: 12 }) }]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    await userEvent.click(await screen.findByRole('button', { name: /adicionar no carrinho/i }));

    expect(screen.getByRole('button', { name: 'Já está no carrinho' })).toBeDisabled();
    expect(useCartStore.getState().items).toEqual([{ sku: SKU, quantity: 1 }]);
  });

  it('sends the shopper to the cart to change a quantity already chosen', async () => {
    useCartStore.setState({ items: [{ sku: SKU, quantity: 3 }] });
    stubApi([{ path: `/products/${SKU}`, data: makeVariant({ availableQty: 12 }) }]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(await screen.findByText(/3 unidades no carrinho/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Aumentar quantidade' })).not.toBeInTheDocument();
  });

  it('offers no way to add a sold-out variant to the cart', async () => {
    stubApi([
      { path: `/products/${SKU}`, data: makeVariant({ availableQty: 0, available: false }) },
    ]);

    renderWithProviders(<ProductDetail sku={SKU} />);

    expect(await screen.findByRole('button', { name: 'Esgotado' })).toBeDisabled();
    expect(screen.queryByRole('button', { name: 'Aumentar quantidade' })).not.toBeInTheDocument();
  });
});
