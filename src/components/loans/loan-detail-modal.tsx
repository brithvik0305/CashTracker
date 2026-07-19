/**
 * Loan detail: totals, partial repayment entry, rename/notes, and archive.
 * Repayments are ledger rows, so remaining recalculates itself.
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
import { useAddLoanPayment, useArchiveLoan, useUpdateLoan } from '@/hooks/use-loans';
import { useDeleteRecordFlow } from '@/hooks/use-records';
import { toISODate } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';
import type { LoanKind, LoanWithTotals } from '@/schemas/loan';

const COPY = {
  lending: { payment: 'Record a repayment', account: 'Received into', remaining: 'Still owed to you' },
  borrowing: { payment: 'Record a repayment', account: 'Paid from', remaining: 'You still owe' },
} as const;

function Content({
  loan,
  kind,
  onClose,
}: {
  loan: LoanWithTotals;
  kind: LoanKind;
  onClose: () => void;
}) {
  const theme = useTheme();
  const copy = COPY[kind];
  const { data: accounts } = useAccounts();
  const pay = useAddLoanPayment(kind);
  const update = useUpdateLoan(kind);
  const archive = useArchiveLoan(kind);
  const { confirmDelete, isPending: deleting } = useDeleteRecordFlow();

  const [person, setPerson] = useState(loan.person);
  const [notes, setNotes] = useState(loan.notes ?? '');
  const [amount, setAmount] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());

  const list = accounts ?? [];
  const targetAccount = accountId ?? list[0]?.id ?? null;
  const canPay = targetAccount != null && amount != null && amount > 0;

  const submitPayment = async () => {
    if (!canPay) return;
    await pay.mutateAsync({
      loanId: loan.id,
      amount,
      accountId: targetAccount,
      person: loan.person,
      date: toISODate(date),
      notes: null,
    });
    onClose();
  };

  const saveDetails = async () => {
    if (!person.trim()) return;
    await update.mutateAsync({
      id: loan.id,
      edit: { person, notes: notes.trim() || null },
    });
    onClose();
  };

  const confirmArchive = () => {
    Alert.alert('Archive record?', `${loan.person} will be hidden. History is kept.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Archive',
        style: 'destructive',
        onPress: async () => {
          await archive.mutateAsync(loan.id);
          onClose();
        },
      },
    ]);
  };

  return (
    <View style={styles.body}>
      <View>
        <ThemedText type="title" style={styles.amount}>
          {formatMoney(Math.max(loan.remaining, 0))}
        </ThemedText>
        <ThemedText themeColor="textSecondary">{copy.remaining}</ThemedText>
      </View>

      <View style={styles.meta}>
        <Row label={kind === 'lending' ? 'Lent' : 'Borrowed'} value={formatMoney(loan.principal)} />
        <Row
          label={kind === 'lending' ? 'Returned' : 'Repaid'}
          value={formatMoney(loan.settled)}
        />
      </View>

      {loan.remaining > 0 && list.length > 0 && (
        <>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <ThemedText type="smallBold" themeColor="textSecondary">
            {copy.payment.toUpperCase()}
          </ThemedText>
          <MoneyInput label="Amount" onChangePaise={setAmount} />
          <SegmentedControl
            label={copy.account}
            value={targetAccount ?? list[0].id}
            onChange={setAccountId}
            options={list.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <Button
            title="Record repayment"
            onPress={submitPayment}
            loading={pay.isPending}
            disabled={!canPay}
          />
        </>
      )}

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <TextField label="Person" value={person} onChangeText={setPerson} />
      <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
      <Button
        title="Save details"
        variant="secondary"
        onPress={saveDetails}
        loading={update.isPending}
        disabled={!person.trim()}
      />

      <Button
        title="Archive record"
        variant="secondary"
        onPress={confirmArchive}
        loading={archive.isPending}
      />
      <Button
        title="Delete record permanently"
        variant="danger"
        onPress={() => confirmDelete(kind, loan.id, loan.person, onClose)}
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

export function LoanDetailModal({
  loan,
  kind,
  onClose,
}: {
  loan: LoanWithTotals | null;
  kind: LoanKind;
  onClose: () => void;
}) {
  return (
    <AppModal
      visible={!!loan}
      onClose={onClose}
      title={kind === 'lending' ? 'Money lent' : 'Money borrowed'}>
      {loan && <Content key={loan.id} loan={loan} kind={kind} onClose={onClose} />}
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
});
