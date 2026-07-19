/**
 * Home / dashboard.
 *
 * Live from the ledger: Safe To Spend, Net Available, Total Cash, weekly/monthly/
 * yearly income, and recent activity. The remaining Safe-To-Spend components
 * (owed to/by you, card bills) are zero until their milestones land.
 */

import { StyleSheet, View } from 'react-native';

import { Screen } from '@/components/screen';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { TransactionRow } from '@/components/transactions/transaction-row';
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
            No transactions yet. Use the Add tab to record income or an expense.
          </ThemedText>
        )}
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    gap: Spacing.three,
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
