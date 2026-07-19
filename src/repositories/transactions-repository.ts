/**
 * Transactions repository — writes to the unified ledger.
 *
 * `amount` is the signed paise effect on `account_id`. Multi-leg operations
 * (transfers) are written atomically so a balance can never end up half-updated.
 */

import { getDb } from '@/db';
import { makeId } from '@/lib/id';
import { todayISODate } from '@/lib/date';
import {
  TransactionListItemSchema,
  TransactionSchema,
  type Transaction,
  type TransactionListItem,
  type TransactionType,
} from '@/schemas/transaction';

export interface NewTransaction {
  type: TransactionType;
  /** Signed paise effect on the account (positive raises balance). */
  amount: number;
  account_id?: number | null;
  category_id?: number | null;
  counterparty?: string | null;
  transfer_group_id?: string | null;
  date: string; // 'YYYY-MM-DD'
  notes?: string | null;
}

export async function createTransaction(tx: NewTransaction): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO transactions
       (type, amount, account_id, category_id, counterparty, transfer_group_id, date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tx.type,
      tx.amount,
      tx.account_id ?? null,
      tx.category_id ?? null,
      tx.counterparty ?? null,
      tx.transfer_group_id ?? null,
      tx.date,
      tx.notes ?? null,
    ],
  );
  return result.lastInsertRowId;
}

export interface IncomeInput {
  accountId: number;
  /** Positive paise received. */
  amount: number;
  client?: string | null;
  date?: string;
  notes?: string | null;
}

/** Income raises the receiving account's balance. Never a category. */
export async function addIncome(input: IncomeInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Income must be greater than zero.');
  return createTransaction({
    type: 'income',
    amount: input.amount,
    account_id: input.accountId,
    counterparty: input.client?.trim() || null,
    date: input.date ?? todayISODate(),
    notes: input.notes ?? null,
  });
}

export interface ExpenseInput {
  accountId: number;
  categoryId: number;
  /** Positive paise spent. */
  amount: number;
  date?: string;
  notes?: string | null;
}

/** An expense lowers the paying account's balance and links a category. */
export async function addExpense(input: ExpenseInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Expense must be greater than zero.');
  return createTransaction({
    type: 'expense',
    amount: -input.amount,
    account_id: input.accountId,
    category_id: input.categoryId,
    date: input.date ?? todayISODate(),
    notes: input.notes ?? null,
  });
}

/**
 * Recent ledger rows enriched with account/category names, most recent first.
 * Transfers appear once (the outgoing leg) rather than as two rows.
 */
export async function listRecentTransactions(limit = 8): Promise<TransactionListItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT t.*, a.name AS account_name, c.name AS category_name
     FROM transactions t
     LEFT JOIN accounts a   ON a.id = t.account_id
     LEFT JOIN categories c ON c.id = t.category_id
     WHERE t.type != 'transfer' OR t.amount < 0
     ORDER BY t.date DESC, t.created_at DESC
     LIMIT ?`,
    [limit],
  );
  return rows.map((r) => TransactionListItemSchema.parse(r));
}

export interface TransferInput {
  fromAccountId: number;
  toAccountId: number;
  /** Positive paise amount to move. */
  amount: number;
  date: string;
  notes?: string | null;
}

/**
 * Internal transfer between two of your own accounts. Written as two linked
 * ledger rows (−amount out, +amount in). Never counts as income or expense.
 */
export async function createTransfer(input: TransferInput): Promise<string> {
  if (input.fromAccountId === input.toAccountId) {
    throw new Error('Choose two different accounts.');
  }
  if (input.amount <= 0) {
    throw new Error('Transfer amount must be greater than zero.');
  }

  const db = await getDb();
  const group = makeId('xfer');
  await db.withTransactionAsync(async () => {
    await db.runAsync(
      `INSERT INTO transactions (type, amount, account_id, transfer_group_id, date, notes)
       VALUES ('transfer', ?, ?, ?, ?, ?)`,
      [-input.amount, input.fromAccountId, group, input.date, input.notes ?? null],
    );
    await db.runAsync(
      `INSERT INTO transactions (type, amount, account_id, transfer_group_id, date, notes)
       VALUES ('transfer', ?, ?, ?, ?, ?)`,
      [input.amount, input.toAccountId, group, input.date, input.notes ?? null],
    );
  });
  return group;
}

/** All ledger rows for an account, most recent first. */
export async function listTransactionsByAccount(accountId: number): Promise<Transaction[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM transactions WHERE account_id = ? ORDER BY date DESC, created_at DESC`,
    [accountId],
  );
  return rows.map((r) => TransactionSchema.parse(r));
}

export async function deleteTransaction(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}
