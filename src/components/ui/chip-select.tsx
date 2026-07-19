/** Wrapping chip selector for choosing one option from a list (e.g. categories). */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface ChipOption {
  label: string;
  value: number;
  icon?: string | null;
}

interface ChipSelectProps {
  label?: string;
  options: ChipOption[];
  value: number | null;
  onChange: (value: number) => void;
}

export function ChipSelect({ label, options, value, onChange }: ChipSelectProps) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
      <View style={styles.row}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={opt.value}
              onPress={() => onChange(opt.value)}
              style={[
                styles.chip,
                {
                  backgroundColor: selected ? theme.brand : theme.backgroundSelected,
                  borderColor: selected ? theme.brand : theme.border,
                },
              ]}>
              {opt.icon ? (
                <Ionicons
                  name={opt.icon as never}
                  size={14}
                  color={selected ? theme.textInverse : theme.textSecondary}
                />
              ) : null}
              <ThemedText type="smallBold" themeColor={selected ? 'textInverse' : 'text'}>
                {opt.label}
              </ThemedText>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.two,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.pill,
    borderWidth: StyleSheet.hairlineWidth,
  },
});
