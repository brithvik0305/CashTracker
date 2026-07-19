/** Move money between two of your own accounts (never income/expense). */

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useTransfer } from '@/hooks/use-accounts';
import { todayISODate } from '@/lib/date';
import type { AccountWithBalance } from '@/schemas/account';

interface Props {
  visible: boolean;
  onClose: () => void;
  accounts: AccountWithBalance[];
}

export function TransferModal({ visible, onClose, accounts }: Props) {
  const [fromId, setFromId] = useState<number | null>(null);
  const [toId, setToId] = useState<number | null>(null);
  const [amountPaise, setAmountPaise] = useState<number | null>(null);
  const [notes, setNotes] = useState('');
  const transfer = useTransfer();

  useEffect(() => {
    if (visible && accounts.length >= 2) {
      setFromId(accounts[0].id);
      setToId(accounts[1].id);
      setAmountPaise(null);
      setNotes('');
    }
  }, [visible, accounts]);

  const options = accounts.map((a) => ({ label: a.name, value: a.id }));
  const valid =
    fromId != null && toId != null && fromId !== toId && amountPaise != null && amountPaise > 0;

  const submit = async () => {
    if (!valid) return;
    await transfer.mutateAsync({
      fromAccountId: fromId,
      toAccountId: toId,
      amount: amountPaise,
      date: todayISODate(),
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Transfer">
      <SegmentedControl
        label="From"
        value={fromId ?? options[0]?.value}
        onChange={setFromId}
        options={options}
      />
      <SegmentedControl
        label="To"
        value={toId ?? options[0]?.value}
        onChange={setToId}
        options={options}
      />
      <MoneyInput label="Amount" onChangePaise={setAmountPaise} autoFocus />
      <TextField
        label="Notes (optional)"
        value={notes}
        onChangeText={setNotes}
        placeholder="e.g. moved to savings"
      />
      <View style={{ marginTop: Spacing.two }}>
        <Button
          title="Transfer"
          onPress={submit}
          loading={transfer.isPending}
          disabled={!valid}
        />
      </View>
    </AppModal>
  );
}
