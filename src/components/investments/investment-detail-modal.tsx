/**
 * Investment detail: value and gain, invest more, withdraw, update the current
 * market value, edit details, or archive.
 */

import { useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { DateField } from '@/components/ui/date-field';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useAccounts } from '@/hooks/use-accounts';
import {
  useAddContribution,
  useArchiveInvestment,
  useUpdateInvestment,
  useWithdrawInvestment,
} from '@/hooks/use-investments';
import { useDeleteRecordFlow } from '@/hooks/use-records';
import { toISODate } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';
import {
  INVESTMENT_TYPE_LABELS,
  type InvestmentType,
  type InvestmentWithTotals,
} from '@/schemas/investment';

const TYPE_OPTIONS = (Object.keys(INVESTMENT_TYPE_LABELS) as InvestmentType[]).map((value) => ({
  label: INVESTMENT_TYPE_LABELS[value],
  value,
}));

function Content({
  investment,
  onClose,
}: {
  investment: InvestmentWithTotals;
  onClose: () => void;
}) {
  const theme = useTheme();
  const { data: accounts } = useAccounts();
  const contribute = useAddContribution();
  const withdraw = useWithdrawInvestment();
  const update = useUpdateInvestment();
  const archive = useArchiveInvestment();
  const { confirmDelete, isPending: deleting } = useDeleteRecordFlow();

  const [name, setName] = useState(investment.name);
  const [type, setType] = useState<InvestmentType>(investment.type);
  const [notes, setNotes] = useState(investment.notes ?? '');
  const [valuePaise, setValuePaise] = useState<number | null>(investment.current_value);

  const [flowAmount, setFlowAmount] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());

  const list = accounts ?? [];
  const target = accountId ?? list[0]?.id ?? null;
  const canFlow = target != null && flowAmount != null && flowAmount > 0;

  const doContribute = async () => {
    if (!canFlow) return;
    await contribute.mutateAsync({
      investmentId: investment.id,
      amount: flowAmount,
      accountId: target,
      date: toISODate(date),
    });
    onClose();
  };

  const doWithdraw = async () => {
    if (!canFlow) return;
    await withdraw.mutateAsync({
      investmentId: investment.id,
      amount: flowAmount,
      accountId: target,
      date: toISODate(date),
    });
    onClose();
  };

  const saveDetails = async () => {
    if (!name.trim()) return;
    await update.mutateAsync({
      id: investment.id,
      edit: { name, type, current_value: valuePaise, notes: notes.trim() || null },
    });
    onClose();
  };

  const confirmArchive = () => {
    Alert.alert('Archive investment?', `${investment.name} will be hidden. History is kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archive.mutateAsync(investment.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <View style={styles.body}>
      <View>
        <ThemedText type="title" style={styles.amount}>
          {formatMoney(investment.value)}
        </ThemedText>
        <ThemedText themeColor="textSecondary">Current value</ThemedText>
      </View>

      <View style={styles.meta}>
        <Row label="Invested" value={formatMoney(investment.net_invested)} />
        {investment.withdrawn > 0 && (
          <Row label="Withdrawn" value={formatMoney(investment.withdrawn)} />
        )}
        {investment.current_value != null && (
          <Row
            label="Gain / loss"
            value={`${investment.gain > 0 ? '+' : ''}${formatMoney(investment.gain)}`}
          />
        )}
      </View>

      {list.length > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="smallBold" themeColor="textSecondary">
            MOVE MONEY
          </ThemedText>
          <MoneyInput label="Amount" onChangePaise={setFlowAmount} />
          <SegmentedControl
            label="Account"
            value={target ?? list[0].id}
            onChange={setAccountId}
            options={list.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <View style={styles.actions}>
            <Button
              title="Invest more"
              onPress={doContribute}
              loading={contribute.isPending}
              disabled={!canFlow}
              style={styles.action}
            />
            <Button
              title="Withdraw"
              variant="secondary"
              onPress={doWithdraw}
              loading={withdraw.isPending}
              disabled={!canFlow}
              style={styles.action}
            />
          </View>
        </>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <TextField label="Name" value={name} onChangeText={setName} />
      <SegmentedControl label="Type" value={type} onChange={setType} options={TYPE_OPTIONS} />
      <MoneyInput
        label="Current value"
        hint="Update as the market moves. Leave blank to use the amount invested."
        initialPaise={investment.current_value}
        onChangePaise={setValuePaise}
      />
      <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
      <Button
        title="Save details"
        variant="secondary"
        onPress={saveDetails}
        loading={update.isPending}
        disabled={!name.trim()}
      />

      <Button
        title="Archive investment"
        variant="secondary"
        onPress={confirmArchive}
        loading={archive.isPending}
      />
      <Button
        title="Delete investment permanently"
        variant="danger"
        onPress={() => confirmDelete('investment', investment.id, investment.name, onClose)}
        loading={deleting}
      />
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

export function InvestmentDetailModal({
  investment,
  onClose,
}: {
  investment: InvestmentWithTotals | null;
  onClose: () => void;
}) {
  return (
    <AppModal visible={!!investment} onClose={onClose} title="Investment">
      {investment && <Content key={investment.id} investment={investment} onClose={onClose} />}
    </AppModal>
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
  divider: {
    height: StyleSheet.hairlineWidth,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
});
