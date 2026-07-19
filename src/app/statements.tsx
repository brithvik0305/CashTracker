/**
 * Statements tab — the monthly report: summary, charts, card and loan activity,
 * and the full transaction timeline with filtering. Savings appears here (and in
 * the weekly figures), never on the dashboard.
 */

import { useMemo, useState } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { CategoryBarChart } from '@/components/charts/category-bar-chart';
import { SavingsTrendChart } from '@/components/charts/savings-trend-chart';
import { WeeklyBarsChart } from '@/components/charts/weekly-bars-chart';
import { Screen } from '@/components/screen';
import { MonthNavigator } from '@/components/statements/month-navigator';
import { ThemedText } from '@/components/themed-text';
import { TransactionDetailModal } from '@/components/transactions/transaction-detail-modal';
import { TransactionRow } from '@/components/transactions/transaction-row';
import { ChipSelect } from '@/components/ui/chip-select';
import { Radii, Spacing, type ThemeColor } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useMonthlyStatement } from '@/hooks/use-monthly-statement';
import { useTimeline } from '@/hooks/use-timeline';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionListItem, TransactionType } from '@/schemas/transaction';

const FILTERS: { label: string; value: number; types: TransactionType[] | null }[] = [
  { label: 'All', value: 0, types: null },
  { label: 'Income', value: 1, types: ['income'] },
  { label: 'Expenses', value: 2, types: ['expense'] },
  { label: 'Cards', value: 3, types: ['cc_purchase', 'cc_payment'] },
  { label: 'Loans', value: 4, types: ['lend', 'lend_return', 'borrow', 'borrow_repay'] },
  { label: 'Investing', value: 5, types: ['invest_add', 'invest_withdraw'] },
  { label: 'Transfers', value: 6, types: ['transfer', 'adjustment'] },
];

function Card({ title, children }: { title?: string; children: React.ReactNode }) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      {title ? (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {title}
        </ThemedText>
      ) : null}
      {children}
    </View>
  );
}

function Line({
  label,
  value,
  tone = 'text',
  strong,
}: {
  label: string;
  value: string;
  tone?: ThemeColor;
  strong?: boolean;
}) {
  return (
    <View style={styles.line}>
      <ThemedText type={strong ? 'smallBold' : 'small'} themeColor={strong ? 'text' : 'textSecondary'}>
        {label}
      </ThemedText>
      <ThemedText type={strong ? 'smallBold' : 'small'} themeColor={tone} style={styles.tabular}>
        {value}
      </ThemedText>
    </View>
  );
}

export default function StatementsScreen() {
  const theme = useTheme();
  const [month, setMonth] = useState(new Date());
  const [filter, setFilter] = useState(0);
  const [detail, setDetail] = useState<TransactionListItem | null>(null);

  const { data: statement, isLoading } = useMonthlyStatement(month);
  const { data: timeline } = useTimeline(month);

  const activeTypes = FILTERS.find((f) => f.value === filter)?.types ?? null;
  const filtered = useMemo(() => {
    const list = timeline ?? [];
    if (!activeTypes) return list;
    return list.filter((t) => activeTypes.includes(t.type));
  }, [timeline, activeTypes]);

  return (
    <Screen title="Statements" subtitle="Monthly report">
      <MonthNavigator month={month} onChange={setMonth} />

      {isLoading || !statement ? (
        <ActivityIndicator color={theme.brand} style={{ marginTop: Spacing.five }} />
      ) : (
        <>
          <Card title="SUMMARY">
            <Line label="Income" value={formatMoney(statement.totals.income)} tone="positive" />
            <Line label="Expenses" value={formatMoney(statement.totals.expenses)} tone="negative" />
            <Line
              label="Card payments"
              value={formatMoney(statement.totals.cardPayments)}
              tone="negative"
            />
            <Line label="Invested" value={formatMoney(statement.totals.invested)} />
            <View style={[styles.divider, { backgroundColor: theme.border }]} />
            <Line
              label="Savings"
              value={formatMoney(statement.savings)}
              tone={statement.savings >= 0 ? 'success' : 'danger'}
              strong
            />
            <Line
              label="Net cash flow"
              value={formatMoney(statement.totals.netCashFlow)}
              tone={statement.totals.netCashFlow >= 0 ? 'success' : 'danger'}
              strong
            />
          </Card>

          <Card title="SPENDING BY CATEGORY">
            <CategoryBarChart data={statement.byCategory} />
          </Card>

          <Card title="WEEKLY INCOME VS SPENDING">
            <WeeklyBarsChart
              data={statement.weeks.map((w) => ({
                label: w.label,
                income: w.income,
                spending: w.spending,
              }))}
            />
          </Card>

          <Card title="SAVINGS TREND">
            <SavingsTrendChart
              data={statement.weeks.map((w) => ({ label: w.label, savings: w.savings }))}
            />
          </Card>

          {(statement.cards.purchases > 0 || statement.cards.payments > 0) && (
            <Card title="CREDIT CARDS">
              <Line label="Purchases" value={formatMoney(statement.cards.purchases)} />
              <Line
                label="Bill payments"
                value={formatMoney(statement.cards.payments)}
                tone="negative"
              />
            </Card>
          )}

          {(statement.loans.lent > 0 ||
            statement.loans.returned > 0 ||
            statement.loans.borrowed > 0 ||
            statement.loans.repaid > 0) && (
            <Card title="LENDING & BORROWING">
              <Line label="Lent" value={formatMoney(statement.loans.lent)} />
              <Line label="Returned to you" value={formatMoney(statement.loans.returned)} />
              <Line label="Borrowed" value={formatMoney(statement.loans.borrowed)} />
              <Line label="Repaid by you" value={formatMoney(statement.loans.repaid)} />
            </Card>
          )}

          <Card title="TRANSACTION TIMELINE">
            <ChipSelect
              options={FILTERS.map((f) => ({ label: f.label, value: f.value }))}
              value={filter}
              onChange={setFilter}
            />
            {filtered.length === 0 ? (
              <ThemedText type="small" themeColor="textTertiary">
                Nothing recorded for this filter.
              </ThemedText>
            ) : (
              <View>
                {filtered.map((item, i) => (
                  <View key={item.id}>
                    {i > 0 && <View style={[styles.divider, { backgroundColor: theme.border }]} />}
                    <TransactionRow item={item} onPress={() => setDetail(item)} />
                  </View>
                ))}
              </View>
            )}
          </Card>
        </>
      )}

      <TransactionDetailModal item={detail} onClose={() => setDetail(null)} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.half,
  },
});
