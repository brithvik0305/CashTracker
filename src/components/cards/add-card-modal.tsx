/** Create a new credit card with its limit and any amount already owed. */

import { useState } from 'react';
import { View } from 'react-native';

import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { MoneyInput } from '@/components/ui/money-input';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import { useCreateCard } from '@/hooks/use-credit-cards';

export function AddCardModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const [name, setName] = useState('');
  const [limitPaise, setLimitPaise] = useState<number | null>(0);
  const [owedPaise, setOwedPaise] = useState<number | null>(0);
  const create = useCreateCard();

  const reset = () => {
    setName('');
    setLimitPaise(0);
    setOwedPaise(0);
  };

  const submit = async () => {
    if (!name.trim()) return;
    await create.mutateAsync({
      name,
      credit_limit: limitPaise ?? 0,
      opening_outstanding: owedPaise ?? 0,
    });
    reset();
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Add credit card">
      <TextField
        label="Card name"
        placeholder="e.g. SBI Elite, Standard Chartered"
        value={name}
        onChangeText={setName}
        autoFocus
      />
      <MoneyInput label="Credit limit" initialPaise={0} onChangePaise={setLimitPaise} />
      <MoneyInput
        label="Currently owed (optional)"
        hint="Amount already outstanding on this card."
        initialPaise={0}
        onChangePaise={setOwedPaise}
      />
      <View style={{ marginTop: Spacing.two }}>
        <Button
          title="Add card"
          onPress={submit}
          loading={create.isPending}
          disabled={!name.trim()}
        />
      </View>
    </AppModal>
  );
}
