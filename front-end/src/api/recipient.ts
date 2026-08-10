import type { Recipient } from './contract';

const ONLY_DIGITS_TAX_ID = /^\d{11}$/;
const ONLY_DIGITS_PHONE = /^\d{10,11}$/;

export type RecipientLike = {
  name: string;
  taxId: string;
  email: string;
  phone?: string | null;
  zipCode: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
};

export const CHECKOUT_RECIPIENT: Recipient = {
  name: 'Eduardo Scaburi Costa Barros',
  taxId: '04903873900',
  email: 'escbarross@gmail.com',
  phone: '41995811409',
  zipCode: '83327076',
  street: 'Rua Jaguariaiva',
  number: '243',
  complement: 'TOTVS',
  district: 'Alphaville Graciosa',
  city: 'Pinhais',
  state: 'PR',
};

export function formatZipCode(zipCode: string): string {
  return `${zipCode.slice(0, 5)}-${zipCode.slice(5)}`;
}

export function formatPhone(phone: string): string {
  if (!ONLY_DIGITS_PHONE.test(phone)) {
    return phone;
  }

  return `(${phone.slice(0, 2)}) ${phone.slice(2, -4)}-${phone.slice(-4)}`;
}

export function displayTaxId(taxId: string): string {
  if (!ONLY_DIGITS_TAX_ID.test(taxId)) {
    return taxId;
  }

  return `•••.${taxId.slice(3, 6)}.${taxId.slice(6, 9)}-••`;
}

export function formatStreetLine(recipient: RecipientLike): string {
  const address = `${recipient.street}, ${recipient.number}`;

  return recipient.complement ? `${address} · ${recipient.complement}` : address;
}

export function formatCityLine(recipient: RecipientLike): string {
  return `${recipient.district} · ${recipient.city}, ${recipient.state}`;
}
