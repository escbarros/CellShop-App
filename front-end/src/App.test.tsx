import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { App } from './App';
import { renderWithProviders } from './tests/render';

describe('App', () => {
  it('renders the store name as the page heading', () => {
    renderWithProviders(<App />);

    expect(screen.getByRole('heading', { level: 1, name: 'CellShop' })).toBeInTheDocument();
  });
});
