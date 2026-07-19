import { describe, expect, it } from 'vitest';

import { currentMonth, currentYear, toISODateRange } from '../periods';

// Reference: 19 Jul 2026 (a Sunday).
const REF = () => new Date(2026, 6, 19);

describe('currentMonth', () => {
  it('spans the whole calendar month', () => {
    const { startISO, endISO } = toISODateRange(currentMonth(REF()));
    expect(startISO).toBe('2026-07-01');
    expect(endISO).toBe('2026-07-31');
  });
});

describe('currentYear', () => {
  it('spans the whole calendar year', () => {
    const { startISO, endISO } = toISODateRange(currentYear(REF()));
    expect(startISO).toBe('2026-01-01');
    expect(endISO).toBe('2026-12-31');
  });
});

describe('toISODateRange', () => {
  it('formats bounds as YYYY-MM-DD', () => {
    const range = toISODateRange({ start: new Date(2026, 0, 5), end: new Date(2026, 0, 9) });
    expect(range).toEqual({ startISO: '2026-01-05', endISO: '2026-01-09' });
  });
});
