/**
 * Summary repository — period aggregates over the ledger.
 *
 * Income sums are naturally positive (income `amount` is positive). Spending sums
 * flip the sign of expense/cc_payment amounts (stored negative) to report a
 * positive magnitude. Date bounds are inclusive 'YYYY-MM-DD' strings.
 */

import { getDb } from '@/db';
import type { ISODateRange } from '@/domain/periods';

export async function getIncomeTotal({ startISO, endISO }: ISODateRange): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT COALESCE(SUM(amount), 0) AS total
     FROM transactions
     WHERE type = 'income' AND date BETWEEN ? AND ?`,
    [startISO, endISO],
  );
  return row?.total ?? 0;
}

export async function getSpendingTotal({ startISO, endISO }: ISODateRange): Promise<number> {
  const db = await getDb();
  const row = await db.getFirstAsync<{ total: number | null }>(
    `SELECT COALESCE(SUM(-amount), 0) AS total
     FROM transactions
     WHERE type IN ('expense', 'cc_payment') AND date BETWEEN ? AND ?`,
    [startISO, endISO],
  );
  return row?.total ?? 0;
}
