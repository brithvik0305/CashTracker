/**
 * Financial-week math.
 *
 * CashTracker's financial week runs Wednesday -> Tuesday (weekStartDay = 3).
 * All weekly aggregations (income, spending, savings, the spending indicator)
 * are anchored to the week returned here.
 */

import { addDays, endOfDay, startOfDay, subDays } from 'date-fns';

/** Wednesday, in JS `Date.getDay()` terms (0=Sun .. 6=Sat). */
export const DEFAULT_WEEK_START_DAY = 3;

export interface FinancialWeek {
  /** Inclusive start, at 00:00:00.000 of the week's first day. */
  start: Date;
  /** Inclusive end, at 23:59:59.999 of the week's last day. */
  end: Date;
}

/**
 * Returns the financial week containing `date`.
 * With weekStartDay = 3 (Wed), any date lands in the week starting on the most
 * recent Wednesday (that day itself if it is a Wednesday).
 */
export function getFinancialWeek(
  date: Date,
  weekStartDay: number = DEFAULT_WEEK_START_DAY,
): FinancialWeek {
  const offset = (date.getDay() - weekStartDay + 7) % 7;
  const start = startOfDay(subDays(date, offset));
  const end = endOfDay(addDays(start, 6));
  return { start, end };
}

/** True when `date` falls within the financial week of `reference`. */
export function isInFinancialWeek(
  date: Date,
  reference: Date,
  weekStartDay: number = DEFAULT_WEEK_START_DAY,
): boolean {
  const { start, end } = getFinancialWeek(reference, weekStartDay);
  return date >= start && date <= end;
}
