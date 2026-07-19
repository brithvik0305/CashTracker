/**
 * Weekly spending indicator card: spending vs income for the financial week,
 * with a tier-coloured progress bar and status (green/yellow/orange/red).
 */

import { format } from 'date-fns';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Radii, Shadow, Spacing, type ThemeColor } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import type { SpendingTier } from '@/domain/spending-indicator';
import { useWeeklySummary } from '@/hooks/use-weekly-summary';
import { useTheme } from '@/hooks/use-theme';

const TIER_COLOR: Record<SpendingTier, ThemeColor> = {
  green: 'success',
  yellow: 'warning',
  orange: 'caution',
  red: 'danger',
};

function rangeLabel(startISO: string, endISO: string): string {
  const start = new Date(`${startISO}T00:00:00`);
  const end = new Date(`${endISO}T00:00:00`);
  return `${format(start, 'd MMM')} – ${format(end, 'd MMM')}`;
}

export function WeeklySpendingCard() {
  const theme = useTheme();
  const { data } = useWeeklySummary();

  const income = data?.income ?? 0;
  const spending = data?.spending ?? 0;
  const status = data?.status;
  const color = status ? theme[TIER_COLOR[status.tier]] : theme.textTertiary;

  return (
    <View style={[styles.card, Shadow.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={styles.header}>
        <ThemedText type="smallBold" themeColor="textSecondary">
          WEEKLY SPENDING
        </ThemedText>
        {data && (
          <ThemedText type="small" themeColor="textTertiary">
            {rangeLabel(data.startISO, data.endISO)}
          </ThemedText>
        )}
      </View>

      <View style={styles.amounts}>
        <ThemedText type="subtitle" style={styles.spent}>
          {formatMoney(spending, { decimals: false })}
        </ThemedText>
        <ThemedText type="small" themeColor="textTertiary">
          {income > 0 ? `of ${formatMoney(income, { decimals: false })} income` : 'no income yet'}
        </ThemedText>
      </View>

      <ProgressBar percent={status?.percent ?? 0} color={color} />

      {status && (
        <View style={styles.statusRow}>
          <View style={[styles.dot, { backgroundColor: color }]} />
          <ThemedText type="smallBold" style={{ color }}>
            {status.label}
          </ThemedText>
          {income > 0 && (
            <ThemedText type="small" themeColor="textTertiary">
              {Math.round(status.percent)}% spent
            </ThemedText>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: Spacing.two,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  amounts: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: Spacing.two,
  },
  spent: {
    fontSize: 28,
    lineHeight: 32,
    fontVariant: ['tabular-nums'],
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
});
