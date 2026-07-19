/**
 * Current financial week (Wed→Tue): income, spending, and the spending-indicator
 * status. Spending = expenses + credit-card bill payments (frozen decision #6).
 */

import { useQuery } from '@tanstack/react-query';
import { subDays } from 'date-fns';

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

export interface PreviousWeekSummary {
  income: number;
  spending: number;
  savings: number;
  startISO: string;
  endISO: string;
}

/** How the week that just ended closed out — shown on payday (Wednesday). */
export function usePreviousWeekSummary() {
  return useQuery<PreviousWeekSummary>({
    queryKey: [...queryKeys.weeklySummary, 'previous'],
    queryFn: async () => {
      const thisWeek = currentFinancialWeek(new Date());
      const previous = currentFinancialWeek(subDays(thisWeek.start, 1));
      const range = toISODateRange(previous);
      const [income, spending] = await Promise.all([
        getIncomeTotal(range),
        getSpendingTotal(range),
      ]);
      return {
        income,
        spending,
        savings: income - spending,
        startISO: range.startISO,
        endISO: range.endISO,
      };
    },
  });
}
