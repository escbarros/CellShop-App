import { CreateCheckoutDto } from '../src/orders/dto/create-checkout.dto';

export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';

export const SAMPLE_IDEMPOTENCY_KEY = '8f1c2d3e-4a5b-4c6d-8e9f-0a1b2c3d4e5f';

export function validCheckoutPayload(): CreateCheckoutDto {
  return {
    items: [{ sku: 'CAP-SCRAPBOOK-IP16-AIS-TRA', quantity: 2 }],
    recipient: {
      name: 'Ana Beatriz Nogueira',
      taxId: '39053344705',
      email: 'ana.nogueira@example.com',
      phone: '11987654321',
      zipCode: '01310930',
      street: 'Avenida Paulista',
      number: '1578',
      complement: 'Apto 92, torre B',
      district: 'Bela Vista',
      city: 'São Paulo',
      state: 'SP',
    },
  };
}
