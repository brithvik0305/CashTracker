/**
 * Record a credit-card purchase. This increases the card's outstanding balance
 * and is NOT counted as an expense (only paying the bill is).
 */

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
import { useCategories } from '@/hooks/use-categories';
import { useAddCardPurchase, useCreditCards } from '@/hooks/use-credit-cards';
import { toISODate } from '@/lib/date';

export function AddCardPurchaseModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { data: cards } = useCreditCards();
  const { data: categories } = useCategories();
  const add = useAddCardPurchase();

  const [amountPaise, setAmountPaise] = useState<number | null>(null);
  const [cardId, setCardId] = useState<number | null>(null);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const cardList = cards ?? [];
  const categoryList = categories ?? [];

  useEffect(() => {
    if (visible) {
      setAmountPaise(null);
      setCardId(cardList[0]?.id ?? null);
      setCategoryId(null);
      setDate(new Date());
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const valid = cardId != null && amountPaise != null && amountPaise > 0;

  const submit = async () => {
    if (!valid) return;
    await add.mutateAsync({
      cardId,
      amount: amountPaise,
      categoryId,
      date: toISODate(date),
      notes: notes.trim() || null,
    });
    onClose();
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Card purchase">
      {cardList.length === 0 ? (
        <ThemedText themeColor="textSecondary">
          Add a credit card first (Accounts tab) to record purchases on it.
        </ThemedText>
      ) : (
        <>
          <MoneyInput label="Amount" onChangePaise={setAmountPaise} autoFocus />
          <SegmentedControl
            label="Card"
            value={cardId ?? cardList[0].id}
            onChange={setCardId}
            options={cardList.map((c) => ({ label: c.name, value: c.id }))}
          />
          {categoryList.length > 0 && (
            <ChipSelect
              label="Category (optional)"
              value={categoryId}
              onChange={setCategoryId}
              options={categoryList.map((c) => ({ label: c.name, value: c.id, icon: c.icon }))}
            />
          )}
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
          <View style={{ marginTop: Spacing.two }}>
            <Button title="Add purchase" onPress={submit} loading={add.isPending} disabled={!valid} />
          </View>
        </>
      )}
    </AppModal>
  );
}
