import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { useCartStore } from './store/cart-store';
import { stubApi } from './tests/api-mock';
import { makeVariant } from './tests/catalog-fixtures';
import { renderWithProviders } from './tests/render';

const SKU = 'CAP-BLOOM-IP16-AIS-TRA';

function stubCatalogAndDetail() {
  return stubApi([
    { path: '/products', data: [makeVariant()] },
    { path: `/products/${SKU}`, data: makeVariant() },
  ]);
}

describe('App', () => {
  it('opens on the storefront, under a fixed bar carrying the store name', async () => {
    stubApi([{ path: '/products', data: [makeVariant()] }]);

    renderWithProviders(<App />);

    expect(screen.getByRole('banner')).toHaveTextContent('CellShop');
    expect(
      screen.getByRole('heading', { level: 1, name: 'Capinhas de celular' }),
    ).toBeInTheDocument();
    expect(await screen.findByText('Bloom · iPhone 16')).toBeInTheDocument();
  });

  it('walks from a storefront card to the page of that capinha', async () => {
    stubCatalogAndDetail();

    renderWithProviders(<App />);

    await userEvent.click(await screen.findByRole('link', { name: 'Bloom · iPhone 16' }));

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bloom · iPhone 16' }),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /adicionar no carrinho/i })).toBeInTheDocument();
  });

  it('opens the product page straight from its url', async () => {
    stubCatalogAndDetail();

    renderWithProviders(<App />, { route: `/produtos/${SKU}` });

    expect(
      await screen.findByRole('heading', { level: 1, name: 'Bloom · iPhone 16' }),
    ).toBeInTheDocument();
  });

  it('shows in the cart what was added from the storefront', async () => {
    stubCatalogAndDetail();

    renderWithProviders(<App />);

    await userEvent.click(await screen.findByRole('button', { name: /adicionar bloom/i }));
    await userEvent.click(
      screen.getByRole('button', { name: 'Carrinho de compras com 1 unidade' }),
    );

    const cart = screen.getByRole('dialog');

    expect(cart).toHaveTextContent('Bloom · iPhone 16');
    expect(cart).toHaveTextContent('Subtotal · 1 unidade');
    expect(useCartStore.getState().items).toEqual([{ sku: SKU, quantity: 1 }]);
  });
});
