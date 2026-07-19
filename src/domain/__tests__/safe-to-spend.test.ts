import { describe, expect, it } from 'vitest';

import {
  computeNetAvailableBalance,
  computeSafeToSpend,
  EMPTY_POSITION,
} from '../safe-to-spend';

describe('computeSafeToSpend', () => {
  it('is just cash when nothing else is tracked', () => {
    expect(computeSafeToSpend({ ...EMPTY_POSITION, totalCash: 100000 })).toBe(100000);
  });

  it('adds money owed to you and subtracts what you owe and card bills', () => {
    expect(
      computeSafeToSpend({
        totalCash: 100000,
        owedToMe: 20000,
        iOwe: 15000,
        ccStatementsOutstanding: 30000,
      }),
    ).toBe(75000);
  });
});

describe('computeNetAvailableBalance', () => {
  it('excludes money owed to you (conservative view)', () => {
    expect(
      computeNetAvailableBalance({
        totalCash: 100000,
        owedToMe: 20000,
        iOwe: 15000,
        ccStatementsOutstanding: 30000,
      }),
    ).toBe(55000);
  });

  it('equals Safe To Spend when nobody owes you', () => {
    const p = { totalCash: 80000, owedToMe: 0, iOwe: 10000, ccStatementsOutstanding: 5000 };
    expect(computeNetAvailableBalance(p)).toBe(computeSafeToSpend(p));
  });
});
