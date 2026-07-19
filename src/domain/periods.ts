/**
 * Reporting periods.
 *
 * Weekly is the financial week (Wed→Tue). Monthly and yearly are calendar
 * periods (frozen decision #9). `toISODateRange` yields inclusive 'YYYY-MM-DD'
 * bounds for SQL `date BETWEEN ? AND ?` queries against the ledger.
 */

import { endOfMonth, endOfYear, format, startOfMonth, startOfYear } from 'date-fns';

import { DEFAULT_WEEK_START_DAY, getFinancialWeek } from './financial-week';

export interface DateRange {
  start: Date;
  end: Date;
}

export function currentFinancialWeek(
  ref: Date,
  weekStartDay: number = DEFAULT_WEEK_START_DAY,
): DateRange {
  return getFinancialWeek(ref, weekStartDay);
}

export function currentMonth(ref: Date): DateRange {
  return { start: startOfMonth(ref), end: endOfMonth(ref) };
}

export function currentYear(ref: Date): DateRange {
  return { start: startOfYear(ref), end: endOfYear(ref) };
}

export interface ISODateRange {
  startISO: string;
  endISO: string;
}

export function toISODateRange({ start, end }: DateRange): ISODateRange {
  return { startISO: format(start, 'yyyy-MM-dd'), endISO: format(end, 'yyyy-MM-dd') };
}
