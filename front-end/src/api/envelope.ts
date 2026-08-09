import type { ResponseMeta, StockShortage, ValidationDetail } from './contract';

export type Envelope = {
  data: unknown;
  error: { code?: unknown; message?: unknown; details?: unknown } | null;
  meta: ResponseMeta;
};

export async function readEnvelope(response: Response): Promise<Envelope | null> {
  try {
    const parsed: unknown = await response.json();

    return typeof parsed === 'object' && parsed !== null ? (parsed as Envelope) : null;
  } catch {
    return null;
  }
}

export function readMessage(body: Envelope): string | null {
  const message = body.error?.message;

  return typeof message === 'string' ? message : null;
}

export function readDetails(body: Envelope): ValidationDetail[] {
  const details = body.error?.details;

  return Array.isArray(details) ? details.filter(isValidationDetail) : [];
}

export function readShortage(body: Envelope): StockShortage | null {
  const details = body.error?.details;

  if (!Array.isArray(details)) {
    return null;
  }

  for (const entry of details) {
    const shortage = asShortage(entry);

    if (shortage !== null) {
      return shortage;
    }
  }

  return null;
}

function isValidationDetail(entry: unknown): entry is ValidationDetail {
  if (typeof entry !== 'object' || entry === null) {
    return false;
  }

  const candidate = entry as { field?: unknown; message?: unknown };

  return typeof candidate.field === 'string' && typeof candidate.message === 'string';
}

function asShortage(entry: unknown): StockShortage | null {
  if (typeof entry !== 'object' || entry === null) {
    return null;
  }

  const candidate = entry as { sku?: unknown; available?: unknown };

  if (typeof candidate.sku !== 'string' || typeof candidate.available !== 'number') {
    return null;
  }

  return { sku: candidate.sku, available: candidate.available };
}
