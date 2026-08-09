import { QueryClient } from '@tanstack/react-query';

export const CATALOG_STALE_TIME_MS = 30_000;
export const CATALOG_GC_TIME_MS = 5 * 60_000;

export function createQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: CATALOG_STALE_TIME_MS,
        gcTime: CATALOG_GC_TIME_MS,
        refetchOnWindowFocus: false,
        retry: 1,
      },
      mutations: {
        retry: 0,
      },
    },
  });
}

export const queryClient = createQueryClient();
