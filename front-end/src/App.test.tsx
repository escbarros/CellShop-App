import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { stubApi } from './tests/api-mock';
import { makeVariant } from './tests/catalog-fixtures';
import { renderWithProviders } from './tests/render';

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
});
