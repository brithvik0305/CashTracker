/**
 * Edit a credit card: rename / change limit, record a new statement (billed
 * amount + statement and due dates), or archive it.
 */

import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { MoneyInput } from '@/components/ui/money-input';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import {
  useArchiveCard,
  useRecordStatement,
  useSetCardOutstanding,
  useUpdateCard,
} from '@/hooks/use-credit-cards';
import { useDeleteRecordFlow } from '@/hooks/use-records';
import { toISODate } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';
import type { CreditCardWithBalances } from '@/schemas/credit-card';

export function CardDetailModal({
  card,
  onClose,
}: {
  card: CreditCardWithBalances | null;
  onClose: () => void;
}) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [limitPaise, setLimitPaise] = useState<number | null>(null);
  const [stmtPaise, setStmtPaise] = useState<number | null>(null);
  const [stmtDate, setStmtDate] = useState(new Date());
  const [dueDate, setDueDate] = useState(new Date());
  const [outstandingPaise, setOutstandingPaise] = useState<number | null>(null);

  const update = useUpdateCard();
  const record = useRecordStatement();
  const setOutstanding = useSetCardOutstanding();
  const archive = useArchiveCard();
  const { confirmDelete, isPending: deleting } = useDeleteRecordFlow();

  useEffect(() => {
    if (card) {
      setName(card.name);
      setLimitPaise(card.credit_limit);
      setStmtPaise(null);
      setStmtDate(card.statement_date ? new Date(`${card.statement_date}T00:00:00`) : new Date());
      setDueDate(card.due_date ? new Date(`${card.due_date}T00:00:00`) : new Date());
      setOutstandingPaise(null);
    }
  }, [card]);

  if (!card) return null;

  const saveDetails = async () => {
    if (!name.trim()) return;
    await update.mutateAsync({
      id: card.id,
      edit: { name, credit_limit: limitPaise ?? 0 },
    });
    onClose();
  };

  const applyOutstanding = async () => {
    if (outstandingPaise == null) return;
    await setOutstanding.mutateAsync({ id: card.id, target: outstandingPaise });
    onClose();
  };

  const saveStatement = async () => {
    if (stmtPaise == null) return;
    await record.mutateAsync({
      id: card.id,
      input: {
        statement_amount: stmtPaise,
        statement_date: toISODate(stmtDate),
        due_date: toISODate(dueDate),
      },
    });
    onClose();
  };

  const confirmArchive = () => {
    Alert.alert('Archive card?', `${card.name} will be hidden. Its history is kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archive.mutateAsync(card.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <AppModal visible={!!card} onClose={onClose} title="Edit card">
      <ThemedText type="small" themeColor="textSecondary">
        Outstanding {formatMoney(card.current_outstanding)} · Statement due{' '}
        {formatMoney(card.statement_outstanding)}
      </ThemedText>

      <TextField label="Card name" value={name} onChangeText={setName} />
      <MoneyInput label="Credit limit" initialPaise={card.credit_limit} onChangePaise={setLimitPaise} />
      <Button
        title="Save details"
        onPress={saveDetails}
        loading={update.isPending}
        disabled={!name.trim()}
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="smallBold" themeColor="textSecondary">
        CORRECT THE OUTSTANDING
      </ThemedText>
      <MoneyInput
        label="Set outstanding to"
        hint="Records the difference as an adjustment on this card."
        onChangePaise={setOutstandingPaise}
      />
      <Button
        title="Set outstanding"
        variant="secondary"
        onPress={applyOutstanding}
        loading={setOutstanding.isPending}
        disabled={outstandingPaise == null}
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="smallBold" themeColor="textSecondary">
        RECORD A STATEMENT
      </ThemedText>
      <MoneyInput label="Statement amount" onChangePaise={setStmtPaise} />
      <DateField label="Statement date" value={stmtDate} onChange={setStmtDate} />
      <DateField label="Due date" value={dueDate} onChange={setDueDate} maximumDate={null} />
      <Button
        title="Record statement"
        variant="secondary"
        onPress={saveStatement}
        loading={record.isPending}
        disabled={stmtPaise == null}
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Button
        title="Archive card"
        variant="secondary"
        onPress={confirmArchive}
        loading={archive.isPending}
      />
      <Button
        title="Delete card permanently"
        variant="danger"
        onPress={() => confirmDelete('card', card.id, card.name, onClose)}
        loading={deleting}
      />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
});
