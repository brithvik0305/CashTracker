/**
 * Payday moment.
 *
 * The financial week starts on Wednesday, which is also when freelance payment
 * arrives, so on Wednesdays the dashboard marks the new week and shows how the
 * previous one closed out. Renders nothing on any other day.
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Shadow, Spacing } from '@/constants/theme';
import { DEFAULT_WEEK_START_DAY } from '@/domain/financial-week';
import { formatMoney } from '@/domain/money';
import { usePreviousWeekSummary } from '@/hooks/use-weekly-summary';
import { useTheme } from '@/hooks/use-theme';

function Figure({ label, value, tone }: { label: string; value: string; tone?: 'up' | 'down' }) {
  return (
    <View style={styles.figure}>
      <ThemedText type="small" themeColor="textTertiary">
        {label}
      </ThemedText>
      <ThemedText
        type="smallBold"
        themeColor={tone === 'up' ? 'success' : tone === 'down' ? 'danger' : 'text'}
        style={styles.tabular}>
        {value}
      </ThemedText>
    </View>
  );
}

export function NewWeekBanner() {
  const theme = useTheme();
  const { data } = usePreviousWeekSummary();

  const isWeekStart = new Date().getDay() === DEFAULT_WEEK_START_DAY;
  if (!isWeekStart || !data) return null;

  const hadActivity = data.income > 0 || data.spending > 0;
  const weekLabel = `${format(new Date(`${data.startISO}T00:00:00`), 'd MMM')} – ${format(
    new Date(`${data.endISO}T00:00:00`),
    'd MMM',
  )}`;

  return (
    <View style={[styles.card, Shadow.card, { backgroundColor: theme.brandSubtle, borderColor: theme.cardBorder }]}>
      <View style={styles.header}>
        <Ionicons name="sparkles-outline" size={18} color={theme.brand} />
        <ThemedText type="smallBold" themeColor="brand">
          New financial week
        </ThemedText>
      </View>

      {hadActivity ? (
        <>
          <ThemedText type="small" themeColor="textSecondary">
            Last week ({weekLabel}) closed out like this:
          </ThemedText>
          <View style={styles.figures}>
            <Figure label="Earned" value={formatMoney(data.income, { decimals: false })} tone="up" />
            <Figure label="Spent" value={formatMoney(data.spending, { decimals: false })} />
            <Figure
              label={data.savings >= 0 ? 'Saved' : 'Overspent'}
              value={formatMoney(Math.abs(data.savings), { decimals: false })}
              tone={data.savings >= 0 ? 'up' : 'down'}
            />
          </View>
        </>
      ) : (
        <ThemedText type="small" themeColor="textSecondary">
          A fresh week starts today. Record this week&apos;s payment to see what&apos;s safe to
          spend.
        </ThemedText>
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
    alignItems: 'center',
    gap: Spacing.two,
  },
  figures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  figure: {
    gap: 2,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
