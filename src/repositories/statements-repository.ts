/**
 * Statement aggregates over the ledger for a date range.
 *
 * Sign conventions: stored amounts are the signed effect on a bank account, so
 * outgoing types are negated here to report positive magnitudes.
 */

import { getDb } from '@/db';
import type { ISODateRange } from '@/domain/periods';
import type { PeriodTotals } from '@/domain/statement';

export async function getPeriodTotals({ startISO, endISO }: ISODateRange): Promise<PeriodTotals> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, number | null>>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'income'          THEN amount  ELSE 0 END), 0) AS income,
       COALESCE(SUM(CASE WHEN type = 'expense'         THEN -amount ELSE 0 END), 0) AS expenses,
       COALESCE(SUM(CASE WHEN type = 'cc_payment'      THEN -amount ELSE 0 END), 0) AS card_payments,
       COALESCE(SUM(CASE WHEN type = 'invest_add'      THEN -amount ELSE 0 END), 0) AS invested,
       COALESCE(SUM(CASE WHEN type = 'invest_withdraw' THEN amount  ELSE 0 END), 0) AS withdrawn,
       COALESCE(SUM(CASE WHEN account_id IS NOT NULL   THEN amount  ELSE 0 END), 0) AS net_cash_flow
     FROM transactions
     WHERE date BETWEEN ? AND ?`,
    [startISO, endISO],
  );

  return {
    income: row?.income ?? 0,
    expenses: row?.expenses ?? 0,
    cardPayments: row?.card_payments ?? 0,
    invested: row?.invested ?? 0,
    withdrawn: row?.withdrawn ?? 0,
    netCashFlow: row?.net_cash_flow ?? 0,
  };
}

export interface CategoryTotal {
  name: string;
  total: number;
}

/** Expense spending grouped by category, largest first. */
export async function getSpendingByCategory({
  startISO,
  endISO,
}: ISODateRange): Promise<CategoryTotal[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<{ name: string | null; total: number }>(
    `SELECT COALESCE(c.name, 'Uncategorised') AS name, SUM(-t.amount) AS total
     FROM transactions t
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.type = 'expense' AND t.date BETWEEN ? AND ?
     GROUP BY t.category_id
     HAVING total > 0
     ORDER BY total DESC`,
    [startISO, endISO],
  );
  return rows.map((r) => ({ name: r.name ?? 'Uncategorised', total: r.total }));
}

export interface CardFlows {
  purchases: number;
  payments: number;
}

export async function getCardFlows({ startISO, endISO }: ISODateRange): Promise<CardFlows> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, number | null>>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'cc_purchase' THEN amount  ELSE 0 END), 0) AS purchases,
       COALESCE(SUM(CASE WHEN type = 'cc_payment'  THEN -amount ELSE 0 END), 0) AS payments
     FROM transactions
     WHERE date BETWEEN ? AND ?`,
    [startISO, endISO],
  );
  return { purchases: row?.purchases ?? 0, payments: row?.payments ?? 0 };
}

export interface LoanFlows {
  lent: number;
  returned: number;
  borrowed: number;
  repaid: number;
}

export async function getLoanFlows({ startISO, endISO }: ISODateRange): Promise<LoanFlows> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, number | null>>(
    `SELECT
       COALESCE(SUM(CASE WHEN type = 'lend'         THEN -amount ELSE 0 END), 0) AS lent,
       COALESCE(SUM(CASE WHEN type = 'lend_return'  THEN amount  ELSE 0 END), 0) AS returned,
       COALESCE(SUM(CASE WHEN type = 'borrow'       THEN amount  ELSE 0 END), 0) AS borrowed,
       COALESCE(SUM(CASE WHEN type = 'borrow_repay' THEN -amount ELSE 0 END), 0) AS repaid
     FROM transactions
     WHERE date BETWEEN ? AND ?`,
    [startISO, endISO],
  );
  return {
    lent: row?.lent ?? 0,
    returned: row?.returned ?? 0,
    borrowed: row?.borrowed ?? 0,
    repaid: row?.repaid ?? 0,
  };
}
