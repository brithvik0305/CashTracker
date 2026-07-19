/**
 * Shared TanStack Query client.
 *
 * Data lives in a local SQLite file, so we never refetch on window focus or
 * reconnect. Instead, mutations invalidate query keys and derived values
 * (Safe To Spend, weekly totals) recompute automatically.
 */

import { QueryClient } from '@tanstack/react-query';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Infinity,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      retry: false,
    },
  },
});

/** Central registry of query keys, so invalidation stays consistent as features grow. */
export const queryKeys = {
  settings: ['settings'] as const,
  accounts: ['accounts'] as const,
  categories: ['categories'] as const,
  creditCards: ['creditCards'] as const,
  lendings: ['loans', 'lending'] as const,
  borrowings: ['loans', 'borrowing'] as const,
  recentTransactions: ['transactions', 'recent'] as const,
  incomeSummary: ['summary', 'income'] as const,
  weeklySummary: ['summary', 'weekly'] as const,
} as const;

/** Query keys that any money movement can affect — invalidate together after writes. */
export const moneyQueryKeys = [
  queryKeys.accounts,
  queryKeys.creditCards,
  queryKeys.lendings,
  queryKeys.borrowings,
  queryKeys.recentTransactions,
  queryKeys.incomeSummary,
  queryKeys.weeklySummary,
] as const;
