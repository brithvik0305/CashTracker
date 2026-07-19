/** A tappable credit-card summary: outstanding, limit usage, and statement due. */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { formatDisplayDate } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';
import type { CreditCardWithBalances } from '@/schemas/credit-card';

export function CreditCardCard({
  card,
  onPress,
}: {
  card: CreditCardWithBalances;
  onPress: () => void;
}) {
  const theme = useTheme();
  const usage = card.credit_limit > 0 ? (card.current_outstanding / card.credit_limit) * 100 : 0;
  const hasStatement = card.statement_outstanding > 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="card" size={18} color={theme.brand} />
          <ThemedText type="smallBold">{card.name}</ThemedText>
        </View>
        <ThemedText type="smallBold" style={styles.tabular}>
          {formatMoney(card.current_outstanding)}
        </ThemedText>
      </View>

      {card.credit_limit > 0 && (
        <>
          <ProgressBar percent={usage} color={theme.brand} />
          <ThemedText type="small" themeColor="textTertiary">
            {formatMoney(card.available_credit, { decimals: false })} available of{' '}
            {formatMoney(card.credit_limit, { decimals: false })}
          </ThemedText>
        </>
      )}

      {hasStatement && (
        <View style={[styles.statement, { backgroundColor: theme.cautionSubtle }]}>
          <ThemedText type="small" themeColor="caution">
            {formatMoney(card.statement_outstanding)} due
            {card.due_date ? ` by ${formatDisplayDate(card.due_date)}` : ''}
          </ThemedText>
        </View>
      )}
    </Pressable>
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
    justifyContent: 'space-between',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  tabular: {
    fontVariant: ['tabular-nums'],
  },
  statement: {
    borderRadius: Radii.sm,
    paddingVertical: Spacing.one,
    paddingHorizontal: Spacing.two,
    alignSelf: 'flex-start',
  },
});
