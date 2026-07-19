/**
 * Everything the monthly statement needs, for one calendar month:
 * headline totals, spending by category, a Wed→Tue weekly breakdown
 * (income / spending / savings), card flows, and loan flows.
 */

import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';

import {
  currentMonth,
  financialWeeksInRange,
  toISODateRange,
  type DateRange,
} from '@/domain/periods';
import { computeSavings, computeSpending, type PeriodTotals } from '@/domain/statement';
import { queryKeys } from '@/lib/query-client';
import { getIncomeTotal, getSpendingTotal } from '@/repositories/summary-repository';
import {
  getCardFlows,
  getLoanFlows,
  getPeriodTotals,
  getSpendingByCategory,
  type CardFlows,
  type CategoryTotal,
  type LoanFlows,
} from '@/repositories/statements-repository';

export interface WeekBreakdown {
  label: string;
  startISO: string;
  income: number;
  spending: number;
  savings: number;
}

export interface MonthlyStatement {
  totals: PeriodTotals;
  spending: number;
  savings: number;
  byCategory: CategoryTotal[];
  weeks: WeekBreakdown[];
  cards: CardFlows;
  loans: LoanFlows;
}

async function buildWeeks(month: DateRange): Promise<WeekBreakdown[]> {
  const weeks = financialWeeksInRange(month);
  return Promise.all(
    weeks.map(async (week) => {
      const range = toISODateRange(week);
      const [income, spending] = await Promise.all([
        getIncomeTotal(range),
        getSpendingTotal(range),
      ]);
      return {
        label: format(week.start, 'd MMM'),
        startISO: range.startISO,
        income,
        spending,
        savings: computeSavings(income, spending),
      };
    }),
  );
}

export function useMonthlyStatement(month: Date) {
  const monthKey = format(month, 'yyyy-MM');

  return useQuery<MonthlyStatement>({
    queryKey: [...queryKeys.statement, monthKey],
    queryFn: async () => {
      const range = currentMonth(month);
      const iso = toISODateRange(range);

      const [totals, byCategory, weeks, cards, loans] = await Promise.all([
        getPeriodTotals(iso),
        getSpendingByCategory(iso),
        buildWeeks(range),
        getCardFlows(iso),
        getLoanFlows(iso),
      ]);

      const spending = computeSpending(totals.expenses, totals.cardPayments);
      return {
        totals,
        spending,
        savings: computeSavings(totals.income, spending),
        byCategory,
        weeks,
        cards,
        loans,
      };
    },
  });
}
