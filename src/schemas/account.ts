/**
 * Zod schemas + types for bank/savings accounts.
 * `is_archived` is stored as 0/1 in SQLite and surfaced as a boolean.
 */

import { z } from 'zod';

export const AccountType = z.enum(['checking', 'savings']);
export type AccountType = z.infer<typeof AccountType>;

export const AccountSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  type: AccountType,
  opening_balance: z.number().int(),
  currency: z.string(),
  is_archived: z.union([z.literal(0), z.literal(1)]).transform((v) => v === 1),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Account = z.infer<typeof AccountSchema>;

/** An account with its live balance derived from the ledger (paise). */
export const AccountWithBalanceSchema = AccountSchema.extend({
  current_balance: z.number().int(),
});
export type AccountWithBalance = z.infer<typeof AccountWithBalanceSchema>;
