import type { Variant } from '../api/contract';

export function makeVariant(overrides: Partial<Variant> = {}): Variant {
  return {
    sku: 'CAP-BLOOM-IP16-AIS-TRA',
    name: 'Bloom · iPhone 16',
    description: 'Flores em aquarela sobre fundo claro.',
    priceCents: 7990,
    formattedPrice: 'R$ 79,90',
    availableQty: 12,
    available: true,
    imageUrl: 'http://localhost:3333/images/cap-bloom-ip16-ais-tra.jpg',
    thumbUrl: 'http://localhost:3333/images/cap-bloom-ip16-ais-tra-thumb.jpg',
    ...overrides,
  };
}
