/** Investment data hooks (TanStack Query). */

import { useMutation, useQuery } from '@tanstack/react-query';

import { useInvalidateMoney } from '@/hooks/use-invalidate-money';
import { queryKeys } from '@/lib/query-client';
import {
  addContribution,
  archiveInvestment,
  createInvestment,
  listInvestments,
  updateInvestment,
  withdrawInvestment,
  type InvestmentEdit,
  type InvestmentFlowInput,
  type NewInvestment,
} from '@/repositories/investments-repository';

export function useInvestments() {
  return useQuery({
    queryKey: queryKeys.investments,
    queryFn: () => listInvestments(false),
  });
}

export function useCreateInvestment() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: NewInvestment) => createInvestment(input),
    onSuccess: invalidate,
  });
}

export function useAddContribution() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: InvestmentFlowInput) => addContribution(input),
    onSuccess: invalidate,
  });
}

export function useWithdrawInvestment() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: InvestmentFlowInput) => withdrawInvestment(input),
    onSuccess: invalidate,
  });
}

export function useUpdateInvestment() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, edit }: { id: number; edit: InvestmentEdit }) => updateInvestment(id, edit),
    onSuccess: invalidate,
  });
}

export function useArchiveInvestment() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (id: number) => archiveInvestment(id),
    onSuccess: invalidate,
  });
}
