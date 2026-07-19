/**
 * Current financial week (Wed→Tue): income, spending, and the spending-indicator
 * status. Spending = expenses + credit-card bill payments (frozen decision #6).
 */

import { useQuery } from '@tanstack/react-query';

import { currentFinancialWeek, toISODateRange } from '@/domain/periods';
import { getSpendingStatus, type SpendingStatus } from '@/domain/spending-indicator';
import { queryKeys } from '@/lib/query-client';
import { getIncomeTotal, getSpendingTotal } from '@/repositories/summary-repository';

export interface WeeklySummary {
  income: number;
  spending: number;
  startISO: string;
  endISO: string;
  status: SpendingStatus;
}

export function useWeeklySummary() {
  return useQuery<WeeklySummary>({
    queryKey: queryKeys.weeklySummary,
    queryFn: async () => {
      const range = toISODateRange(currentFinancialWeek(new Date()));
      const [income, spending] = await Promise.all([
        getIncomeTotal(range),
        getSpendingTotal(range),
      ]);
      return {
        income,
        spending,
        startISO: range.startISO,
        endISO: range.endISO,
        status: getSpendingStatus(spending, income),
      };
    },
  });
}
