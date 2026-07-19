/**
 * Home / dashboard.
 *
 * Layout: the Safe To Spend hero, then a compact 2-column grid of the six
 * headline figures, the weekly spending indicator, income totals, and recent
 * activity. The grid keeps everything important above (or just below) the fold
 * instead of stacking a separate section per feature.
 */

import { useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { useRouter } from 'expo-router';

import { NewWeekBanner } from '@/components/dashboard/new-week-banner';
import { WeeklySpendingCard } from '@/components/dashboard/weekly-spending-card';
import { Screen } from '@/components/screen';
import { StatCard } from '@/components/stat-card';
import { ThemedText } from '@/components/themed-text';
import { AddExpenseModal } from '@/components/transactions/add-expense-modal';
import { AddIncomeModal } from '@/components/transactions/add-income-modal';
import { TransactionDetailModal } from '@/components/transactions/transaction-detail-modal';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { AnimatedMoney } from '@/components/ui/animated-money';
import { Button } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';
import { FadeIn } from '@/components/ui/fade-in';
import { Radii, Shadow, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useAccounts } from '@/hooks/use-accounts';
import { useCreditCards } from '@/hooks/use-credit-cards';
import { useFinancialPosition } from '@/hooks/use-financial-position';
import { useIncomeSummary } from '@/hooks/use-income-summary';
import { useRecentTransactions } from '@/hooks/use-transactions';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionListItem } from '@/schemas/transaction';

function Card({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View
      style={[styles.card, Shadow.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      {children}
    </View>
  );
}

function SectionLabel({ children }: { children: string }) {
  return (
    <ThemedText type="smallBold" themeColor="textSecondary">
      {children}
    </ThemedText>
  );
}

export default function HomeScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { totalCash, safeToSpend, netAvailable, owedToMe, iOwe, netWorth, position } =
    useFinancialPosition();
  const { data: accounts } = useAccounts();
  const { data: income } = useIncomeSummary();
  const { data: cards } = useCreditCards();
  const { data: recent } = useRecentTransactions(6);
  const [modal, setModal] = useState<null | 'income' | 'expense'>(null);
  const [detail, setDetail] = useState<TransactionListItem | null>(null);

  const cardsDue = position.ccStatementsOutstanding;
  const nextDue = (cards ?? [])
    .filter((c) => c.statement_outstanding > 0 && c.due_date)
    .sort((a, b) => (a.due_date! < b.due_date! ? -1 : 1))[0];
  const dueCaption = nextDue
    ? `${nextDue.name} · ${format(new Date(`${nextDue.due_date}T00:00:00`), 'd MMM')}`
    : undefined;

  const incomeCols = [
    { label: 'This week', value: income?.weekly ?? 0 },
    { label: 'This month', value: income?.monthly ?? 0 },
    { label: 'This year', value: income?.yearly ?? 0 },
  ];

  // Before any account exists every figure is zero, so lead with a way in.
  if (accounts && accounts.length === 0) {
    return (
      <Screen title="CashTracker" subtitle="Your cash position at a glance">
        <FadeIn>
          <EmptyState
            icon="wallet-outline"
            title="Start with an account"
            description="Add your bank accounts and CashTracker will work out what's safe to spend, keeping balances in step with every transaction."
            actionLabel="Add an account"
            onAction={() => router.push('/accounts')}
          />
        </FadeIn>
      </Screen>
    );
  }

  return (
    <Screen title="CashTracker" subtitle="Your cash position at a glance">
      <FadeIn>
        <NewWeekBanner />
      </FadeIn>

      <FadeIn delay={40}>
        <View style={[styles.hero, Shadow.raised, { backgroundColor: theme.brand }]}>
          <View style={styles.heroHeader}>
            <ThemedText type="smallBold" style={styles.heroLabel}>
              Safe to Spend
            </ThemedText>
            <View style={styles.heroBadge}>
              <Ionicons name="shield-checkmark" size={14} color="#FFFFFF" />
            </View>
          </View>
          <AnimatedMoney value={safeToSpend} style={styles.heroValue} />
          <ThemedText type="small" style={styles.heroCaption}>
            Cash + owed to you − you owe − card bills
          </ThemedText>
        </View>
      </FadeIn>

      <FadeIn delay={80}>
        <View style={styles.row}>
          <StatCard label="Total Cash" value={formatMoney(totalCash)} icon="cash-outline" />
          <StatCard label="Net Available" value={formatMoney(netAvailable)} icon="wallet-outline" />
        </View>
      </FadeIn>

      <FadeIn delay={110}>
        <View style={styles.row}>
          <StatCard
            label="Owed to me"
            value={formatMoney(owedToMe)}
            tone={owedToMe > 0 ? 'success' : 'neutral'}
            icon="arrow-down-circle-outline"
          />
          <StatCard
            label="I owe"
            value={formatMoney(iOwe)}
            tone={iOwe > 0 ? 'danger' : 'neutral'}
            icon="arrow-up-circle-outline"
          />
        </View>
      </FadeIn>

      <FadeIn delay={140}>
        <View style={styles.row}>
          <StatCard
            label="Cards due"
            value={formatMoney(cardsDue)}
            caption={dueCaption}
            tone={cardsDue > 0 ? 'caution' : 'neutral'}
            icon="card-outline"
          />
          <StatCard
            label="Net Worth"
            value={formatMoney(netWorth)}
            tone={netWorth < 0 ? 'danger' : 'neutral'}
            icon="stats-chart-outline"
          />
        </View>
      </FadeIn>

      <FadeIn delay={170}>
        <View style={styles.row}>
          <Button title="Add income" onPress={() => setModal('income')} style={styles.action} />
          <Button
            title="Add expense"
            variant="secondary"
            onPress={() => setModal('expense')}
            style={styles.action}
          />
        </View>
      </FadeIn>

      <FadeIn delay={200}>
        <WeeklySpendingCard />
      </FadeIn>

      <FadeIn delay={230}>
        <Card>
          <SectionLabel>INCOME</SectionLabel>
          <View style={styles.spaced}>
            {incomeCols.map((col) => (
              <View key={col.label} style={styles.incomeCol}>
                <ThemedText type="small" themeColor="textTertiary">
                  {col.label}
                </ThemedText>
                <ThemedText type="smallBold" style={styles.tabular}>
                  {formatMoney(col.value, { decimals: false })}
                </ThemedText>
              </View>
            ))}
          </View>
        </Card>
      </FadeIn>

      <FadeIn delay={260}>
        <Card>
          <SectionLabel>RECENT ACTIVITY</SectionLabel>
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
              Nothing recorded yet. Use the buttons above to add income or an expense.
            </ThemedText>
          )}
        </Card>
      </FadeIn>

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
  hero: {
    borderRadius: Radii.xxl,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  heroLabel: {
    color: 'rgba(255,255,255,0.85)',
  },
  heroBadge: {
    width: 28,
    height: 28,
    borderRadius: Radii.pill,
    backgroundColor: 'rgba(255,255,255,0.18)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroValue: {
    color: '#FFFFFF',
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
    fontVariant: ['tabular-nums'],
  },
  heroCaption: {
    color: 'rgba(255,255,255,0.72)',
  },
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  spaced: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  incomeCol: {
    gap: 2,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.half,
  },
});
