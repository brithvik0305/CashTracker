/** A tappable account row showing name, type, and live balance. */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { formatMoney } from '@/domain/money';
import { useTheme } from '@/hooks/use-theme';
import type { AccountWithBalance } from '@/schemas/account';

export function AccountCard({
  account,
  onPress,
}: {
  account: AccountWithBalance;
  onPress: () => void;
}) {
  const theme = useTheme();
  const negative = account.current_balance < 0;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.icon, { backgroundColor: theme.brandSubtle }]}>
        <Ionicons
          name={account.type === 'savings' ? 'save-outline' : 'card-outline'}
          size={20}
          color={theme.brand}
        />
      </View>
      <View style={styles.info}>
        <ThemedText type="smallBold">{account.name}</ThemedText>
        <ThemedText type="small" themeColor="textTertiary">
          {account.type === 'savings' ? 'Savings' : 'Bank account'}
        </ThemedText>
      </View>
      <ThemedText
        type="smallBold"
        themeColor={negative ? 'danger' : 'text'}
        style={styles.balance}>
        {formatMoney(account.current_balance)}
      </ThemedText>
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
  balance: {
    fontVariant: ['tabular-nums'],
  },
});
