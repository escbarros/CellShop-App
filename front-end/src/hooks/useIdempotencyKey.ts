import { useCallback, useState } from 'react';

export type IdempotencyKey = {
  key: string;
  renew: () => void;
};

export function useIdempotencyKey(): IdempotencyKey {
  const [key, setKey] = useState(() => crypto.randomUUID());

  const renew = useCallback(() => setKey(crypto.randomUUID()), []);

  return { key, renew };
}
