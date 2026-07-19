import { describe, expect, it } from 'vitest';

import { formatMoney, toPaise, toRupees } from '../money';

describe('money conversion', () => {
  it('converts rupees to integer paise', () => {
    expect(toPaise(1234.56)).toBe(123456);
    expect(toPaise(0)).toBe(0);
    expect(toPaise(0.1)).toBe(10);
  });

  it('round-trips without floating-point drift', () => {
    expect(toRupees(toPaise(19.99))).toBe(19.99);
    expect(toRupees(toPaise(0.1 + 0.2))).toBe(0.3);
  });
});

describe('formatMoney (INR, Indian grouping)', () => {
  it('formats with symbol and decimals', () => {
    expect(formatMoney(123456)).toBe('₹1,234.56');
  });

  it('uses lakh/crore grouping', () => {
    expect(formatMoney(toPaise(1234567))).toBe('₹12,34,567.00');
    expect(formatMoney(toPaise(100000))).toBe('₹1,00,000.00');
  });

  it('handles negatives and signed positives', () => {
    expect(formatMoney(-50000)).toBe('-₹500.00');
    expect(formatMoney(50000, { signed: true })).toBe('+₹500.00');
  });

  it('respects symbol and decimals options', () => {
    expect(formatMoney(123456, { symbol: false })).toBe('1,234.56');
    expect(formatMoney(123456, { decimals: false })).toBe('₹1,234');
  });
});
