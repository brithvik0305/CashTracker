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
  credit_card_id?: number | null;
  lending_id?: number | null;
  borrowing_id?: number | null;
  investment_id?: number | null;
  counterparty?: string | null;
  transfer_group_id?: string | null;
  date: string; // 'YYYY-MM-DD'
  notes?: string | null;
}

export async function createTransaction(tx: NewTransaction): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO transactions
       (type, amount, account_id, category_id, credit_card_id, lending_id, borrowing_id,
        investment_id, counterparty, transfer_group_id, date, notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      tx.type,
      tx.amount,
      tx.account_id ?? null,
      tx.category_id ?? null,
      tx.credit_card_id ?? null,
      tx.lending_id ?? null,
      tx.borrowing_id ?? null,
      tx.investment_id ?? null,
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

export interface CardPurchaseInput {
  cardId: number;
  /** Positive paise charged to the card. */
  amount: number;
  categoryId?: number | null;
  date?: string;
  notes?: string | null;
}

/** A card purchase increases the card's outstanding. It is NOT an expense and touches no bank account. */
export async function addCardPurchase(input: CardPurchaseInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Purchase must be greater than zero.');
  return createTransaction({
    type: 'cc_purchase',
    amount: input.amount,
    credit_card_id: input.cardId,
    category_id: input.categoryId ?? null,
    date: input.date ?? todayISODate(),
    notes: input.notes ?? null,
  });
}

export interface CardPaymentInput {
  cardId: number;
  accountId: number;
  /** Positive paise paid from the bank towards the card. */
  amount: number;
  date?: string;
  notes?: string | null;
}

/** Paying a card bill lowers the bank account and the card outstanding, and counts as spending. */
export async function addCardPayment(input: CardPaymentInput): Promise<number> {
  if (input.amount <= 0) throw new Error('Payment must be greater than zero.');
  return createTransaction({
    type: 'cc_payment',
    amount: -input.amount,
    account_id: input.accountId,
    credit_card_id: input.cardId,
    date: input.date ?? todayISODate(),
    notes: input.notes ?? null,
  });
}

/**
 * Recent ledger rows enriched with account/category/card names, most recent first.
 * Transfers appear once (the outgoing leg) rather than as two rows.
 */
export async function listRecentTransactions(limit = 8): Promise<TransactionListItem[]> {
  const db = await getDb();
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT t.*, a.name AS account_name, c.name AS category_name, cc.name AS card_name,
            inv.name AS investment_name
     FROM transactions t
     LEFT JOIN accounts a      ON a.id = t.account_id
     LEFT JOIN categories c    ON c.id = t.category_id
     LEFT JOIN credit_cards cc ON cc.id = t.credit_card_id
     LEFT JOIN investments inv ON inv.id = t.investment_id
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

/** Delete a transaction; for a transfer, remove BOTH legs so balances stay consistent. */
export async function deleteTransactionCascade(item: TransactionListItem): Promise<void> {
  const db = await getDb();
  if (item.type === 'transfer' && item.transfer_group_id) {
    await db.runAsync('DELETE FROM transactions WHERE transfer_group_id = ?', [
      item.transfer_group_id,
    ]);
  } else {
    await db.runAsync('DELETE FROM transactions WHERE id = ?', [item.id]);
  }
}

export interface EditValues {
  /** Positive paise magnitude; the correct sign is applied per transaction type. */
  amount: number;
  date: string;
  notes: string | null;
  accountId?: number | null;
  cardId?: number | null;
  categoryId?: number | null;
  client?: string | null;
  /** For adjustments only: +1 to increase the balance, -1 to decrease it. */
  direction?: 1 | -1;
}

const TOUCH = "updated_at = datetime('now')";

/**
 * Edit an existing transaction in place. Fields are set according to the row's
 * type, and the signed `amount` is recomputed. Transfers update both legs.
 * Balances are derived, so they correct themselves once the row changes.
 */
export async function editTransaction(item: TransactionListItem, v: EditValues): Promise<void> {
  const db = await getDb();

  switch (item.type) {
    case 'income':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, category_id = NULL,
           credit_card_id = NULL, counterparty = ?, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [v.amount, v.accountId ?? null, v.client ?? null, v.date, v.notes, item.id],
      );
      return;
    case 'expense':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, category_id = ?,
           credit_card_id = NULL, counterparty = NULL, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [-v.amount, v.accountId ?? null, v.categoryId ?? null, v.date, v.notes, item.id],
      );
      return;
    case 'cc_purchase':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = NULL, category_id = ?,
           credit_card_id = ?, counterparty = NULL, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [v.amount, v.categoryId ?? null, v.cardId ?? null, v.date, v.notes, item.id],
      );
      return;
    case 'cc_payment':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, category_id = NULL,
           credit_card_id = ?, counterparty = NULL, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [-v.amount, v.accountId ?? null, v.cardId ?? null, v.date, v.notes, item.id],
      );
      return;
    case 'adjustment':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [(v.direction ?? 1) * v.amount, v.date, v.notes, item.id],
      );
      return;
    // Loan and investment rows keep their record link; only the money moves.
    case 'invest_add':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [-v.amount, v.accountId ?? null, v.date, v.notes, item.id],
      );
      return;
    case 'invest_withdraw':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
        [v.amount, v.accountId ?? null, v.date, v.notes, item.id],
      );
      return;
    case 'lend':
    case 'borrow_repay':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, counterparty = ?, date = ?,
           notes = ?, ${TOUCH} WHERE id = ?`,
        [-v.amount, v.accountId ?? null, v.client ?? item.counterparty, v.date, v.notes, item.id],
      );
      return;
    case 'borrow':
    case 'lend_return':
      await db.runAsync(
        `UPDATE transactions SET amount = ?, account_id = ?, counterparty = ?, date = ?,
           notes = ?, ${TOUCH} WHERE id = ?`,
        [v.amount, v.accountId ?? null, v.client ?? item.counterparty, v.date, v.notes, item.id],
      );
      return;
    case 'transfer': {
      if (!item.transfer_group_id) throw new Error('Transfer has no group.');
      const legs = await db.getAllAsync<{ id: number; amount: number }>(
        'SELECT id, amount FROM transactions WHERE transfer_group_id = ?',
        [item.transfer_group_id],
      );
      await db.withTransactionAsync(async () => {
        for (const leg of legs) {
          const signed = leg.amount < 0 ? -v.amount : v.amount;
          await db.runAsync(
            `UPDATE transactions SET amount = ?, date = ?, notes = ?, ${TOUCH} WHERE id = ?`,
            [signed, v.date, v.notes, leg.id],
          );
        }
      });
      return;
    }
    default:
      throw new Error(`Editing ${item.type} is not supported.`);
  }
}
