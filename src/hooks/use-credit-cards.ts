/** Credit-card data hooks (TanStack Query). */

import { useMutation, useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import { useInvalidateMoney } from '@/hooks/use-invalidate-money';
import {
  archiveCreditCard,
  createCreditCard,
  listCreditCards,
  recordStatement,
  setCardOutstanding,
  updateCreditCard,
  type CreditCardEdit,
  type NewCreditCard,
  type StatementInput,
} from '@/repositories/credit-cards-repository';
import {
  addCardPayment,
  addCardPurchase,
  type CardPaymentInput,
  type CardPurchaseInput,
} from '@/repositories/transactions-repository';

export function useCreditCards() {
  return useQuery({
    queryKey: queryKeys.creditCards,
    queryFn: () => listCreditCards(false),
  });
}

export function useCreateCard() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: NewCreditCard) => createCreditCard(input),
    onSuccess: invalidate,
  });
}

export function useUpdateCard() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, edit }: { id: number; edit: CreditCardEdit }) => updateCreditCard(id, edit),
    onSuccess: invalidate,
  });
}

export function useRecordStatement() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: StatementInput }) => recordStatement(id, input),
    onSuccess: invalidate,
  });
}

export function useSetCardOutstanding() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: ({ id, target }: { id: number; target: number }) => setCardOutstanding(id, target),
    onSuccess: invalidate,
  });
}

export function useArchiveCard() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (id: number) => archiveCreditCard(id),
    onSuccess: invalidate,
  });
}

export function useAddCardPurchase() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CardPurchaseInput) => addCardPurchase(input),
    onSuccess: invalidate,
  });
}

export function useAddCardPayment() {
  const invalidate = useInvalidateMoney();
  return useMutation({
    mutationFn: (input: CardPaymentInput) => addCardPayment(input),
    onSuccess: invalidate,
  });
}
