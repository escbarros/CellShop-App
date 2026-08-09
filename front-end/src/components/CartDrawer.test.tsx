import { act, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { CART_DRAWER_CLOSE_MS, useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { stubApi } from '../tests/api-mock';
import { makeVariant } from '../tests/catalog-fixtures';
import { renderWithProviders } from '../tests/render';
import { CartDrawer } from './CartDrawer';

const BLOOM = 'CAP-BLOOM-IP16-AIS-TRA';
const SAFARI = 'CAP-SAFARI-S24-AIS-TRA';

function stubCatalog() {
  return stubApi([
    {
      path: '/products',
      data: [
        makeVariant(),
        makeVariant({
          sku: SAFARI,
          name: 'Safari · Galaxy S24',
          priceCents: 8990,
          formattedPrice: 'R$ 89,90',
        }),
      ],
    },
  ]);
}

function openDrawer() {
  useCartDrawerStore.getState().open();
}

describe('CartDrawer', () => {
  it('stays out of the page while it is closed', () => {
    stubCatalog();

    renderWithProviders(<CartDrawer />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('says the cart is empty instead of showing a bare panel', () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(screen.getByRole('dialog')).toHaveTextContent(/seu carrinho está vazio/i);
  });

  it('shows the image, the name and the quantity of every line', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    useCartStore.getState().add(SAFARI);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(await screen.findByText('Bloom · iPhone 16')).toBeInTheDocument();
    expect(screen.getByText('Safari · Galaxy S24')).toBeInTheDocument();
    expect(screen.getAllByRole('img')).toHaveLength(2);
    expect(screen.getByRole('dialog')).toHaveTextContent('Subtotal · 3 unidades');
  });

  it('raises the quantity of a single line', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Aumentar quantidade de Bloom · iPhone 16' }),
    );

    expect(useCartStore.getState().items).toEqual([{ sku: BLOOM, quantity: 2 }]);
  });

  it('lowers the quantity while there is more than one unit', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 3);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Diminuir quantidade de Bloom · iPhone 16' }),
    );

    expect(useCartStore.getState().items).toEqual([{ sku: BLOOM, quantity: 2 }]);
  });

  it('drops the line when the quantity is lowered past one unit', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);
    useCartStore.getState().add(SAFARI, 2);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Diminuir quantidade de Bloom · iPhone 16' }),
    );

    expect(useCartStore.getState().items).toEqual([{ sku: SAFARI, quantity: 2 }]);
  });

  it('removes a line whatever its quantity is', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 4);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(
      await screen.findByRole('button', { name: 'Remover Bloom · iPhone 16 do carrinho' }),
    );

    expect(useCartStore.getState().items).toEqual([]);
  });

  it('stops raising the quantity at the units left in stock', async () => {
    stubApi([{ path: '/products', data: [makeVariant({ availableQty: 2 })] }]);
    useCartStore.getState().add(BLOOM, 2);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(
      await screen.findByRole('button', { name: 'Aumentar quantidade de Bloom · iPhone 16' }),
    ).toBeDisabled();
  });

  it('links each line to the page of its own product', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await screen.findByText('Bloom · iPhone 16');
    const line = within(screen.getByRole('listitem'));

    expect(line.getByRole('link')).toHaveAttribute('href', `/produtos/${BLOOM}`);
  });

  it('closes on escape', async () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.keyboard('{Escape}');

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('closes on the close button', async () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar carrinho' }));

    await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument());
  });

  it('keeps the panel on screen while it slides out', async () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar carrinho' }));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useCartDrawerStore.getState().status).toBe('closing');
  });

  it('comes back when it is reopened in the middle of the exit', async () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(screen.getByRole('button', { name: 'Fechar carrinho' }));
    act(() => openDrawer());

    await new Promise((resolve) => setTimeout(resolve, CART_DRAWER_CLOSE_MS + 50));

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(useCartDrawerStore.getState().status).toBe('open');
  });

  it('offers no way to finish a purchase with an empty cart', () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(screen.queryByRole('link', { name: 'Finalizar compra' })).not.toBeInTheDocument();
  });

  it('sends the cart to the checkout once it holds something', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(await screen.findByRole('link', { name: 'Finalizar compra' })).toHaveAttribute(
      'href',
      '/checkout',
    );
  });

  it('gets out of the way when the checkout is reached', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    await userEvent.click(await screen.findByRole('link', { name: 'Finalizar compra' }));

    expect(useCartDrawerStore.getState().status).toBe('closing');
  });

  it('adds up the line prices into a subtotal', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    useCartStore.getState().add(SAFARI);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(await screen.findByText('R$ 249,70')).toBeInTheDocument();
  });

  it('shows the subtotal next to how many units it covers', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 2);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(await screen.findByText('R$ 159,80')).toBeInTheDocument();
    expect(screen.getByText('Subtotal · 2 unidades')).toBeInTheDocument();
  });

  it('follows the subtotal when a line changes quantity', async () => {
    stubCatalog();
    useCartStore.getState().add(BLOOM, 3);
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(await screen.findByText('R$ 239,70')).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Diminuir quantidade de Bloom · iPhone 16' }),
    );

    expect(screen.getByText('R$ 159,80')).toBeInTheDocument();
  });

  it('keeps the subtotal out of an empty cart', () => {
    stubCatalog();
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(screen.queryByText(/subtotal/i)).not.toBeInTheDocument();
  });

  it('keeps a line that left the catalog removable', async () => {
    stubApi([{ path: '/products', data: [] }]);
    useCartStore.getState().add('CAP-SUMIU-IP16-AIS-TRA');
    openDrawer();

    renderWithProviders(<CartDrawer />);

    expect(await screen.findByText(/saiu do catálogo/i)).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole('button', { name: 'Remover CAP-SUMIU-IP16-AIS-TRA do carrinho' }),
    );

    expect(useCartStore.getState().items).toEqual([]);
  });
});
