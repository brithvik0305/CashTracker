/**
 * Edit an account: rename / change type, set its balance exactly (recorded as an
 * adjustment), or archive it. Opening balance is not edited here — use Set balance.
 */

import { useEffect, useState } from 'react';
import { Alert, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useArchiveAccount, useSetBalance, useUpdateAccount } from '@/hooks/use-accounts';
import { useDeleteRecordFlow } from '@/hooks/use-records';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';
import type { AccountType, AccountWithBalance } from '@/schemas/account';

interface Props {
  account: AccountWithBalance | null;
  onClose: () => void;
}

export function AccountDetailModal({ account, onClose }: Props) {
  const theme = useTheme();
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [targetPaise, setTargetPaise] = useState<number | null>(null);

  const update = useUpdateAccount();
  const setBalance = useSetBalance();
  const archive = useArchiveAccount();
  const { confirmDelete, isPending: deleting } = useDeleteRecordFlow();

  useEffect(() => {
    if (account) {
      setName(account.name);
      setType(account.type);
      setTargetPaise(null);
    }
  }, [account]);

  if (!account) return null;

  const saveDetails = async () => {
    if (!name.trim()) return;
    await update.mutateAsync({ id: account.id, edit: { name, type } });
    onClose();
  };

  const applyBalance = async () => {
    if (targetPaise == null) return;
    await setBalance.mutateAsync({ id: account.id, target: targetPaise });
    onClose();
  };

  const confirmArchive = () => {
    Alert.alert(
      'Archive account?',
      `${account.name} will be hidden from your accounts. Its history is kept.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Archive',
          style: 'destructive',
          onPress: async () => {
            await archive.mutateAsync(account.id);
            onClose();
          },
        },
      ],
    );
  };

  return (
    <AppModal visible={!!account} onClose={onClose} title="Edit account">
      <TextField label="Account name" value={name} onChangeText={setName} />
      <SegmentedControl
        label="Type"
        value={type}
        onChange={setType}
        options={[
          { label: 'Bank', value: 'checking' },
          { label: 'Savings', value: 'savings' },
        ]}
      />
      <Button
        title="Save details"
        onPress={saveDetails}
        loading={update.isPending}
        disabled={!name.trim()}
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="small" themeColor="textSecondary">
        Current balance: {formatMoney(account.current_balance)}
      </ThemedText>
      <MoneyInput
        label="Set balance to"
        hint="Records the difference as an adjustment."
        onChangePaise={setTargetPaise}
      />
      <Button
        title="Set balance"
        variant="secondary"
        onPress={applyBalance}
        loading={setBalance.isPending}
        disabled={targetPaise == null}
      />

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <Button
        title="Archive account"
        variant="secondary"
        onPress={confirmArchive}
        loading={archive.isPending}
      />
      <Button
        title="Delete account permanently"
        variant="danger"
        onPress={() => confirmDelete('account', account.id, account.name, onClose)}
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
