import { describe, expect, it } from 'vitest';

import { computeNetWorth } from '../net-worth';
import { computeSafeToSpend } from '../safe-to-spend';

const BASE = {
  totalCash: 100000,
  owedToMe: 20000,
  iOwe: 15000,
  investments: 50000,
  cardOutstandingTotal: 30000,
};

describe('computeNetWorth', () => {
  it('adds cash, receivables and investments, then subtracts debts', () => {
    // 100000 + 20000 + 50000 - 15000 - 30000
    expect(computeNetWorth(BASE)).toBe(125000);
  });

  it('counts investments, unlike Safe To Spend', () => {
    const withMore = computeNetWorth({ ...BASE, investments: BASE.investments + 25000 });
    expect(withMore).toBe(computeNetWorth(BASE) + 25000);
  });

  it('can be negative when debts exceed assets', () => {
    expect(
      computeNetWorth({
        totalCash: 0,
        owedToMe: 0,
        iOwe: 40000,
        investments: 0,
        cardOutstandingTotal: 10000,
      }),
    ).toBe(-50000);
  });
});

describe('Net Worth vs Safe To Spend', () => {
  it('investing money lowers Safe To Spend but leaves Net Worth unchanged', () => {
    const before = { totalCash: 100000, owedToMe: 0, iOwe: 0, ccStatementsOutstanding: 0 };
    const netBefore = computeNetWorth({
      totalCash: 100000,
      owedToMe: 0,
      iOwe: 0,
      investments: 0,
      cardOutstandingTotal: 0,
    });

    // Move ₹300 of cash into an investment.
    const after = { ...before, totalCash: 70000 };
    const netAfter = computeNetWorth({
      totalCash: 70000,
      owedToMe: 0,
      iOwe: 0,
      investments: 30000,
      cardOutstandingTotal: 0,
    });

    expect(computeSafeToSpend(after)).toBe(computeSafeToSpend(before) - 30000);
    expect(netAfter).toBe(netBefore);
  });
});
