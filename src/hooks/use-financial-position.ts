/**
 * Derives the dashboard's headline figures from the current data.
 *
 * Today only Total Cash is tracked (accounts); owed/owe/card bills are 0 until
 * their milestones land. Because the Safe To Spend and Net Available formulas
 * are additive, wiring those components in later requires no change here.
 */

import { useMemo } from 'react';

import { useAccounts } from '@/hooks/use-accounts';
import {
  computeNetAvailableBalance,
  computeSafeToSpend,
  type FinancialPosition,
} from '@/domain/safe-to-spend';

export interface DashboardFigures {
  position: FinancialPosition;
  totalCash: number;
  safeToSpend: number;
  netAvailable: number;
  isLoading: boolean;
}

export function useFinancialPosition(): DashboardFigures {
  const { data: accounts, isLoading } = useAccounts();

  return useMemo(() => {
    const totalCash = (accounts ?? []).reduce((sum, a) => sum + a.current_balance, 0);
    const position: FinancialPosition = {
      totalCash,
      owedToMe: 0,
      iOwe: 0,
      ccStatementsOutstanding: 0,
    };
    return {
      position,
      totalCash,
      safeToSpend: computeSafeToSpend(position),
      netAvailable: computeNetAvailableBalance(position),
      isLoading,
    };
  }, [accounts, isLoading]);
}
