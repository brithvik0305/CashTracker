/** Transaction hooks: recent activity + income/expense entry. */

import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { useInvalidateMoney } from '@/hooks/use-invalidate-money';
import type { TransactionListItem } from '@/schemas/transaction';
import {
  addExpense,
  addIncome,
  deleteTransactionCascade,
  editTransaction,
  listRecentTransactions,
  type EditValues,
  type ExpenseInput,
  type IncomeInput,
} from '@/repositories/transactions-repository';

export function useRecentTransactions(limit = 8) {
  return useQuery({
    queryKey: queryKeys.recentTransactions,
    queryFn: () => listRecentTransactions(limit),
  });
}

export function useAddIncome() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: IncomeInput) => addIncome(input),
    onSuccess: invalidate,
  });
}

export function useAddExpense() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: ExpenseInput) => addExpense(input),
    onSuccess: invalidate,
  });
}

export function useEditTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ item, values }: { item: TransactionListItem; values: EditValues }) =>
      editTransaction(item, values),
    onSuccess: invalidate,
  });
}

export function useDeleteTransaction() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (item: TransactionListItem) => deleteTransactionCascade(item),
    onSuccess: invalidate,
  });
}
