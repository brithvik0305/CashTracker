/** Record an expense leaving a bank account (amount, category, account, date, notes). */

import { useEffect, useState } from 'react';
import { View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { DateField } from '@/components/ui/date-field';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useAddExpense } from '@/hooks/use-transactions';
import { toISODate } from '@/lib/date';

export function AddExpenseModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const { data: categories } = useCategories();
  const add = useAddExpense();

  const [amountPaise, setAmountPaise] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const accountList = accounts ?? [];
  const categoryList = categories ?? [];

  useEffect(() => {
    if (visible) {
      setAmountPaise(null);
      setAccountId(accountList[0]?.id ?? null);
      setCategoryId(categoryList[0]?.id ?? null);
      setDate(new Date());
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const valid =
    accountId != null && categoryId != null && amountPaise != null && amountPaise > 0;

  const submit = async () => {
    if (!valid) return;
    await add.mutateAsync({
      accountId,
      categoryId,
      amount: amountPaise,
      date: toISODate(date),
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add expense">
      {accountList.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Add a bank account first (Accounts tab) so expenses can be paid from it.
        </ThemedText>
      ) : (
        <>
          <MoneyInput label="Amount spent" onChangePaise={setAmountPaise} autoFocus />
          <ChipSelect
            label="Category"
            value={categoryId}
            onChange={setCategoryId}
            options={categoryList.map((c) => ({ label: c.name, value: c.id, icon: c.icon }))}
          />
          <SegmentedControl
            label="Paid from"
            value={accountId ?? accountList[0].id}
            onChange={setAccountId}
            options={accountList.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
          <View style={{ marginTop: Spacing.two }}>
            <Button
              title="Add expense"
              onPress={submit}
              loading={add.isPending}
              disabled={!valid}
            />
          </View>
        </>
      )}
    </AppModal>
  );
}
