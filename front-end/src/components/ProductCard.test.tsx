import { fireEvent, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import { useCartStore } from '../store/cart-store';
import { makeVariant } from '../tests/catalog-fixtures';
import { renderWithProviders } from '../tests/render';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('keeps the add button enabled while there are units left', () => {
    renderWithProviders(
      <ProductCard variant={makeVariant({ availableQty: 12, available: true })} />,
    );

    expect(screen.getByRole('button', { name: /adicionar/i })).toBeEnabled();
  });

  it('disables the buy button for sold-out variants', () => {
    renderWithProviders(
      <ProductCard variant={makeVariant({ availableQty: 0, available: false })} />,
    );

    expect(screen.getByRole('button', { name: 'Esgotado' })).toBeDisabled();
  });

  it('warns how many units are left when stock is running low', () => {
    renderWithProviders(<ProductCard variant={makeVariant({ availableQty: 3 })} />);

    expect(screen.getByText('Últimas 3 unidades')).toBeInTheDocument();
  });

  it('writes the last unit warning in the singular', () => {
    renderWithProviders(<ProductCard variant={makeVariant({ availableQty: 1 })} />);

    expect(screen.getByText('Última unidade')).toBeInTheDocument();
  });

  it('stays quiet about stock when there is plenty of it', () => {
    renderWithProviders(<ProductCard variant={makeVariant({ availableQty: 20 })} />);

    expect(screen.queryByText(/última/i)).not.toBeInTheDocument();
  });

  it('names the product in the alt text of its image', () => {
    renderWithProviders(<ProductCard variant={makeVariant({ name: 'Bloom · iPhone 16' })} />);

    expect(screen.getByRole('img').getAttribute('alt')).toContain('Bloom · iPhone 16');
  });

  it('asks for the thumbnail lazily and with declared dimensions', () => {
    renderWithProviders(<ProductCard variant={makeVariant()} />);

    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
  });

  it('falls back to the placeholder image when the thumbnail fails to load', () => {
    renderWithProviders(<ProductCard variant={makeVariant()} />);

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', 'http://localhost:3333/images/placeholder.svg');
  });

  it('renders the price formatted by the api instead of the raw cents', () => {
    renderWithProviders(
      <ProductCard variant={makeVariant({ priceCents: 8990, formattedPrice: 'R$ 89,90' })} />,
    );

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
    expect(screen.queryByText('8990')).not.toBeInTheDocument();
  });

  it('points the product name at its own page', () => {
    renderWithProviders(<ProductCard variant={makeVariant({ sku: 'CAP-BLOOM-IP16-AIS-TRA' })} />);

    expect(screen.getByRole('link', { name: 'Bloom · iPhone 16' })).toHaveAttribute(
      'href',
      '/produtos/CAP-BLOOM-IP16-AIS-TRA',
    );
  });

  it('adds a single unit to the cart without leaving the storefront', async () => {
    renderWithProviders(<ProductCard variant={makeVariant({ sku: 'CAP-BLOOM-IP16-AIS-TRA' })} />);

    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(useCartStore.getState().items).toEqual([{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 1 }]);
  });

  it('shuts the add button once the variant is in the cart', async () => {
    renderWithProviders(<ProductCard variant={makeVariant()} />);

    await userEvent.click(screen.getByRole('button', { name: /adicionar/i }));

    expect(screen.getByRole('button', { name: 'Já está no carrinho' })).toBeDisabled();
  });

  it('never stacks units past the stock by repeating the click', async () => {
    renderWithProviders(
      <ProductCard variant={makeVariant({ sku: 'CAP-BLOOM-IP16-AIS-TRA', availableQty: 1 })} />,
    );

    const addButton = screen.getByRole('button', { name: /adicionar/i });
    await userEvent.click(addButton);
    await userEvent.click(addButton);
    await userEvent.click(addButton);

    expect(useCartStore.getState().items).toEqual([{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 1 }]);
  });

  it('renders already shut when the stored cart holds the variant', () => {
    useCartStore.setState({ items: [{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 2 }] });

    renderWithProviders(<ProductCard variant={makeVariant({ sku: 'CAP-BLOOM-IP16-AIS-TRA' })} />);

    expect(screen.getByRole('button', { name: 'Já está no carrinho' })).toBeDisabled();
  });

  it('calls a sold-out variant sold out even when it sits in the cart', () => {
    useCartStore.setState({ items: [{ sku: 'CAP-BLOOM-IP16-AIS-TRA', quantity: 1 }] });

    renderWithProviders(
      <ProductCard
        variant={makeVariant({
          sku: 'CAP-BLOOM-IP16-AIS-TRA',
          availableQty: 0,
          available: false,
        })}
      />,
    );

    expect(screen.getByRole('button', { name: 'Esgotado' })).toBeDisabled();
  });
});
