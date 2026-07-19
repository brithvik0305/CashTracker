import { describe, expect, it } from 'vitest';

import { financialWeeksInRange } from '../periods';
import { computeSavings, computeSavingsRate, computeSpending } from '../statement';

describe('computeSpending', () => {
  it('adds expenses and card bill payments', () => {
    expect(computeSpending(30000, 20000)).toBe(50000);
  });
});

describe('computeSavings', () => {
  it('is income minus spending', () => {
    expect(computeSavings(100000, 60000)).toBe(40000);
  });

  it('goes negative when you overspend', () => {
    expect(computeSavings(50000, 80000)).toBe(-30000);
  });
});

describe('computeSavingsRate', () => {
  it('is the share of income kept', () => {
    expect(computeSavingsRate(100000, 60000)).toBeCloseTo(0.4);
  });

  it('is 0 when there is no income', () => {
    expect(computeSavingsRate(0, 5000)).toBe(0);
  });
});

describe('financialWeeksInRange', () => {
  it('covers a month with whole Wed→Tue weeks', () => {
    // July 2026: 1st is a Wednesday.
    const weeks = financialWeeksInRange({
      start: new Date(2026, 6, 1),
      end: new Date(2026, 6, 31),
    });
    expect(weeks.length).toBeGreaterThanOrEqual(5);
    // Every week starts on a Wednesday.
    weeks.forEach((w) => expect(w.start.getDay()).toBe(3));
    // The first week contains the 1st.
    expect(weeks[0].start.getTime()).toBeLessThanOrEqual(new Date(2026, 6, 1).getTime());
    // The last week reaches the end of the month.
    expect(weeks[weeks.length - 1].end.getTime()).toBeGreaterThanOrEqual(
      new Date(2026, 6, 31).getTime(),
    );
  });

  it('returns consecutive, non-overlapping weeks', () => {
    const weeks = financialWeeksInRange({
      start: new Date(2026, 0, 1),
      end: new Date(2026, 1, 15),
    });
    for (let i = 1; i < weeks.length; i++) {
      const gap = weeks[i].start.getTime() - weeks[i - 1].start.getTime();
      expect(gap).toBe(7 * 24 * 60 * 60 * 1000);
    }
  });
});
