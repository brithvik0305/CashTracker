/**
 * Weekly savings trend. Bars rise above the zero line in weeks you kept money
 * and drop below it in weeks you overspent.
 */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';

const HALF = 56;

export interface SavingsDatum {
  label: string;
  savings: number;
}

export function SavingsTrendChart({ data }: { data: SavingsDatum[] }) {
  const theme = useTheme();
  const maxAbs = Math.max(...data.map((d) => Math.abs(d.savings)), 1);
  const hasNegative = data.some((d) => d.savings < 0);
  const total = data.reduce((s, d) => s + d.savings, 0);

  if (data.every((d) => d.savings === 0)) {
    return (
      <ThemedText type="small" themeColor="textTertiary">
        No activity to chart this month.
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      <View style={styles.chart}>
        {data.map((d) => {
          const magnitude = (Math.abs(d.savings) / maxAbs) * HALF;
          const positive = d.savings >= 0;
          return (
            <View key={d.label} style={styles.column}>
              <View style={styles.topHalf}>
                {positive && (
                  <View
                    style={[
                      styles.bar,
                      styles.barUp,
                      { height: Math.max(magnitude, d.savings > 0 ? 3 : 0), backgroundColor: theme.success },
                    ]}
                  />
                )}
              </View>
              <View style={[styles.baseline, { backgroundColor: theme.border }]} />
              <View style={[styles.bottomHalf, { height: hasNegative ? HALF : 0 }]}>
                {!positive && (
                  <View
                    style={[
                      styles.bar,
                      styles.barDown,
                      { height: Math.max(magnitude, 3), backgroundColor: theme.danger },
                    ]}
                  />
                )}
              </View>
              <ThemedText type="small" themeColor="textTertiary" style={styles.tick}>
                {d.label}
              </ThemedText>
            </View>
          );
        })}
      </View>

      <ThemedText type="small" themeColor={total >= 0 ? 'success' : 'danger'}>
        {total >= 0 ? 'Saved' : 'Overspent'} {formatMoney(Math.abs(total), { decimals: false })} this
        month
      </ThemedText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  chart: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.one,
  },
  column: {
    flex: 1,
    alignItems: 'center',
  },
  topHalf: {
    height: HALF,
    justifyContent: 'flex-end',
  },
  bottomHalf: {
    justifyContent: 'flex-start',
  },
  baseline: {
    height: StyleSheet.hairlineWidth,
    alignSelf: 'stretch',
  },
  bar: {
    width: 14,
  },
  barUp: {
    borderTopLeftRadius: Radii.sm,
    borderTopRightRadius: Radii.sm,
  },
  barDown: {
    borderBottomLeftRadius: Radii.sm,
    borderBottomRightRadius: Radii.sm,
  },
  tick: {
    fontSize: 10,
    marginTop: Spacing.one,
  },
});
