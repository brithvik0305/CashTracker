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
import { TransactionDetailModal } from '@/components/transactions/transaction-detail-modal';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { Button } from '@/components/ui/button';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useFinancialPosition } from '@/hooks/use-financial-position';
import { useIncomeSummary } from '@/hooks/use-income-summary';
import { useRecentTransactions } from '@/hooks/use-transactions';
import { useTheme } from '@/hooks/use-theme';
import { formatDisplayDate } from '@/lib/date';
import type { TransactionListItem } from '@/schemas/transaction';

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
  const {
    totalCash,
    safeToSpend,
    netAvailable,
    cardOutstanding,
    owedToMe,
    iOwe,
    investments,
    netWorth,
  } = useFinancialPosition();
  const { data: income } = useIncomeSummary();
  const { data: cards } = useCreditCards();
  const { data: recent } = useRecentTransactions(6);
  const [modal, setModal] = useState<null | 'income' | 'expense'>(null);
  const [detail, setDetail] = useState<TransactionListItem | null>(null);

  const nextDue = (cards ?? [])
    .filter((c) => c.statement_outstanding > 0 && c.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];

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

      {cards && cards.length > 0 && (
        <Card>
          <View style={styles.cardsHeader}>
            <ThemedText type="smallBold" themeColor="textSecondary">
              CREDIT CARDS
            </ThemedText>
            <ThemedText type="smallBold" themeColor="text" style={styles.incomeValue}>
              {formatMoney(cardOutstanding)}
            </ThemedText>
          </View>
          <ThemedText type="small" themeColor="textTertiary">
            {nextDue
              ? `${formatMoney(nextDue.statement_outstanding)} due by ${formatDisplayDate(nextDue.due_date!)} on ${nextDue.name}`
              : 'No statements due right now.'}
          </ThemedText>
        </Card>
      )}

      {(owedToMe > 0 || iOwe > 0) && (
        <View style={styles.row}>
          <StatCard label="Owed to me" value={formatMoney(owedToMe)} tone="success" />
          <StatCard label="I owe" value={formatMoney(iOwe)} tone="danger" />
        </View>
      )}

      {investments > 0 && (
        <View style={styles.row}>
          <StatCard label="Investments" value={formatMoney(investments)} />
          <StatCard
            label="Net Worth"
            value={formatMoney(netWorth)}
            tone={netWorth < 0 ? 'danger' : 'neutral'}
          />
        </View>
      )}

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
                <TransactionRow item={item} onPress={() => setDetail(item)} />
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
      <TransactionDetailModal item={detail} onClose={() => setDetail(null)} />
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
  cardsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
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
