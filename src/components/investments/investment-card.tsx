/** An investment holding: current value, type, and gain/loss vs amount invested. */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Shadow, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';
import {
  INVESTMENT_TYPE_LABELS,
  type InvestmentType,
  type InvestmentWithTotals,
} from '@/schemas/investment';

const ICONS: Record<InvestmentType, string> = {
  mutual_fund: 'stats-chart-outline',
  stock: 'trending-up-outline',
  gold: 'diamond-outline',
  fd: 'lock-closed-outline',
  other: 'briefcase-outline',
};

export function InvestmentCard({
  investment,
  onPress,
}: {
  investment: InvestmentWithTotals;
  onPress: () => void;
}) {
  const theme = useTheme();
  const gain = investment.gain;
  const hasGain = investment.current_value != null && gain !== 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        Shadow.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.icon, { backgroundColor: theme.brandSubtle }]}>
        <Ionicons name={ICONS[investment.type] as never} size={20} color={theme.brand} />
      </View>
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {investment.name}
        </ThemedText>
        <ThemedText type="small" themeColor="textTertiary">
          {INVESTMENT_TYPE_LABELS[investment.type]} ·{' '}
          {formatMoney(investment.net_invested, { decimals: false })} invested
        </ThemedText>
      </View>
      <View style={styles.values}>
        <ThemedText type="smallBold" style={styles.tabular}>
          {formatMoney(investment.value)}
        </ThemedText>
        {hasGain && (
          <ThemedText
            type="small"
            themeColor={gain > 0 ? 'positive' : 'negative'}
            style={styles.tabular}>
            {gain > 0 ? '+' : ''}
            {formatMoney(gain, { decimals: false })}
          </ThemedText>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  values: {
    alignItems: 'flex-end',
    gap: 2,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
});
