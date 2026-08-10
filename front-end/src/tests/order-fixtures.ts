import type { OrderDetail } from '../api/contract';

export function makeOrderDetail(overrides: Partial<OrderDetail> = {}): OrderDetail {
  return {
    number: 'CCS-2026-000417',
    status: 'CONFIRMED',
    items: [
      {
        sku: 'CAP-BLOOM-IP16-AIS-TRA',
        name: 'Bloom · iPhone 16',
        quantity: 2,
        unitPriceCents: 7990,
        subtotalCents: 15980,
      },
    ],
    subtotalCents: 15980,
    shippingCents: 1990,
    discountCents: 0,
    totalCents: 17970,
    createdAt: '2026-08-09T12:00:03.104Z',
    recipient: {
      name: 'Eduardo Scaburi Costa Barros',
      taxId: '***.038.739-**',
      email: 'escbarross@gmail.com',
      phone: '41995811409',
      zipCode: '83327076',
      street: 'Rua Jaguariaiva',
      number: '243',
      complement: 'TOTVS',
      district: 'Alphaville Graciosa',
      city: 'Pinhais',
      state: 'PR',
    },
    events: [
      {
        previousStatus: null,
        newStatus: 'PENDING',
        source: 'API',
        message: 'Pedido recebido pela API.',
        createdAt: '2026-08-09T12:00:03.104Z',
      },
      {
        previousStatus: 'PENDING',
        newStatus: 'CONFIRMED',
        source: 'API',
        message: 'Estoque reservado e pedido confirmado.',
        createdAt: '2026-08-09T12:00:03.117Z',
      },
    ],
    ...overrides,
  };
}
