/**
 * Derives the dashboard's headline figures from current data.
 *
 * Cash comes from accounts; unpaid billed card statements come from credit cards
 * and are what Safe To Spend / Net Available subtract. Money owed to/by you
 * (lending, borrowing) is still 0 until those milestones land. The formulas are
 * additive, so wiring the remaining components in later requires no change here.
 */

import { useMemo } from 'react';

import { useAccounts } from '@/hooks/use-accounts';
import { useCreditCards } from '@/hooks/use-credit-cards';
import {
  computeNetAvailableBalance,
  computeSafeToSpend,
  type FinancialPosition,
} from '@/domain/safe-to-spend';

export interface DashboardFigures {
  position: FinancialPosition;
  totalCash: number;
  cardOutstanding: number;
  safeToSpend: number;
  netAvailable: number;
  isLoading: boolean;
}

export function useFinancialPosition(): DashboardFigures {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: cards, isLoading: cardsLoading } = useCreditCards();

  return useMemo(() => {
    const totalCash = (accounts ?? []).reduce((sum, a) => sum + a.current_balance, 0);
    const cardOutstanding = (cards ?? []).reduce((sum, c) => sum + c.current_outstanding, 0);
    const ccStatementsOutstanding = (cards ?? []).reduce(
      (sum, c) => sum + c.statement_outstanding,
      0,
    );
    const position: FinancialPosition = {
      totalCash,
      owedToMe: 0,
      iOwe: 0,
      ccStatementsOutstanding,
    };
    return {
      position,
      totalCash,
      cardOutstanding,
      safeToSpend: computeSafeToSpend(position),
      netAvailable: computeNetAvailableBalance(position),
      isLoading: accountsLoading || cardsLoading,
    };
  }, [accounts, cards, accountsLoading, cardsLoading]);
}
