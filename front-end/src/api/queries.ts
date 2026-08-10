export const orderKeys = {
  all: ['orders'] as const,
  list: () => [...orderKeys.all, 'list'] as const,
  detail: (number: string) => [...orderKeys.all, 'detail', number] as const,
};

export const catalogKeys = {
  all: ['catalog'] as const,
  list: () => [...catalogKeys.all, 'list'] as const,
  detail: (sku: string) => [...catalogKeys.all, 'detail', sku] as const,
};
