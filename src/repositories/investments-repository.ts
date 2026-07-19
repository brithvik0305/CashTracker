/**
 * Investments repository.
 *
 * Contributions (`invest_add`) take money out of a bank account; withdrawals
 * (`invest_withdraw`) put it back. Amounts are derived from the ledger, while the
 * record stores an optional current market value the user maintains.
 */

import { getDb } from '@/db';
import { todayISODate } from '@/lib/date';
import {
  InvestmentWithTotalsSchema,
  type InvestmentType,
  type InvestmentWithTotals,
} from '@/schemas/investment';

const INVESTED = `COALESCE((SELECT -SUM(t.amount) FROM transactions t
  WHERE t.investment_id = i.id AND t.type = 'invest_add'), 0)`;
const WITHDRAWN = `COALESCE((SELECT SUM(t.amount) FROM transactions t
  WHERE t.investment_id = i.id AND t.type = 'invest_withdraw'), 0)`;
const NET_INVESTED = `(${INVESTED} - ${WITHDRAWN})`;
const VALUE = `COALESCE(i.current_value, ${NET_INVESTED})`;

const SELECT_WITH_TOTALS = `SELECT i.*,
    ${INVESTED}     AS invested,
    ${WITHDRAWN}    AS withdrawn,
    ${NET_INVESTED} AS net_invested,
    ${VALUE}        AS value,
    (${VALUE} - ${NET_INVESTED}) AS gain
  FROM investments i`;

export async function listInvestments(
  includeArchived = false,
): Promise<InvestmentWithTotals[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE i.is_archived = 0';
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `${SELECT_WITH_TOTALS} ${where} ORDER BY i.sort_order, i.id`,
  );
  return rows.map((r) => InvestmentWithTotalsSchema.parse(r));
}

/** Total portfolio value (what counts towards Net Worth). */
export async function getInvestmentsValue(): Promise<number> {
  const list = await listInvestments(false);
  return list.reduce((sum, i) => sum + i.value, 0);
}

export interface NewInvestment {
  name: string;
  type: InvestmentType;
  /** Positive paise moved from the bank into this investment. */
  amount: number;
  accountId: number;
  date?: string;
  notes?: string | null;
}

/** Creates the investment and its first contribution atomically. */
export async function createInvestment(input: NewInvestment): Promise<number> {
  if (input.amount <= 0) throw new Error('Amount must be greater than zero.');
  const db = await getDb();
  const date = input.date ?? todayISODate();
  const notes = input.notes ?? null;
  let id = 0;

  await db.withTransactionAsync(async () => {
    const created = await db.runAsync(
      `INSERT INTO investments (name, type, notes, sort_order)
       VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM investments))`,
      [input.name.trim(), input.type, notes],
    );
    id = created.lastInsertRowId;
    await db.runAsync(
      `INSERT INTO transactions (type, amount, account_id, investment_id, date, notes)
       VALUES ('invest_add', ?, ?, ?, ?, ?)`,
      [-input.amount, input.accountId, id, date, notes],
    );
  });

  return id;
}

export interface InvestmentFlowInput {
  investmentId: number;
  /** Positive paise. */
  amount: number;
  accountId: number;
  date?: string;
  notes?: string | null;
}

/** Put more money in (bank decreases). */
export async function addContribution(input: InvestmentFlowInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Amount must be greater than zero.');
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO transactions (type, amount, account_id, investment_id, date, notes)
     VALUES ('invest_add', ?, ?, ?, ?, ?)`,
    [-input.amount, input.accountId, input.investmentId, input.date ?? todayISODate(), input.notes ?? null],
  );
  return result.lastInsertRowId;
}

/** Take money back out (bank increases). */
export async function withdrawInvestment(input: InvestmentFlowInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Amount must be greater than zero.');
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO transactions (type, amount, account_id, investment_id, date, notes)
     VALUES ('invest_withdraw', ?, ?, ?, ?, ?)`,
    [input.amount, input.accountId, input.investmentId, input.date ?? todayISODate(), input.notes ?? null],
  );
  return result.lastInsertRowId;
}

export interface InvestmentEdit {
  name: string;
  type: InvestmentType;
  /** Null clears the manual value and falls back to the amount invested. */
  current_value: number | null;
  notes: string | null;
}

export async function updateInvestment(id: number, edit: InvestmentEdit): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE investments SET name = ?, type = ?, current_value = ?, notes = ?,
       updated_at = datetime('now') WHERE id = ?`,
    [edit.name.trim(), edit.type, edit.current_value, edit.notes, id],
  );
}

export async function archiveInvestment(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE investments SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
}
