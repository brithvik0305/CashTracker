/**
 * Statement arithmetic (paise).
 *
 * Savings is a computed metric only — it appears in the weekly report and
 * monthly statement, never on the dashboard (frozen decision).
 *
 *   spending = expenses + credit-card bill payments
 *   savings  = income − spending
 *
 * Investments are NOT spending: moving cash into an investment relocates money,
 * it doesn't consume it, so it never reduces savings.
 */

export interface PeriodTotals {
  income: number;
  expenses: number;
  cardPayments: number;
  /** Money moved into investments during the period. */
  invested: number;
  /** Money taken back out of investments during the period. */
  withdrawn: number;
  /** Net change in bank cash across the period. */
  netCashFlow: number;
}

export function computeSpending(expenses: number, cardPayments: number): number {
  return expenses + cardPayments;
}

export function computeSavings(income: number, spending: number): number {
  return income - spending;
}

/** Savings as a share of income (0..1). Zero income yields 0. */
export function computeSavingsRate(income: number, spending: number): number {
  if (income <= 0) return 0;
  return computeSavings(income, spending) / income;
}
