/**
 * Account data hooks (TanStack Query).
 *
 * Reads expose accounts with live balances; mutations invalidate the accounts
 * query so every derived value — Total Cash, Safe To Spend — recomputes on its
 * own after any change.
 */

import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { useInvalidateMoney } from '@/hooks/use-invalidate-money';
import {
  archiveAccount,
  createAccount,
  listAccountsWithBalance,
  setBalance,
  updateAccount,
  type AccountEdit,
  type NewAccount,
} from '@/repositories/accounts-repository';
import { createTransfer, type TransferInput } from '@/repositories/transactions-repository';

export function useAccounts() {
  return useQuery({
    queryKey: queryKeys.accounts,
    queryFn: () => listAccountsWithBalance(false),
  });
}

export function useCreateAccount() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: NewAccount) => createAccount(input),
    onSuccess: invalidate,
  });
}

export function useUpdateAccount() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, edit }: { id: number; edit: AccountEdit }) => updateAccount(id, edit),
    onSuccess: invalidate,
  });
}

export function useArchiveAccount() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (id: number) => archiveAccount(id),
    onSuccess: invalidate,
  });
}

export function useSetBalance() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, target }: { id: number; target: number }) => setBalance(id, target),
    onSuccess: invalidate,
  });
}

export function useTransfer() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: TransferInput) => createTransfer(input),
    onSuccess: invalidate,
  });
}
