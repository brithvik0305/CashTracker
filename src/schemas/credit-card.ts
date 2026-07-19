/**
 * Zod schemas + types for credit cards.
 *
 * Derived balances (all paise):
 *   current_outstanding   = opening_outstanding + SUM(ledger amounts for the card)
 *   statement_outstanding = unpaid portion of the latest billed statement
 *                           (what Safe To Spend subtracts — frozen decision #3)
 *   available_credit      = credit_limit − current_outstanding
 */

import { z } from 'zod';

export const CreditCardSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  credit_limit: z.number().int(),
  opening_outstanding: z.number().int(),
  statement_amount: z.number().int(),
  statement_date: z.string().nullable(),
  due_date: z.string().nullable(),
  is_archived: z.union([z.literal(0), z.literal(1)]).transform((v) => v === 1),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type CreditCard = z.infer<typeof CreditCardSchema>;

export const CreditCardWithBalancesSchema = CreditCardSchema.extend({
  current_outstanding: z.number().int(),
  statement_outstanding: z.number().int(),
  available_credit: z.number().int(),
});
export type CreditCardWithBalances = z.infer<typeof CreditCardWithBalancesSchema>;
