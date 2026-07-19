/**
 * Zod schemas + types for investments.
 *
 * Derived (all paise):
 *   invested     = total contributed from bank accounts
 *   withdrawn    = total taken back out
 *   net_invested = invested − withdrawn
 *   value        = current_value if set, otherwise net_invested
 *   gain         = value − net_invested
 *
 * Investments raise Net Worth but never Safe To Spend — they are treated as locked.
 */

import { z } from 'zod';

export const InvestmentType = z.enum(['mutual_fund', 'stock', 'gold', 'fd', 'other']);
export type InvestmentType = z.infer<typeof InvestmentType>;

export const INVESTMENT_TYPE_LABELS: Record<InvestmentType, string> = {
  mutual_fund: 'Mutual fund',
  stock: 'Stocks',
  gold: 'Gold',
  fd: 'Fixed deposit',
  other: 'Other',
};

export const InvestmentSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: InvestmentType,
  current_value: z.number().int().nullable(),
  notes: z.string().nullable(),
  is_archived: z.union([z.literal(0), z.literal(1)]).transform((v) => v === 1),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Investment = z.infer<typeof InvestmentSchema>;

export const InvestmentWithTotalsSchema = InvestmentSchema.extend({
  invested: z.number().int(),
  withdrawn: z.number().int(),
  net_invested: z.number().int(),
  value: z.number().int(),
  gain: z.number().int(),
});
export type InvestmentWithTotals = z.infer<typeof InvestmentWithTotalsSchema>;
