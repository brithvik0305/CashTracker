/**
 * Weekly spending indicator (frozen thresholds).
 *
 * Compares spending against income for the financial week:
 *   green  : spent < 50%
 *   yellow : 50% ≤ spent < 80%
 *   orange : 80% ≤ spent < 100%
 *   red    : spent ≥ 100%  (exactly 100% is red), or spending with no income
 *
 * Inputs are paise. `ratio` is spent/income; `percent` is that as 0..100+ for
 * display; the progress bar caps its fill at 100%.
 */

export type SpendingTier = 'green' | 'yellow' | 'orange' | 'red';

export interface SpendingStatus {
  tier: SpendingTier;
  ratio: number;
  percent: number;
  label: string;
}

const LABELS: Record<SpendingTier, string> = {
  green: 'On track',
  yellow: 'Watch your spending',
  orange: 'Close to your limit',
  red: 'Over your weekly income',
};

export function getSpendingStatus(spent: number, income: number): SpendingStatus {
  if (income <= 0) {
    // No income this week: any spending is over budget; nothing is on track.
    const tier: SpendingTier = spent > 0 ? 'red' : 'green';
    return { tier, ratio: spent > 0 ? Infinity : 0, percent: spent > 0 ? 100 : 0, label: LABELS[tier] };
  }

  const ratio = spent / income;
  let tier: SpendingTier;
  if (ratio < 0.5) tier = 'green';
  else if (ratio < 0.8) tier = 'yellow';
  else if (ratio < 1) tier = 'orange';
  else tier = 'red';

  return { tier, ratio, percent: ratio * 100, label: LABELS[tier] };
}
