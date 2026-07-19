/** A lending/borrowing record: person, remaining amount, and repayment progress. */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ProgressBar } from '@/components/ui/progress-bar';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';
import type { LoanKind, LoanWithTotals } from '@/schemas/loan';

export function LoanCard({
  loan,
  kind,
  onPress,
}: {
  loan: LoanWithTotals;
  kind: LoanKind;
  onPress: () => void;
}) {
  const theme = useTheme();
  const settledUp = loan.remaining <= 0;
  const progress = loan.principal > 0 ? (loan.settled / loan.principal) * 100 : 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <Ionicons name="person-circle-outline" size={20} color={theme.brand} />
          <ThemedText type="smallBold">{loan.person}</ThemedText>
        </View>
        <ThemedText
          type="smallBold"
          themeColor={settledUp ? 'success' : kind === 'lending' ? 'positive' : 'negative'}
          style={styles.amount}>
          {settledUp ? 'Settled' : formatMoney(loan.remaining)}
        </ThemedText>
      </View>

      {loan.principal > 0 && (
        <>
          <ProgressBar percent={progress} color={settledUp ? theme.success : theme.brand} />
          <ThemedText type="small" themeColor="textTertiary">
            {formatMoney(loan.settled, { decimals: false })}{' '}
            {kind === 'lending' ? 'returned' : 'repaid'} of{' '}
            {formatMoney(loan.principal, { decimals: false })}
          </ThemedText>
        </>
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
  amount: {
    fontVariant: ['tabular-nums'],
  },
});
