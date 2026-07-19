/**
 * Derives the dashboard's headline figures from current data.
 *
 * As of M5 every component of the Safe To Spend formula is live:
 *   cash (accounts) + owed to you (lending) − you owe (borrowing)
 *   − unpaid billed card statements
 * Investments stay excluded (locked) when they arrive in M6.
 */

import { useMemo } from 'react';

import { useAccounts } from '@/hooks/use-accounts';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useLoans } from '@/hooks/use-loans';
import {
  computeNetAvailableBalance,
  computeSafeToSpend,
  type FinancialPosition,
} from '@/domain/safe-to-spend';

export interface DashboardFigures {
  position: FinancialPosition;
  totalCash: number;
  cardOutstanding: number;
  owedToMe: number;
  iOwe: number;
  safeToSpend: number;
  netAvailable: number;
  isLoading: boolean;
}

export function useFinancialPosition(): DashboardFigures {
  const { data: accounts, isLoading: accountsLoading } = useAccounts();
  const { data: cards, isLoading: cardsLoading } = useCreditCards();
  const { data: lendings } = useLoans('lending');
  const { data: borrowings } = useLoans('borrowing');

  return useMemo(() => {
    const totalCash = (accounts ?? []).reduce((sum, a) => sum + a.current_balance, 0);
    const cardOutstanding = (cards ?? []).reduce((sum, c) => sum + c.current_outstanding, 0);
    const ccStatementsOutstanding = (cards ?? []).reduce(
      (sum, c) => sum + c.statement_outstanding,
      0,
    );
    const owedToMe = (lendings ?? []).reduce((sum, l) => sum + Math.max(l.remaining, 0), 0);
    const iOwe = (borrowings ?? []).reduce((sum, l) => sum + Math.max(l.remaining, 0), 0);

    const position: FinancialPosition = {
      totalCash,
      owedToMe,
      iOwe,
      ccStatementsOutstanding,
    };
    return {
      position,
      totalCash,
      cardOutstanding,
      owedToMe,
      iOwe,
      safeToSpend: computeSafeToSpend(position),
      netAvailable: computeNetAvailableBalance(position),
      isLoading: accountsLoading || cardsLoading,
    };
  }, [accounts, cards, lendings, borrowings, accountsLoading, cardsLoading]);
}
