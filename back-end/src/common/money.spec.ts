import { formatBRL, multiply, sum, toCents } from './money';

describe('money in cents', () => {
  it('multiplies a unit price by a quantity with no rounding error', () => {
    expect(multiply(7990, 3)).toBe(23970);
  });

  it('keeps the sum exact where the same amounts in reais would drift', () => {
    expect(0.1 + 0.2).not.toBe(0.3);
    expect(sum(toCents(0.1), toCents(0.2))).toBe(toCents(0.3));
  });

  it('sums an empty list as zero', () => {
    expect(sum()).toBe(0);
  });

  it('formats cents as brazilian currency', () => {
    expect(formatBRL(7990)).toBe('R$ 79,90');
    expect(formatBRL(0)).toBe('R$ 0,00');
    expect(formatBRL(123456789)).toBe('R$ 1.234.567,89');
  });

  it('rounds explicitly when converting reais to cents', () => {
    expect(toCents(79.9)).toBe(7990);
    expect(toCents(0.005)).toBe(1);
  });

  it('refuses a fractional amount of cents instead of rounding it silently', () => {
    expect(() => multiply(79.9, 3)).toThrow(/79.9/);
    expect(() => multiply(7990, 1.5)).toThrow(/1.5/);
    expect(() => sum(7990, 0.5)).toThrow(/0.5/);
    expect(() => formatBRL(7990.5)).toThrow(/7990.5/);
  });

  it('refuses an amount that is not a finite number', () => {
    expect(() => sum(Number.NaN)).toThrow();
    expect(() => sum(Number.POSITIVE_INFINITY)).toThrow();
    expect(() => toCents(Number.NaN)).toThrow();
  });

  it('refuses an amount beyond exact integer arithmetic', () => {
    expect(() => sum(Number.MAX_SAFE_INTEGER, 1)).toThrow();
  });
});
