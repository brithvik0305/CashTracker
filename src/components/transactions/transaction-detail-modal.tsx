/**
 * View, edit, or delete a single transaction. The edit fields adapt to the
 * transaction type. Balances are derived from the ledger, so any change here
 * corrects Total Cash, Safe To Spend, card outstanding, etc. automatically.
 */

import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { ChipSelect } from '@/components/ui/chip-select';
import { DateField } from '@/components/ui/date-field';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { describeTransaction } from '@/domain/transaction-display';
import { useAccounts } from '@/hooks/use-accounts';
import { useCategories } from '@/hooks/use-categories';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useDeleteTransaction, useEditTransaction } from '@/hooks/use-transactions';
import { formatDisplayDate, toISODate } from '@/lib/date';
import type { TransactionListItem } from '@/schemas/transaction';

const EDITABLE = new Set([
  'income',
  'expense',
  'cc_purchase',
  'cc_payment',
  'transfer',
  'adjustment',
]);

function DetailContent({ item, onClose }: { item: TransactionListItem; onClose: () => void }) {
  const { data: accounts } = useAccounts();
  const { data: cards } = useCreditCards();
  const { data: categories } = useCategories();
  const edit = useEditTransaction();
  const remove = useDeleteTransaction();

  const [editing, setEditing] = useState(false);
  const [amount, setAmount] = useState<number | null>(Math.abs(item.amount));
  const [accountId, setAccountId] = useState<number | null>(item.account_id);
  const [cardId, setCardId] = useState<number | null>(item.credit_card_id);
  const [categoryId, setCategoryId] = useState<number | null>(item.category_id);
  const [client, setClient] = useState(item.counterparty ?? '');
  const [date, setDate] = useState(new Date(`${item.date}T00:00:00`));
  const [notes, setNotes] = useState(item.notes ?? '');
  const [direction, setDirection] = useState<number>(item.amount < 0 ? -1 : 1);

  const d = describeTransaction(item);
  const accountOptions = (accounts ?? []).map((a) => ({ label: a.name, value: a.id }));
  const cardOptions = (cards ?? []).map((c) => ({ label: c.name, value: c.id }));
  const categoryOptions = (categories ?? []).map((c) => ({
    label: c.name,
    value: c.id,
    icon: c.icon,
  }));

  const save = async () => {
    if (amount == null || amount <= 0) return;
    await edit.mutateAsync({
      item,
      values: {
        amount,
        date: toISODate(date),
        notes: notes.trim() || null,
        accountId,
        cardId,
        categoryId,
        client: client.trim() || null,
        direction: direction === -1 ? -1 : 1,
      },
    });
    onClose();
  };

  const confirmDelete = () => {
    Alert.alert('Delete transaction?', 'This cannot be undone. Balances will update.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove.mutateAsync(item);
          onClose();
        },
      },
    ]);
  };

  if (!editing) {
    return (
      <View style={styles.body}>
        <View>
          <ThemedText type="title" style={styles.amount}>
            {formatMoney(item.amount, { signed: d.tone === 'positive' })}
          </ThemedText>
          <ThemedText themeColor="textSecondary">{d.title}</ThemedText>
        </View>
        <View style={styles.meta}>
          {d.subtitle ? <Row label="Account" value={d.subtitle} /> : null}
          <Row label="Date" value={formatDisplayDate(item.date)} />
          {item.notes ? <Row label="Notes" value={item.notes} /> : null}
        </View>
        <Button title="Edit" onPress={() => setEditing(true)} />
        <Button title="Delete" variant="danger" onPress={confirmDelete} loading={remove.isPending} />
      </View>
    );
  }

  const type = item.type;
  return (
    <View style={styles.body}>
      <MoneyInput label="Amount" initialPaise={Math.abs(item.amount)} onChangePaise={setAmount} />

      {type === 'adjustment' && (
        <SegmentedControl
          label="Direction"
          value={direction}
          onChange={setDirection}
          options={[
            { label: 'Increase', value: 1 },
            { label: 'Decrease', value: -1 },
          ]}
        />
      )}

      {(type === 'cc_purchase' || type === 'cc_payment') && cardOptions.length > 0 && (
        <SegmentedControl label="Card" value={cardId ?? cardOptions[0].value} onChange={setCardId} options={cardOptions} />
      )}

      {(type === 'income' || type === 'expense' || type === 'cc_payment') &&
        accountOptions.length > 0 && (
          <SegmentedControl
            label="Account"
            value={accountId ?? accountOptions[0].value}
            onChange={setAccountId}
            options={accountOptions}
          />
        )}

      {(type === 'expense' || type === 'cc_purchase') && categoryOptions.length > 0 && (
        <ChipSelect label="Category" value={categoryId} onChange={setCategoryId} options={categoryOptions} />
      )}

      {type === 'income' && (
        <TextField label="Client (optional)" value={client} onChangeText={setClient} />
      )}

      <DateField label="Date" value={date} onChange={setDate} />
      <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />

      <View style={{ gap: Spacing.two, marginTop: Spacing.two }}>
        <Button title="Save changes" onPress={save} loading={edit.isPending} disabled={!amount} />
        <Button title="Cancel" variant="ghost" onPress={() => setEditing(false)} />
      </View>

      {(type === 'transfer' || type === 'adjustment') && (
        <ThemedText type="small" themeColor="textTertiary">
          {type === 'transfer'
            ? 'Editing changes both sides of the transfer.'
            : 'This adjusts a bank balance directly.'}
        </ThemedText>
      )}
    </View>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textTertiary">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

export function TransactionDetailModal({
  item,
  onClose,
}: {
  item: TransactionListItem | null;
  onClose: () => void;
}) {
  const editable = item ? EDITABLE.has(item.type) : false;
  return (
    <AppModal visible={!!item} onClose={onClose} title="Transaction">
      {item && editable ? (
        <DetailContent key={item.id} item={item} onClose={onClose} />
      ) : item ? (
        <ReadOnly item={item} onClose={onClose} />
      ) : null}
    </AppModal>
  );
}

function ReadOnly({ item, onClose }: { item: TransactionListItem; onClose: () => void }) {
  const d = describeTransaction(item);
  const remove = useDeleteTransaction();
  const confirmDelete = () => {
    Alert.alert('Delete transaction?', 'This cannot be undone. Balances will update.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await remove.mutateAsync(item);
          onClose();
        },
      },
    ]);
  };
  return (
    <View style={styles.body}>
      <ThemedText type="title" style={styles.amount}>
        {formatMoney(item.amount, { signed: d.tone === 'positive' })}
      </ThemedText>
      <ThemedText themeColor="textSecondary">{d.title}</ThemedText>
      <Button title="Delete" variant="danger" onPress={confirmDelete} loading={remove.isPending} />
    </View>
  );
}

const styles = StyleSheet.create({
  body: {
    gap: Spacing.three,
  },
  amount: {
    fontSize: 36,
    lineHeight: 42,
    fontVariant: ['tabular-nums'],
  },
  meta: {
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
});
