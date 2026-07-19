/** All transactions within a month, newest first (the statement timeline). */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import { currentMonth, toISODateRange } from '@/domain/periods';
import { queryKeys } from '@/lib/query-client';
import { listTransactionsInRange } from '@/repositories/transactions-repository';

export function useTimeline(month: Date) {
  const monthKey = format(month, 'yyyy-MM');

  return useQuery({
    queryKey: [...queryKeys.timeline, monthKey],
    queryFn: () => {
      const { startISO, endISO } = toISODateRange(currentMonth(month));
      return listTransactionsInRange(startISO, endISO);
    },
  });
}
