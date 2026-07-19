import { describe, expect, it } from 'vitest';

import { getSpendingStatus } from '../spending-indicator';

describe('getSpendingStatus tiers', () => {
  const income = 100000; // ₹1,000

  it('green below 50%', () => {
    expect(getSpendingStatus(49999, income).tier).toBe('green');
  });

  it('yellow from 50% up to (not incl.) 80%', () => {
    expect(getSpendingStatus(50000, income).tier).toBe('yellow'); // exactly 50%
    expect(getSpendingStatus(79999, income).tier).toBe('yellow');
  });

  it('orange from 80% up to (not incl.) 100%', () => {
    expect(getSpendingStatus(80000, income).tier).toBe('orange'); // exactly 80%
    expect(getSpendingStatus(99999, income).tier).toBe('orange');
  });

  it('red at exactly 100% and above', () => {
    expect(getSpendingStatus(100000, income).tier).toBe('red'); // exactly 100% = red
    expect(getSpendingStatus(150000, income).tier).toBe('red');
  });
});

describe('getSpendingStatus edge cases', () => {
  it('green at zero activity', () => {
    const s = getSpendingStatus(0, 0);
    expect(s.tier).toBe('green');
    expect(s.percent).toBe(0);
  });

  it('red when spending with no income', () => {
    expect(getSpendingStatus(5000, 0).tier).toBe('red');
  });
});
