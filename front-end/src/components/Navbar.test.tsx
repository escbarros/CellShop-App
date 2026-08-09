import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { Navbar } from './Navbar';

describe('Navbar', () => {
  it('renders the store name inside a banner landmark', () => {
    render(<Navbar />);

    expect(within(screen.getByRole('banner')).getByText('CellShop')).toBeInTheDocument();
  });

  it('renders a cart button labelled in portuguese', () => {
    render(<Navbar />);

    expect(screen.getByRole('button', { name: 'Carrinho de compras' })).toBeInTheDocument();
  });
});
