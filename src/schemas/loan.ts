/**
 * Shared schema for lending and borrowing records.
 *
 * The two are mirror images, so one schema serves both. Amounts are derived from
 * the ledger (all paise):
 *   principal = total lent / borrowed
 *   settled   = total returned to you / repaid by you
 *   remaining = principal − settled  (what still counts towards Safe To Spend)
 */

import { z } from 'zod';

export type LoanKind = 'lending' | 'borrowing';

export const LoanSchema = z.object({
  id: z.number().int(),
  person: z.string(),
  notes: z.string().nullable(),
  is_archived: z.union([z.literal(0), z.literal(1)]).transform((v) => v === 1),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Loan = z.infer<typeof LoanSchema>;

export const LoanWithTotalsSchema = LoanSchema.extend({
  principal: z.number().int(),
  settled: z.number().int(),
  remaining: z.number().int(),
  started_on: z.string().nullable(),
});
export type LoanWithTotals = z.infer<typeof LoanWithTotalsSchema>;
