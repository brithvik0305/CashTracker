/** Record income into a bank account (client, amount, date, notes). */

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
import { useAddIncome } from '@/hooks/use-transactions';
import { toISODate } from '@/lib/date';

export function AddIncomeModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const add = useAddIncome();

  const [client, setClient] = useState('');
  const [amountPaise, setAmountPaise] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const list = accounts ?? [];

  useEffect(() => {
    if (visible) {
      setClient('');
      setAmountPaise(null);
      setAccountId(list[0]?.id ?? null);
      setDate(new Date());
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const valid = accountId != null && amountPaise != null && amountPaise > 0;

  const submit = async () => {
    if (!valid) return;
    await add.mutateAsync({
      accountId,
      amount: amountPaise,
      client: client.trim() || null,
      date: toISODate(date),
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add income">
      {list.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Add a bank account first (Accounts tab) so income has somewhere to land.
        </ThemedText>
      ) : (
        <>
          <MoneyInput label="Amount received" onChangePaise={setAmountPaise} autoFocus />
          <TextField
            label="Client (optional)"
            placeholder="Who paid you?"
            value={client}
            onChangeText={setClient}
          />
          <SegmentedControl
            label="Into account"
            value={accountId ?? list[0].id}
            onChange={setAccountId}
            options={list.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
          <View style={{ marginTop: Spacing.two }}>
            <Button title="Add income" onPress={submit} loading={add.isPending} disabled={!valid} />
          </View>
        </>
      )}
    </AppModal>
  );
}
