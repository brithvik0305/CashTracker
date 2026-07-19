/** Horizontal bars for spending by category, largest first. */

import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { categoryColorAt, Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';

export interface CategoryDatum {
  name: string;
  total: number;
}

export function CategoryBarChart({ data }: { data: CategoryDatum[] }) {
  const theme = useTheme();
  const max = Math.max(...data.map((d) => d.total), 1);
  const grandTotal = data.reduce((s, d) => s + d.total, 0);

  if (data.length === 0) {
    return (
      <ThemedText type="small" themeColor="textTertiary">
        No spending recorded this month.
      </ThemedText>
    );
  }

  return (
    <View style={styles.wrap}>
      {data.map((d, index) => {
        const share = grandTotal > 0 ? Math.round((d.total / grandTotal) * 100) : 0;
        const color = categoryColorAt(index);
        return (
          <View key={d.name} style={styles.row}>
            <View style={styles.labelRow}>
              <View style={styles.nameRow}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <ThemedText type="small" numberOfLines={1} style={styles.label}>
                  {d.name}
                </ThemedText>
              </View>
              <ThemedText type="small" themeColor="textSecondary" style={styles.value}>
                {formatMoney(d.total, { decimals: false })} · {share}%
              </ThemedText>
            </View>
            <View style={[styles.track, { backgroundColor: theme.backgroundSelected }]}>
              <View
                style={[styles.fill, { width: `${(d.total / max) * 100}%`, backgroundColor: color }]}
              />
            </View>
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.two,
  },
  row: {
    gap: Spacing.half,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.two,
  },
  nameRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: Radii.pill,
  },
  label: {
    flex: 1,
  },
  value: {
    fontVariant: ['tabular-nums'],
  },
  track: {
    height: 8,
    borderRadius: Radii.pill,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: Radii.pill,
  },
});
