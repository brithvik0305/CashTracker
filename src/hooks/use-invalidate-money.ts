/** Invalidates every query a money movement can affect (balances, summaries, timeline). */

import { useQueryClient } from '@tanstack/react-query';

import { moneyQueryKeys } from '@/lib/query-client';

export function useInvalidateMoney() {
  const client = useQueryClient();
  return () => Promise.all(moneyQueryKeys.map((key) => client.invalidateQueries({ queryKey: key })));
}
