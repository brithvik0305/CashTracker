/** Grouped vertical bars comparing income vs spending for each financial week. */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';

const CHART_HEIGHT = 120;

export interface WeeklyDatum {
  label: string;
  income: number;
  spending: number;
}

export function WeeklyBarsChart({ data }: { data: WeeklyDatum[] }) {
  const theme = useTheme();
  const max = Math.max(...data.flatMap((d) => [d.income, d.spending]), 1);
  const hasAny = data.some((d) => d.income > 0 || d.spending > 0);

  if (!hasAny) {
    return (
      <ThemedText type="small" themeColor="textTertiary">
        No income or spending recorded this month.
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.legend}>
        <Legend color={theme.success} label="Income" />
        <Legend color={theme.brand} label="Spending" />
      </View>

      <View style={styles.chart}>
        {data.map((d) => (
          <View key={d.label} style={styles.column}>
            <View style={styles.bars}>
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((d.income / max) * CHART_HEIGHT, d.income > 0 ? 3 : 0),
                    backgroundColor: theme.success,
                  },
                ]}
              />
              <View
                style={[
                  styles.bar,
                  {
                    height: Math.max((d.spending / max) * CHART_HEIGHT, d.spending > 0 ? 3 : 0),
                    backgroundColor: theme.brand,
                  },
                ]}
              />
            </View>
            <ThemedText type="small" themeColor="textTertiary" style={styles.tick}>
              {d.label}
            </ThemedText>
          </View>
        ))}
      </View>

      <ThemedText type="small" themeColor="textTertiary">
        Peak week: {formatMoney(max, { decimals: false })}
      </ThemedText>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.swatch, { backgroundColor: color }]} />
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  legend: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  swatch: {
    width: 10,
    height: 10,
    borderRadius: Radii.pill,
  },
  chart: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    height: CHART_HEIGHT + 22,
    gap: Spacing.one,
  },
  column: {
    flex: 1,
    alignItems: 'center',
    gap: Spacing.one,
  },
  bars: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 3,
    height: CHART_HEIGHT,
  },
  bar: {
    width: 10,
    borderTopLeftRadius: Radii.sm,
    borderTopRightRadius: Radii.sm,
  },
  tick: {
    fontSize: 10,
  },
});
