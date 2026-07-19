/**
 * Record money lent or borrowed. Lending moves money out of an account;
 * borrowing brings money in. Neither counts as income or an expense.
 */

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useCreateLoan } from '@/hooks/use-loans';
import { toISODate } from '@/lib/date';
import type { LoanKind } from '@/schemas/loan';

const COPY = {
  lending: {
    title: 'Lend money',
    amount: 'Amount lent',
    person: 'Who did you lend to?',
    account: 'Paid from',
    submit: 'Record loan',
  },
  borrowing: {
    title: 'Borrow money',
    amount: 'Amount borrowed',
    person: 'Who did you borrow from?',
    account: 'Received into',
    submit: 'Record borrowing',
  },
} as const;

export function AddLoanModal({
  kind,
  visible,
  onClose,
}: {
  kind: LoanKind;
  visible: boolean;
  onClose: () => void;
}) {
  const copy = COPY[kind];
  const { data: accounts } = useAccounts();
  const create = useCreateLoan(kind);

  const [person, setPerson] = useState('');
  const [amount, setAmount] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const list = accounts ?? [];

  useEffect(() => {
    if (visible) {
      setPerson('');
      setAmount(null);
      setAccountId(list[0]?.id ?? null);
      setDate(new Date());
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const valid = person.trim().length > 0 && accountId != null && amount != null && amount > 0;

  const submit = async () => {
    if (!valid) return;
    await create.mutateAsync({
      person,
      amount,
      accountId,
      date: toISODate(date),
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title={copy.title}>
      {list.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Add a bank account first (Accounts tab) so the money has somewhere to move.
        </ThemedText>
      ) : (
        <>
          <MoneyInput label={copy.amount} onChangePaise={setAmount} autoFocus />
          <TextField
            label="Person"
            placeholder={copy.person}
            value={person}
            onChangeText={setPerson}
          />
          <SegmentedControl
            label={copy.account}
            value={accountId ?? list[0].id}
            onChange={setAccountId}
            options={list.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
          <View style={{ marginTop: Spacing.two }}>
            <Button
              title={copy.submit}
              onPress={submit}
              loading={create.isPending}
              disabled={!valid}
            />
          </View>
        </>
      )}
    </AppModal>
  );
}
