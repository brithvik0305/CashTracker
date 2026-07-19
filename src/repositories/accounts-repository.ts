/**
 * Accounts repository.
 *
 * Balances are always DERIVED from the ledger (opening_balance + SUM of signed
 * amounts) — never stored and kept in sync. A manual balance override is just an
 * `adjustment` transaction for the difference, so the ledger stays authoritative.
 */

import { getDb } from '@/db';
import { todayISODate } from '@/lib/date';
import {
  AccountWithBalanceSchema,
  type AccountType,
  type AccountWithBalance,
} from '@/schemas/account';
import { createTransaction } from '@/repositories/transactions-repository';

/** SQL expression: an account's live balance from opening + ledger sum. */
const BALANCE_EXPR = `a.opening_balance + COALESCE(
  (SELECT SUM(t.amount) FROM transactions t WHERE t.account_id = a.id), 0)`;

export async function listAccountsWithBalance(
  includeArchived = false,
): Promise<AccountWithBalance[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE a.is_archived = 0';
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT a.*, ${BALANCE_EXPR} AS current_balance
     FROM accounts a ${where}
     ORDER BY a.sort_order, a.id`,
  );
  return rows.map((r) => AccountWithBalanceSchema.parse(r));
}

export async function getAccountWithBalance(id: number): Promise<AccountWithBalance | null> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    `SELECT a.*, ${BALANCE_EXPR} AS current_balance FROM accounts a WHERE a.id = ?`,
    [id],
  );
  return row ? AccountWithBalanceSchema.parse(row) : null;
}

/** Total cash = sum of all non-archived account balances (paise). */
export async function getTotalCash(): Promise<number> {
  const accounts = await listAccountsWithBalance(false);
  return accounts.reduce((sum, a) => sum + a.current_balance, 0);
}

export interface NewAccount {
  name: string;
  type: AccountType;
  /** Opening balance in paise. */
  opening_balance: number;
}

export async function createAccount(input: NewAccount): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO accounts (name, type, opening_balance, sort_order)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM accounts))`,
    [input.name.trim(), input.type, input.opening_balance],
  );
  return result.lastInsertRowId;
}

export interface AccountEdit {
  name: string;
  type: AccountType;
}

export async function updateAccount(id: number, edit: AccountEdit): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE accounts SET name = ?, type = ?, updated_at = datetime('now') WHERE id = ?`,
    [edit.name.trim(), edit.type, id],
  );
}

export async function archiveAccount(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE accounts SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
}

/**
 * Set an account's balance to an exact value by recording the difference as an
 * `adjustment` ledger entry. No-op if the balance is already the target.
 */
export async function setBalance(accountId: number, targetPaise: number): Promise<void> {
  const account = await getAccountWithBalance(accountId);
  if (!account) throw new Error('Account not found.');

  const delta = targetPaise - account.current_balance;
  if (delta === 0) return;

  await createTransaction({
    type: 'adjustment',
    amount: delta,
    account_id: accountId,
    date: todayISODate(),
    notes: 'Manual balance adjustment',
  });
}
