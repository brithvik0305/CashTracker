import { describe, expect, it } from 'vitest';

import { getFinancialWeek, isInFinancialWeek } from '../financial-week';

// Reference calendar: Jan 3 2024 is a Wednesday.
const WED = () => new Date(2024, 0, 3); // Wed
const FRI = () => new Date(2024, 0, 5); // Fri (same financial week)
const TUE = () => new Date(2024, 0, 2); // Tue (previous financial week)

describe('getFinancialWeek (Wed -> Tue)', () => {
  it('starts a Wednesday on that same Wednesday', () => {
    const { start, end } = getFinancialWeek(WED());
    expect(start.getFullYear()).toBe(2024);
    expect(start.getMonth()).toBe(0);
    expect(start.getDate()).toBe(3);
    expect(start.getDay()).toBe(3); // Wednesday
    expect(end.getDate()).toBe(9); // following Tuesday
    expect(end.getDay()).toBe(2); // Tuesday
  });

  it('maps a mid-week day back to its Wednesday', () => {
    const { start } = getFinancialWeek(FRI());
    expect(start.getDate()).toBe(3);
  });

  it('puts Tuesday in the previous week (ending that Tuesday)', () => {
    const { start, end } = getFinancialWeek(TUE());
    expect(start.getDate()).toBe(27); // Dec 27 2023 (Wed)
    expect(start.getMonth()).toBe(11);
    expect(end.getDate()).toBe(2); // Jan 2 2024 (Tue)
  });
});

describe('isInFinancialWeek', () => {
  it('groups Wed and Fri of the same week together', () => {
    expect(isInFinancialWeek(FRI(), WED())).toBe(true);
  });

  it('excludes the preceding Tuesday', () => {
    expect(isInFinancialWeek(TUE(), WED())).toBe(false);
  });
});
