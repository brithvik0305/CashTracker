/** A single row in a transaction list / timeline. */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, type ThemeColor } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { describeTransaction, type DisplayTone } from '@/domain/transaction-display';
import { formatDisplayDate } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';
import type { TransactionListItem } from '@/schemas/transaction';

const TONE_COLOR: Record<DisplayTone, ThemeColor> = {
  positive: 'positive',
  negative: 'negative',
  neutral: 'text',
};

export function TransactionRow({
  item,
  onPress,
}: {
  item: TransactionListItem;
  onPress?: () => void;
}) {
  const theme = useTheme();
  const d = describeTransaction(item);
  const subtitleParts = [d.subtitle, formatDisplayDate(item.date)].filter(Boolean);

  return (
    <Pressable
      onPress={onPress}
      disabled={!onPress}
      style={({ pressed }) => [styles.row, { opacity: pressed && onPress ? 0.6 : 1 }]}>
      <View style={[styles.icon, { backgroundColor: theme.backgroundSelected }]}>
        <Ionicons name={d.icon as never} size={18} color={theme.textSecondary} />
      </View>
      <View style={styles.info}>
        <ThemedText type="smallBold" numberOfLines={1}>
          {d.title}
        </ThemedText>
        {subtitleParts.length > 0 && (
          <ThemedText type="small" themeColor="textTertiary" numberOfLines={1}>
            {subtitleParts.join(' · ')}
          </ThemedText>
        )}
      </View>
      <ThemedText type="smallBold" themeColor={TONE_COLOR[d.tone]} style={styles.amount}>
        {formatMoney(d.amount, { signed: d.tone === 'positive' })}
      </ThemedText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.two,
  },
  icon: {
    width: 36,
    height: 36,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  info: {
    flex: 1,
    gap: 2,
  },
  amount: {
    fontVariant: ['tabular-nums'],
  },
});
