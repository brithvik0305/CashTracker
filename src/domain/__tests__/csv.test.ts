import { describe, expect, it } from 'vitest';

import { csvEscape, toCsv } from '../../lib/csv';

describe('csvEscape', () => {
  it('leaves plain values alone', () => {
    expect(csvEscape('Food')).toBe('Food');
    expect(csvEscape(1234)).toBe('1234');
  });

  it('returns empty string for null and undefined', () => {
    expect(csvEscape(null)).toBe('');
    expect(csvEscape(undefined)).toBe('');
  });

  it('quotes values containing a comma', () => {
    expect(csvEscape('Lunch, drinks')).toBe('"Lunch, drinks"');
  });

  it('escapes inner quotes by doubling them', () => {
    expect(csvEscape('He said "hi"')).toBe('"He said ""hi"""');
  });

  it('quotes values containing newlines', () => {
    expect(csvEscape('line1\nline2')).toBe('"line1\nline2"');
  });
});

describe('toCsv', () => {
  it('builds a header row plus data rows', () => {
    const csv = toCsv(['Date', 'Amount'], [['2026-07-19', '100.00']]);
    expect(csv).toBe('Date,Amount\r\n2026-07-19,100.00');
  });

  it('escapes fields inside rows', () => {
    const csv = toCsv(['Note'], [['a,b']]);
    expect(csv).toBe('Note\r\n"a,b"');
  });
});
