import {
  ERROR_CODES,
  ErrorCode,
  HTTP_STATUS_BY_ERROR_CODE,
  MESSAGE_BY_ERROR_CODE,
} from './error-catalog';

const codes = Object.values(ERROR_CODES) as ErrorCode[];

describe('error catalog', () => {
  it.each(codes)('gives %s a status and a message', (code) => {
    expect(HTTP_STATUS_BY_ERROR_CODE[code]).toBeGreaterThanOrEqual(400);
    expect(MESSAGE_BY_ERROR_CODE[code].length).toBeGreaterThan(0);
  });

  it.each(codes)(
    'keeps the machine readable side of %s in english screaming snake case',
    (code) => {
      expect(code).toMatch(/^[A-Z][A-Z_]*$/);
    },
  );

  it.each(codes)('ends the user facing message of %s as a sentence', (code) => {
    expect(MESSAGE_BY_ERROR_CODE[code]).toMatch(/[.!?]$/);
  });
});
