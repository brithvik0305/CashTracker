/**
 * Accounts tab — bank/savings accounts and credit cards. Balances and card
 * outstanding are derived from the ledger.
 */

import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AccountCard } from '@/components/accounts/account-card';
import { AccountDetailModal } from '@/components/accounts/account-detail-modal';
import { AddAccountModal } from '@/components/accounts/add-account-modal';
import { TransferModal } from '@/components/accounts/transfer-modal';
import { AddCardModal } from '@/components/cards/add-card-modal';
import { CardDetailModal } from '@/components/cards/card-detail-modal';
import { CreditCardCard } from '@/components/cards/credit-card-card';
import { EmptyState } from '@/components/ui/empty-state';
import { Screen } from '@/components/screen';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useAccounts } from '@/hooks/use-accounts';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useTheme } from '@/hooks/use-theme';
import type { AccountWithBalance } from '@/schemas/account';
import type { CreditCardWithBalances } from '@/schemas/credit-card';

export default function AccountsScreen() {
  const theme = useTheme();
  const { data: accounts, isLoading } = useAccounts();
  const { data: cards } = useCreditCards();

  const [showAddAccount, setShowAddAccount] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [showAddCard, setShowAddCard] = useState(false);
  const [accountDetail, setAccountDetail] = useState<AccountWithBalance | null>(null);
  const [cardDetail, setCardDetail] = useState<CreditCardWithBalances | null>(null);

  const accountList = accounts ?? [];
  const cardList = cards ?? [];
  const totalCash = accountList.reduce((sum, a) => sum + a.current_balance, 0);

  return (
    <Screen title="Accounts" subtitle="Bank accounts & credit cards">
      {isLoading ? (
        <ActivityIndicator color={theme.brand} style={{ marginTop: Spacing.five }} />
      ) : (
        <>
          {accountList.length > 0 && (
            <StatCard label="Total Cash" value={formatMoney(totalCash)} tone="brand" />
          )}

          <View style={styles.actions}>
            <Button
              title="Add account"
              onPress={() => setShowAddAccount(true)}
              style={styles.action}
            />
            <Button
              title="Transfer"
              variant="secondary"
              onPress={() => setShowTransfer(true)}
              disabled={accountList.length < 2}
              style={styles.action}
            />
          </View>

          {accountList.length === 0 ? (
            <EmptyState
              icon="wallet-outline"
              title="No accounts yet"
              description="Add your bank accounts to start tracking cash. Balances update automatically from every transaction."
              actionLabel="Add your first account"
              onAction={() => setShowAddAccount(true)}
            />
          ) : (
            <View style={styles.list}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                YOUR ACCOUNTS
              </ThemedText>
              {accountList.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onPress={() => setAccountDetail(account)}
                />
              ))}
            </View>
          )}

          <View style={styles.list}>
            <View style={styles.sectionHeader}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                CREDIT CARDS
              </ThemedText>
              <Button title="Add card" variant="ghost" onPress={() => setShowAddCard(true)} />
            </View>
            {cardList.length === 0 ? (
              <ThemedText type="small" themeColor="textTertiary">
                Add SBI Elite, Standard Chartered, or any card to track statements and payments.
              </ThemedText>
            ) : (
              cardList.map((card) => (
                <CreditCardCard key={card.id} card={card} onPress={() => setCardDetail(card)} />
              ))
            )}
          </View>
        </>
      )}

      <AddAccountModal visible={showAddAccount} onClose={() => setShowAddAccount(false)} />
      <TransferModal
        visible={showTransfer}
        onClose={() => setShowTransfer(false)}
        accounts={accountList}
      />
      <AddCardModal visible={showAddCard} onClose={() => setShowAddCard(false)} />
      <AccountDetailModal account={accountDetail} onClose={() => setAccountDetail(null)} />
      <CardDetailModal card={cardDetail} onClose={() => setCardDetail(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
  },
  list: {
    gap: Spacing.two,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
