import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import type { Variant } from '../api/contract';
import { envelope, stubApi } from '../tests/api-mock';
import { makeVariant } from '../tests/catalog-fixtures';
import { renderWithProviders } from '../tests/render';
import { Storefront } from './Storefront';

function jsonResponse(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function stubPendingRequest() {
  vi.stubGlobal(
    'fetch',
    vi.fn(() => new Promise<Response>(() => undefined)),
  );
}

function stubFailureThenCatalog(variants: Variant[]) {
  const fetchMock = vi
    .fn<(input: RequestInfo | URL, init?: RequestInit) => Promise<Response>>()
    .mockImplementationOnce(() => Promise.reject(new TypeError('Failed to fetch')))
    .mockImplementation(() => Promise.resolve(jsonResponse(200, envelope(variants))));

  vi.stubGlobal('fetch', fetchMock);

  return fetchMock;
}

describe('Storefront', () => {
  it('shows a loading placeholder while fetching', () => {
    stubPendingRequest();

    renderWithProviders(<Storefront />);

    expect(screen.getByRole('status', { name: /carregando/i })).toBeInTheDocument();
  });

  it('shows an error message and a working retry button', async () => {
    stubFailureThenCatalog([makeVariant()]);

    renderWithProviders(<Storefront />);

    expect(await screen.findByRole('alert')).toHaveTextContent(
      /não conseguimos falar com o servidor/i,
    );

    await userEvent.click(screen.getByRole('button', { name: 'Tentar de novo' }));

    expect(await screen.findByText('Bloom · iPhone 16')).toBeInTheDocument();
  });

  it('shows an empty state when there are no products', async () => {
    stubApi([{ path: '/products', data: [] }]);

    renderWithProviders(<Storefront />);

    expect(await screen.findByText(/nenhuma capinha disponível/i)).toBeInTheDocument();
  });

  it('renders one card per variant returned by the api', async () => {
    stubApi([
      {
        path: '/products',
        data: [
          makeVariant(),
          makeVariant({ sku: 'CAP-SAFARI-S24-AIS-TRA', name: 'Safari · Galaxy S24' }),
        ],
      },
    ]);

    renderWithProviders(<Storefront />);

    expect(await screen.findByText('Bloom · iPhone 16')).toBeInTheDocument();
    expect(screen.getByText('Safari · Galaxy S24')).toBeInTheDocument();
  });

  it('renders a non-empty alt text for every image', async () => {
    stubApi([
      {
        path: '/products',
        data: [
          makeVariant(),
          makeVariant({ sku: 'CAP-SAFARI-S24-AIS-TRA', name: 'Safari · Galaxy S24' }),
        ],
      },
    ]);

    renderWithProviders(<Storefront />);

    const images = await screen.findAllByRole('img');

    expect(images).toHaveLength(2);
    for (const image of images) {
      expect(image.getAttribute('alt')).toBeTruthy();
    }
  });

  it('renders the price formatted by the api', async () => {
    stubApi([{ path: '/products', data: [makeVariant({ priceCents: 7990 })] }]);

    renderWithProviders(<Storefront />);

    expect(await screen.findByText('R$ 79,90')).toBeInTheDocument();
    expect(screen.queryByText('7990')).not.toBeInTheDocument();
    expect(screen.queryByText('79.9')).not.toBeInTheDocument();
  });
});
