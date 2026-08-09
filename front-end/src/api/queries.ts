export const catalogKeys = {
  all: ['catalog'] as const,
  list: () => [...catalogKeys.all, 'list'] as const,
  detail: (sku: string) => [...catalogKeys.all, 'detail', sku] as const,
};
