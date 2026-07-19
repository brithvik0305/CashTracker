/**
 * Net Worth (paise).
 *
 *   Net Worth = Cash + Owed To Me + Investments − You Owe − Total card debt
 *
 * Two deliberate differences from Safe To Spend:
 *  - Investments COUNT here (they are wealth) but never in Safe To Spend (locked).
 *  - The FULL card outstanding is subtracted, not just the billed statement,
 *    because unbilled spending is still debt you carry.
 */

export interface NetWorthInputs {
  totalCash: number;
  owedToMe: number;
  iOwe: number;
  investments: number;
  /** Total outstanding across cards, including unbilled spending. */
  cardOutstandingTotal: number;
}

export function computeNetWorth(i: NetWorthInputs): number {
  return i.totalCash + i.owedToMe + i.investments - i.iOwe - i.cardOutstandingTotal;
}
