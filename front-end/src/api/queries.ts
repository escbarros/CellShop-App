export const catalogKeys = {
  all: ['catalog'] as const,
  list: () => [...catalogKeys.all, 'list'] as const,
};
