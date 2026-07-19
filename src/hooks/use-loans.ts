/** Lending / borrowing hooks. One set of hooks serves both kinds. */

import { useMutation, useQuery } from '@tanstack/react-query';

import { useInvalidateMoney } from '@/hooks/use-invalidate-money';
import { queryKeys } from '@/lib/query-client';
import {
  addLoanPayment,
  archiveLoan,
  createLoan,
  listLoans,
  updateLoan,
  type CreateLoanInput,
  type LoanPaymentInput,
} from '@/repositories/loans-repository';
import type { LoanKind } from '@/schemas/loan';

function keyFor(kind: LoanKind) {
  return kind === 'lending' ? queryKeys.lendings : queryKeys.borrowings;
}

export function useLoans(kind: LoanKind) {
  return useQuery({
    queryKey: keyFor(kind),
    queryFn: () => listLoans(kind, false),
  });
}

export function useCreateLoan(kind: LoanKind) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CreateLoanInput) => createLoan(kind, input),
    onSuccess: invalidate,
  });
}

export function useAddLoanPayment(kind: LoanKind) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: LoanPaymentInput) => addLoanPayment(kind, input),
    onSuccess: invalidate,
  });
}

export function useUpdateLoan(kind: LoanKind) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, edit }: { id: number; edit: { person: string; notes: string | null } }) =>
      updateLoan(kind, id, edit),
    onSuccess: invalidate,
  });
}

export function useArchiveLoan(kind: LoanKind) {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (id: number) => archiveLoan(kind, id),
    onSuccess: invalidate,
  });
}
