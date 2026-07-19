/** Month stepper for the statement. Cannot advance past the current month. */

import { Ionicons } from '@expo/vector-icons';
import { addMonths, format, isSameMonth } from 'date-fns';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export function MonthNavigator({
  month,
  onChange,
}: {
  month: Date;
  onChange: (next: Date) => void;
}) {
  const theme = useTheme();
  const atCurrentMonth = isSameMonth(month, new Date());

  return (
    <View style={[styles.wrap, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <Pressable
        onPress={() => onChange(addMonths(month, -1))}
        hitSlop={8}
        style={styles.button}>
        <Ionicons name="chevron-back" size={20} color={theme.text} />
      </Pressable>

      <ThemedText type="smallBold">{format(month, 'MMMM yyyy')}</ThemedText>

      <Pressable
        onPress={() => !atCurrentMonth && onChange(addMonths(month, 1))}
        disabled={atCurrentMonth}
        hitSlop={8}
        style={styles.button}>
        <Ionicons
          name="chevron-forward"
          size={20}
          color={atCurrentMonth ? theme.textTertiary : theme.text}
        />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  button: {
    padding: Spacing.one,
  },
});
