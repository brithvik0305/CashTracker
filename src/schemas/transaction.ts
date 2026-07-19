/**
 * Zod schemas + types for the unified transaction ledger.
 * Every money movement in the app is a row here; `type` gives it meaning and
 * `amount` is the signed paise effect on `account_id` (see migration v2).
 */

import { z } from 'zod';

export const TransactionType = z.enum([
  'income',
  'expense',
  'cc_purchase',
  'cc_payment',
  'lend',
  'lend_return',
  'borrow',
  'borrow_repay',
  'invest_add',
  'invest_withdraw',
  'transfer',
  'adjustment',
]);
export type TransactionType = z.infer<typeof TransactionType>;

export const TransactionSchema = z.object({
  id: z.number().int(),
  type: TransactionType,
  amount: z.number().int(),
  account_id: z.number().int().nullable(),
  category_id: z.number().int().nullable(),
  credit_card_id: z.number().int().nullable(),
  counterparty: z.string().nullable(),
  transfer_group_id: z.string().nullable(),
  date: z.string(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Transaction = z.infer<typeof TransactionSchema>;

/** A ledger row enriched with joined account/category/card names for display. */
export const TransactionListItemSchema = TransactionSchema.extend({
  account_name: z.string().nullable(),
  category_name: z.string().nullable(),
  card_name: z.string().nullable(),
});
export type TransactionListItem = z.infer<typeof TransactionListItemSchema>;
