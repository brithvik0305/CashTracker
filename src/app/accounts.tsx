/**
 * Accounts tab — add bank/savings accounts, see live balances, transfer between
 * them, and adjust balances. Credit cards arrive in M4.
 */

import { useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { AccountCard } from '@/components/accounts/account-card';
import { AccountDetailModal } from '@/components/accounts/account-detail-modal';
import { AddAccountModal } from '@/components/accounts/add-account-modal';
import { TransferModal } from '@/components/accounts/transfer-modal';
import { ComingSoon } from '@/components/coming-soon';
import { Screen } from '@/components/screen';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useAccounts } from '@/hooks/use-accounts';
import { useTheme } from '@/hooks/use-theme';
import type { AccountWithBalance } from '@/schemas/account';

export default function AccountsScreen() {
  const theme = useTheme();
  const { data: accounts, isLoading } = useAccounts();

  const [showAdd, setShowAdd] = useState(false);
  const [showTransfer, setShowTransfer] = useState(false);
  const [detail, setDetail] = useState<AccountWithBalance | null>(null);

  const list = accounts ?? [];
  const totalCash = list.reduce((sum, a) => sum + a.current_balance, 0);

  return (
    <Screen title="Accounts" subtitle="Bank & savings accounts">
      {isLoading ? (
        <ActivityIndicator color={theme.brand} style={{ marginTop: Spacing.five }} />
      ) : (
        <>
          {list.length > 0 && (
            <StatCard label="Total Cash" value={formatMoney(totalCash)} tone="brand" />
          )}

          <View style={styles.actions}>
            <Button title="Add account" onPress={() => setShowAdd(true)} style={styles.action} />
            <Button
              title="Transfer"
              variant="secondary"
              onPress={() => setShowTransfer(true)}
              disabled={list.length < 2}
              style={styles.action}
            />
          </View>

          {list.length === 0 ? (
            <ComingSoon
              icon="wallet-outline"
              milestone="No accounts yet"
              description="Add your SBI and Canara accounts to start tracking your cash. Balances update automatically from every transaction."
            />
          ) : (
            <View style={styles.list}>
              <ThemedText type="smallBold" themeColor="textSecondary">
                YOUR ACCOUNTS
              </ThemedText>
              {list.map((account) => (
                <AccountCard
                  key={account.id}
                  account={account}
                  onPress={() => setDetail(account)}
                />
              ))}
            </View>
          )}
        </>
      )}

      <AddAccountModal visible={showAdd} onClose={() => setShowAdd(false)} />
      <TransferModal
        visible={showTransfer}
        onClose={() => setShowTransfer(false)}
        accounts={list}
      />
      <AccountDetailModal account={detail} onClose={() => setDetail(null)} />
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
});
