/** Date helpers shared across the app. */

import { format } from 'date-fns';

/** A Date as a local 'YYYY-MM-DD' string (the ledger's date format). */
export function toISODate(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

/** Today's local calendar date as 'YYYY-MM-DD'. */
export function todayISODate(): string {
  return toISODate(new Date());
}

/** Format a 'YYYY-MM-DD' (or ISO) string for display, e.g. "19 Jul 2026". */
export function formatDisplayDate(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  return format(d, 'd MMM yyyy');
}
