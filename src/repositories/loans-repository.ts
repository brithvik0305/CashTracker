/**
 * Lending and borrowing repository.
 *
 * The two are mirror images, so one implementation is parameterised by kind:
 *
 *            principal txn   settles with     bank effect of principal
 *   lending  'lend'          'lend_return'    money leaves  (sign = -1)
 *   borrowing 'borrow'       'borrow_repay'   money arrives (sign = +1)
 *
 * A settling payment always has the opposite sign of its principal. Amounts are
 * derived from the ledger, so editing or deleting a linked transaction keeps
 * principal / settled / remaining correct.
 */

import { getDb } from '@/db';
import { todayISODate } from '@/lib/date';
import { LoanWithTotalsSchema, type LoanKind, type LoanWithTotals } from '@/schemas/loan';

interface LoanConfig {
  table: 'lendings' | 'borrowings';
  fk: 'lending_id' | 'borrowing_id';
  principalType: 'lend' | 'borrow';
  settleType: 'lend_return' | 'borrow_repay';
  /** Sign of the principal's effect on the bank account. */
  sign: 1 | -1;
}

const CONFIG: Record<LoanKind, LoanConfig> = {
  lending: {
    table: 'lendings',
    fk: 'lending_id',
    principalType: 'lend',
    settleType: 'lend_return',
    sign: -1,
  },
  borrowing: {
    table: 'borrowings',
    fk: 'borrowing_id',
    principalType: 'borrow',
    settleType: 'borrow_repay',
    sign: 1,
  },
};

function selectWithTotals(c: LoanConfig): string {
  const principal = `(${c.sign} * COALESCE((SELECT SUM(t.amount) FROM transactions t
      WHERE t.${c.fk} = l.id AND t.type = '${c.principalType}'), 0))`;
  const settled = `(${-c.sign} * COALESCE((SELECT SUM(t.amount) FROM transactions t
      WHERE t.${c.fk} = l.id AND t.type = '${c.settleType}'), 0))`;
  return `SELECT l.*,
      ${principal} AS principal,
      ${settled}   AS settled,
      (${principal} - ${settled}) AS remaining,
      (SELECT MIN(t.date) FROM transactions t
        WHERE t.${c.fk} = l.id AND t.type = '${c.principalType}') AS started_on
    FROM ${c.table} l`;
}

export async function listLoans(
  kind: LoanKind,
  includeArchived = false,
): Promise<LoanWithTotals[]> {
  const c = CONFIG[kind];
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE l.is_archived = 0';
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `${selectWithTotals(c)} ${where} ORDER BY l.created_at DESC`,
  );
  return rows.map((r) => LoanWithTotalsSchema.parse(r));
}

/** Total still outstanding (money owed to you, or money you owe). */
export async function getLoanTotal(kind: LoanKind): Promise<number> {
  const loans = await listLoans(kind, false);
  return loans.reduce((sum, l) => sum + Math.max(l.remaining, 0), 0);
}

export interface CreateLoanInput {
  person: string;
  /** Positive paise lent or borrowed. */
  amount: number;
  accountId: number;
  date?: string;
  notes?: string | null;
}

/** Creates the loan record and its principal ledger row atomically. */
export async function createLoan(kind: LoanKind, input: CreateLoanInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Amount must be greater than zero.');
  const c = CONFIG[kind];
  const db = await getDb();
  const date = input.date ?? todayISODate();
  const notes = input.notes ?? null;
  let loanId = 0;

  await db.withTransactionAsync(async () => {
    const created = await db.runAsync(
      `INSERT INTO ${c.table} (person, notes) VALUES (?, ?)`,
      [input.person.trim(), notes],
    );
    loanId = created.lastInsertRowId;
    await db.runAsync(
      `INSERT INTO transactions (type, amount, account_id, ${c.fk}, counterparty, date, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        c.principalType,
        c.sign * input.amount,
        input.accountId,
        loanId,
        input.person.trim(),
        date,
        notes,
      ],
    );
  });

  return loanId;
}

export interface LoanPaymentInput {
  loanId: number;
  /** Positive paise being returned to you, or repaid by you. */
  amount: number;
  accountId: number;
  person: string;
  date?: string;
  notes?: string | null;
}

/** Records a full or partial repayment against a loan. */
export async function addLoanPayment(kind: LoanKind, input: LoanPaymentInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Amount must be greater than zero.');
  const c = CONFIG[kind];
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO transactions (type, amount, account_id, ${c.fk}, counterparty, date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      c.settleType,
      -c.sign * input.amount,
      input.accountId,
      input.loanId,
      input.person.trim(),
      input.date ?? todayISODate(),
      input.notes ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export async function updateLoan(
  kind: LoanKind,
  id: number,
  edit: { person: string; notes: string | null },
): Promise<void> {
  const c = CONFIG[kind];
  const db = await getDb();
  await db.runAsync(
    `UPDATE ${c.table} SET person = ?, notes = ?, updated_at = datetime('now') WHERE id = ?`,
    [edit.person.trim(), edit.notes, id],
  );
}

export async function archiveLoan(kind: LoanKind, id: number): Promise<void> {
  const c = CONFIG[kind];
  const db = await getDb();
  await db.runAsync(
    `UPDATE ${c.table} SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
}
