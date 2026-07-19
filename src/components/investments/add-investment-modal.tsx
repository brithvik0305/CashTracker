/**
 * Start a new investment. The amount moves out of a bank account, so cash and
 * Safe To Spend fall, but Net Worth is unchanged — the money is just relocated.
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
import { useCreateInvestment } from '@/hooks/use-investments';
import { toISODate } from '@/lib/date';
import { INVESTMENT_TYPE_LABELS, type InvestmentType } from '@/schemas/investment';

const TYPE_OPTIONS = (Object.keys(INVESTMENT_TYPE_LABELS) as InvestmentType[]).map((value) => ({
  label: INVESTMENT_TYPE_LABELS[value],
  value,
}));

export function AddInvestmentModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { data: accounts } = useAccounts();
  const create = useCreateInvestment();

  const [name, setName] = useState('');
  const [type, setType] = useState<InvestmentType>('mutual_fund');
  const [amount, setAmount] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const list = accounts ?? [];

  useEffect(() => {
    if (visible) {
      setName('');
      setType('mutual_fund');
      setAmount(null);
      setAccountId(list[0]?.id ?? null);
      setDate(new Date());
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const valid = name.trim().length > 0 && accountId != null && amount != null && amount > 0;

  const submit = async () => {
    if (!valid) return;
    await create.mutateAsync({
      name,
      type,
      amount,
      accountId,
      date: toISODate(date),
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add investment">
      {list.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Add a bank account first (Accounts tab) so the money has somewhere to come from.
        </ThemedText>
      ) : (
        <>
          <MoneyInput label="Amount invested" onChangePaise={setAmount} autoFocus />
          <TextField
            label="Name"
            placeholder="e.g. Nifty 50 Index Fund"
            value={name}
            onChangeText={setName}
          />
          <SegmentedControl label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
          <SegmentedControl
            label="Paid from"
            value={accountId ?? list[0].id}
            onChange={setAccountId}
            options={list.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
          <View style={{ marginTop: Spacing.two }}>
            <Button
              title="Add investment"
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
