import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { makeVariant } from '../tests/catalog-fixtures';
import { ProductCard } from './ProductCard';

describe('ProductCard', () => {
  it('keeps the buy button enabled while there are units left', () => {
    render(<ProductCard variant={makeVariant({ availableQty: 12, available: true })} />);

    expect(screen.getByRole('button', { name: /comprar/i })).toBeEnabled();
  });

  it('disables the buy button for sold-out variants', () => {
    render(<ProductCard variant={makeVariant({ availableQty: 0, available: false })} />);

    expect(screen.getByRole('button', { name: 'Esgotado' })).toBeDisabled();
  });

  it('warns how many units are left when stock is running low', () => {
    render(<ProductCard variant={makeVariant({ availableQty: 3 })} />);

    expect(screen.getByText('Últimas 3 unidades')).toBeInTheDocument();
  });

  it('writes the last unit warning in the singular', () => {
    render(<ProductCard variant={makeVariant({ availableQty: 1 })} />);

    expect(screen.getByText('Última unidade')).toBeInTheDocument();
  });

  it('stays quiet about stock when there is plenty of it', () => {
    render(<ProductCard variant={makeVariant({ availableQty: 20 })} />);

    expect(screen.queryByText(/última/i)).not.toBeInTheDocument();
  });

  it('names the product in the alt text of its image', () => {
    render(<ProductCard variant={makeVariant({ name: 'Bloom · iPhone 16' })} />);

    expect(screen.getByRole('img').getAttribute('alt')).toContain('Bloom · iPhone 16');
  });

  it('asks for the thumbnail lazily and with declared dimensions', () => {
    render(<ProductCard variant={makeVariant()} />);

    const image = screen.getByRole('img');

    expect(image).toHaveAttribute('loading', 'lazy');
    expect(image).toHaveAttribute('width');
    expect(image).toHaveAttribute('height');
  });

  it('falls back to the placeholder image when the thumbnail fails to load', () => {
    render(<ProductCard variant={makeVariant()} />);

    const image = screen.getByRole('img');
    fireEvent.error(image);

    expect(image).toHaveAttribute('src', 'http://localhost:3333/images/placeholder.svg');
  });

  it('renders the price formatted by the api instead of the raw cents', () => {
    render(<ProductCard variant={makeVariant({ priceCents: 8990, formattedPrice: 'R$ 89,90' })} />);

    expect(screen.getByText('R$ 89,90')).toBeInTheDocument();
    expect(screen.queryByText('8990')).not.toBeInTheDocument();
  });
});
