/**
 * Weekly / monthly / yearly income totals (paise), derived from the ledger.
 * Weekly uses the financial week (Wed→Tue); month and year are calendar periods.
 */

import { useQuery } from '@tanstack/react-query';

import {
  currentFinancialWeek,
  currentMonth,
  currentYear,
  toISODateRange,
} from '@/domain/periods';
import { queryKeys } from '@/lib/query-client';
import { getIncomeTotal } from '@/repositories/summary-repository';

export interface IncomeSummary {
  weekly: number;
  monthly: number;
  yearly: number;
}

export function useIncomeSummary() {
  return useQuery<IncomeSummary>({
    queryKey: queryKeys.incomeSummary,
    queryFn: async () => {
      const now = new Date();
      const [weekly, monthly, yearly] = await Promise.all([
        getIncomeTotal(toISODateRange(currentFinancialWeek(now))),
        getIncomeTotal(toISODateRange(currentMonth(now))),
        getIncomeTotal(toISODateRange(currentYear(now))),
      ]);
      return { weekly, monthly, yearly };
    },
  });
}
