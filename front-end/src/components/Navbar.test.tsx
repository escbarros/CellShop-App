import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useCartDrawerStore } from '../store/cart-drawer-store';
import { useCartStore } from '../store/cart-store';
import { renderWithProviders } from '../tests/render';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the store name inside a banner landmark', () => {
    renderWithProviders(<Navbar />);

    expect(within(screen.getByRole('banner')).getByText('CellShop')).toBeInTheDocument();
  });

  it('renders a cart button labelled in portuguese', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByRole('button', { name: 'Carrinho de compras' })).toBeInTheDocument();
  });

  it('announces how many units are waiting in the cart', () => {
    useCartStore.getState().add('CAP-BLOOM-IP16-AIS-TRA', 3);

    renderWithProviders(<Navbar />);

    expect(
      screen.getByRole('button', { name: 'Carrinho de compras com 3 unidades' }),
    ).toBeInTheDocument();
  });

  it('leads to the orders page from the profile button', () => {
    renderWithProviders(<Navbar />);

    expect(screen.getByRole('link', { name: 'Meus pedidos' })).toHaveAttribute('href', '/orders');
  });

  it('opens the cart drawer when the cart button is clicked', async () => {
    renderWithProviders(<Navbar />);

    await userEvent.click(screen.getByRole('button', { name: 'Carrinho de compras' }));

    expect(useCartDrawerStore.getState().status).toBe('open');
  });
});
