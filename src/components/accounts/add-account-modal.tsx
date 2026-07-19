/** Create a new bank/savings account with an opening balance. */

import { useState } from 'react';
import { View } from 'react-native';

import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useCreateAccount } from '@/hooks/use-accounts';
import type { AccountType } from '@/schemas/account';

export function AddAccountModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [type, setType] = useState<AccountType>('checking');
  const [openingPaise, setOpeningPaise] = useState<number | null>(0);
  const create = useCreateAccount();

  const reset = () => {
    setName('');
    setType('checking');
    setOpeningPaise(0);
  };

  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({
      name,
      type,
      opening_balance: openingPaise ?? 0,
    });
    reset();
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add account">
      <TextField
        label="Account name"
        placeholder="e.g. SBI, Canara"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <SegmentedControl
        label="Type"
        value={type}
        onChange={setType}
        options={[
          { label: 'Bank', value: 'checking' },
          { label: 'Savings', value: 'savings' },
        ]}
      />
      <MoneyInput
        label="Opening balance"
        hint="The amount currently in this account."
        initialPaise={0}
        onChangePaise={setOpeningPaise}
      />
      <View style={{ marginTop: Spacing.two }}>
        <Button
          title="Add account"
          onPress={submit}
          loading={create.isPending}
          disabled={!name.trim()}
        />
      </View>
    </AppModal>
  );
}
