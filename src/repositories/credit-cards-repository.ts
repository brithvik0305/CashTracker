/**
 * Credit cards repository.
 *
 * Like account balances, card balances are derived from the ledger:
 *   current_outstanding   = opening_outstanding + SUM(ledger amounts for the card)
 *   statement_outstanding = latest statement_amount minus payments made on/after
 *                           statement_date, clamped to [0, statement_amount]
 *   available_credit      = credit_limit − current_outstanding
 */

import { getDb } from '@/db';
import { todayISODate } from '@/lib/date';
import { createTransaction } from '@/repositories/transactions-repository';
import {
  CreditCardWithBalancesSchema,
  type CreditCardWithBalances,
} from '@/schemas/credit-card';

const OUTSTANDING = `c.opening_outstanding + COALESCE(
  (SELECT SUM(t.amount) FROM transactions t WHERE t.credit_card_id = c.id), 0)`;

const PAID_SINCE_STATEMENT = `COALESCE((
  SELECT SUM(-t.amount) FROM transactions t
  WHERE t.credit_card_id = c.id AND t.type = 'cc_payment'
    AND c.statement_date IS NOT NULL AND t.date >= c.statement_date), 0)`;

const STATEMENT_OUTSTANDING = `CASE WHEN c.statement_date IS NULL THEN 0
  ELSE MAX(0, c.statement_amount - ${PAID_SINCE_STATEMENT}) END`;

const SELECT_WITH_BALANCES = `SELECT c.*,
    (${OUTSTANDING})                 AS current_outstanding,
    (${STATEMENT_OUTSTANDING})       AS statement_outstanding,
    (c.credit_limit - (${OUTSTANDING})) AS available_credit
  FROM credit_cards c`;

export async function listCreditCards(
  includeArchived = false,
): Promise<CreditCardWithBalances[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE c.is_archived = 0';
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `${SELECT_WITH_BALANCES} ${where} ORDER BY c.sort_order, c.id`,
  );
  return rows.map((r) => CreditCardWithBalancesSchema.parse(r));
}

export interface NewCreditCard {
  name: string;
  credit_limit: number;
  opening_outstanding: number;
}

export async function createCreditCard(input: NewCreditCard): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO credit_cards (name, credit_limit, opening_outstanding, sort_order)
     VALUES (?, ?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM credit_cards))`,
    [input.name.trim(), input.credit_limit, input.opening_outstanding],
  );
  return result.lastInsertRowId;
}

export interface CreditCardEdit {
  name: string;
  credit_limit: number;
}

export async function updateCreditCard(id: number, edit: CreditCardEdit): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE credit_cards SET name = ?, credit_limit = ?, updated_at = datetime('now') WHERE id = ?`,
    [edit.name.trim(), edit.credit_limit, id],
  );
}

export interface StatementInput {
  statement_amount: number;
  statement_date: string | null;
  due_date: string | null;
}

/** Record a new billed statement (amount + statement/due dates). */
export async function recordStatement(id: number, input: StatementInput): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE credit_cards
     SET statement_amount = ?, statement_date = ?, due_date = ?, updated_at = datetime('now')
     WHERE id = ?`,
    [input.statement_amount, input.statement_date, input.due_date, id],
  );
}

/**
 * Correct a card's outstanding balance to an exact figure by recording the
 * difference as an adjustment. The entry carries no bank account, so it moves
 * the card balance without pretending money left an account.
 */
export async function setCardOutstanding(id: number, targetPaise: number): Promise<void> {
  const card = (await listCreditCards(true)).find((c) => c.id === id);
  if (!card) throw new Error('Card not found.');

  const delta = targetPaise - card.current_outstanding;
  if (delta === 0) return;

  await createTransaction({
    type: 'adjustment',
    amount: delta,
    credit_card_id: id,
    account_id: null,
    date: todayISODate(),
    notes: 'Manual outstanding adjustment',
  });
}

export async function archiveCreditCard(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE credit_cards SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
}

export interface CardTotals {
  /** Sum of current outstanding across cards (total debt). */
  outstanding: number;
  /** Sum of unpaid billed statements (the amount Safe To Spend subtracts). */
  statementOutstanding: number;
}

export async function getCardTotals(): Promise<CardTotals> {
  const cards = await listCreditCards(false);
  return {
    outstanding: cards.reduce((s, c) => s + c.current_outstanding, 0),
    statementOutstanding: cards.reduce((s, c) => s + c.statement_outstanding, 0),
  };
}
