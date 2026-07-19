/**
 * Pay a credit-card bill from a bank account. This lowers the bank balance and
 * the card's outstanding, and DOES count as spending for the week.
 */

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
import { useAddCardPayment, useCreditCards } from '@/hooks/use-credit-cards';
import { formatMoney } from '@/domain/money';
import { toISODate } from '@/lib/date';

export function AddCardPaymentModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { data: cards } = useCreditCards();
  const { data: accounts } = useAccounts();
  const add = useAddCardPayment();

  const [amountPaise, setAmountPaise] = useState<number | null>(null);
  const [cardId, setCardId] = useState<number | null>(null);
  const [accountId, setAccountId] = useState<number | null>(null);
  const [date, setDate] = useState(new Date());
  const [notes, setNotes] = useState('');

  const cardList = cards ?? [];
  const accountList = accounts ?? [];
  const selectedCard = cardList.find((c) => c.id === cardId);

  useEffect(() => {
    if (visible) {
      setAmountPaise(null);
      setCardId(cardList[0]?.id ?? null);
      setAccountId(accountList[0]?.id ?? null);
      setDate(new Date());
      setNotes('');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [visible]);

  const valid =
    cardId != null && accountId != null && amountPaise != null && amountPaise > 0;

  const submit = async () => {
    if (!valid) return;
    await add.mutateAsync({
      cardId,
      accountId,
      amount: amountPaise,
      date: toISODate(date),
      notes: notes.trim() || null,
    });
    onClose();
  };

  const missing = cardList.length === 0 || accountList.length === 0;

  return (
    <AppModal visible={visible} onClose={onClose} title="Card payment">
      {missing ? (
        <ThemedText themeColor="textSecondary">
          You need at least one credit card and one bank account (Accounts tab) to record a payment.
        </ThemedText>
      ) : (
        <>
          <MoneyInput label="Amount paid" onChangePaise={setAmountPaise} autoFocus />
          <SegmentedControl
            label="Card"
            value={cardId ?? cardList[0].id}
            onChange={setCardId}
            options={cardList.map((c) => ({ label: c.name, value: c.id }))}
          />
          {selectedCard && selectedCard.statement_outstanding > 0 && (
            <ThemedText type="small" themeColor="caution">
              {formatMoney(selectedCard.statement_outstanding)} currently due on this card.
            </ThemedText>
          )}
          <SegmentedControl
            label="Paid from"
            value={accountId ?? accountList[0].id}
            onChange={setAccountId}
            options={accountList.map((a) => ({ label: a.name, value: a.id }))}
          />
          <DateField label="Date" value={date} onChange={setDate} />
          <TextField label="Notes (optional)" value={notes} onChangeText={setNotes} />
          <View style={{ marginTop: Spacing.two }}>
            <Button title="Pay card" onPress={submit} loading={add.isPending} disabled={!valid} />
          </View>
        </>
      )}
    </AppModal>
  );
}
