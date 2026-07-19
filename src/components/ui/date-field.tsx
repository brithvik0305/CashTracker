/** Date selector backed by the native date picker. */

import DateTimePicker from '@react-native-community/datetimepicker';
import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { formatDisplayDate } from '@/lib/date';
import { useTheme } from '@/hooks/use-theme';

interface DateFieldProps {
  label?: string;
  value: Date;
  onChange: (date: Date) => void;
}

export function DateField({ label, value, onChange }: DateFieldProps) {
  const theme = useTheme();
  const [show, setShow] = useState(false);

  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
      <Pressable
        onPress={() => setShow(true)}
        style={[styles.field, { backgroundColor: theme.background, borderColor: theme.border }]}>
        <ThemedText type="default">{formatDisplayDate(value.toISOString())}</ThemedText>
        <Ionicons name="calendar-outline" size={18} color={theme.textSecondary} />
      </Pressable>
      {show && (
        <DateTimePicker
          value={value}
          mode="date"
          maximumDate={new Date()}
          onChange={(_, selected) => {
            setShow(false);
            if (selected) onChange(selected);
          }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  field: {
    minHeight: 48,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
