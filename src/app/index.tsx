/**
 * Home / dashboard.
 *
 * Live from the ledger: Safe To Spend, Net Available, Total Cash, weekly spending
 * indicator, weekly/monthly/yearly income, recent activity, and quick actions.
 * The remaining Safe-To-Spend components (owed to/by you, card bills) are zero
 * until their milestones land.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { WeeklySpendingCard } from '@/components/dashboard/weekly-spending-card';
import { AddExpenseModal } from '@/components/transactions/add-expense-modal';
import { AddIncomeModal } from '@/components/transactions/add-income-modal';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { Button } from '@/components/ui/button';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useFinancialPosition } from '@/hooks/use-financial-position';
import { useIncomeSummary } from '@/hooks/use-income-summary';
import { useRecentTransactions } from '@/hooks/use-transactions';
import { useTheme } from '@/hooks/use-theme';

function Card({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {children}
    </View>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const { totalCash, safeToSpend, netAvailable } = useFinancialPosition();
  const { data: income } = useIncomeSummary();
  const { data: recent } = useRecentTransactions(6);
  const [modal, setModal] = useState<null | 'income' | 'expense'>(null);

  const incomeCols = [
    { label: 'This week', value: income?.weekly ?? 0 },
    { label: 'This month', value: income?.monthly ?? 0 },
    { label: 'This year', value: income?.yearly ?? 0 },
  ];

  return (
    <Screen title="CashTracker" subtitle="Your cash position at a glance">
      <StatCard
        emphasis="hero"
        tone="brand"
        label="Safe to Spend"
        value={formatMoney(safeToSpend)}
        caption="Cash + owed to you − you owe − card bills"
      />

      <View style={styles.row}>
        <StatCard label="Total Cash" value={formatMoney(totalCash)} />
        <StatCard label="Net Available" value={formatMoney(netAvailable)} />
      </View>

      <View style={styles.row}>
        <Button title="Add income" onPress={() => setModal('income')} style={styles.action} />
        <Button
          title="Add expense"
          variant="secondary"
          onPress={() => setModal('expense')}
          style={styles.action}
        />
      </View>

      <WeeklySpendingCard />

      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          INCOME
        </ThemedText>
        <View style={styles.incomeRow}>
          {incomeCols.map((col) => (
            <View key={col.label} style={styles.incomeCol}>
              <ThemedText type="small" themeColor="textTertiary">
                {col.label}
              </ThemedText>
              <ThemedText type="smallBold" style={styles.incomeValue}>
                {formatMoney(col.value, { decimals: false })}
              </ThemedText>
            </View>
          ))}
        </View>
      </Card>

      <Card>
        <ThemedText type="smallBold" themeColor="textSecondary">
          RECENT ACTIVITY
        </ThemedText>
        {recent && recent.length > 0 ? (
          <View>
            {recent.map((item, i) => (
              <View key={item.id}>
                {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                <TransactionRow item={item} />
              </View>
            ))}
          </View>
        ) : (
          <ThemedText type="small" themeColor="textTertiary">
            No transactions yet. Use the buttons above or the Add tab to record income or an expense.
          </ThemedText>
        )}
      </Card>

      <AddIncomeModal visible={modal === 'income'} onClose={() => setModal(null)} />
      <AddExpenseModal visible={modal === 'expense'} onClose={() => setModal(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  action: {
    flex: 1,
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  incomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  incomeCol: {
    gap: 2,
  },
  incomeValue: {
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.half,
  },
});
