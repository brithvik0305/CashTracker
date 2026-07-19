/**
 * The core financial calculations (frozen spec).
 *
 * All values are integer paise.
 *
 *   Safe To Spend        = Cash + Owed To Me − I Owe − Outstanding CC statements
 *   Net Available Balance = Cash − I Owe − Outstanding CC statements
 *
 * Investments are excluded from both (locked). Savings live inside the bank
 * accounts, so they are already part of `totalCash`. Components that aren't
 * tracked yet (owed/owe/card bills) are simply passed as 0 until their
 * milestones land — the formulas never change.
 */

export interface FinancialPosition {
  /** Sum of all non-archived bank/savings account balances. */
  totalCash: number;
  /** Remaining money others owe you (lending). */
  owedToMe: number;
  /** Remaining money you owe others (borrowing). */
  iOwe: number;
  /** Unpaid, billed credit-card statement amounts. */
  ccStatementsOutstanding: number;
}

export const EMPTY_POSITION: FinancialPosition = {
  totalCash: 0,
  owedToMe: 0,
  iOwe: 0,
  ccStatementsOutstanding: 0,
};

export function computeSafeToSpend(p: FinancialPosition): number {
  return p.totalCash + p.owedToMe - p.iOwe - p.ccStatementsOutstanding;
}

export function computeNetAvailableBalance(p: FinancialPosition): number {
  return p.totalCash - p.iOwe - p.ccStatementsOutstanding;
}
