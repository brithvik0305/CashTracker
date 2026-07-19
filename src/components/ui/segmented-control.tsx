/** Simple segmented selector for choosing one option from a small set. */

import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export interface SegmentOption<T extends string | number> {
  label: string;
  value: T;
}

interface SegmentedControlProps<T extends string | number> {
  label?: string;
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
}

export function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
}: SegmentedControlProps<T>) {
  const theme = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? (
        <ThemedText type="smallBold" themeColor="textSecondary">
          {label}
        </ThemedText>
      ) : null}
      <View style={[styles.row, { backgroundColor: theme.backgroundSelected }]}>
        {options.map((opt) => {
          const selected = opt.value === value;
          return (
            <Pressable
              key={String(opt.value)}
              onPress={() => onChange(opt.value)}
              style={[styles.segment, selected && { backgroundColor: theme.card }]}>
              <ThemedText type="smallBold" themeColor={selected ? 'text' : 'textSecondary'}>
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
    gap: Spacing.half,
    padding: Spacing.half,
    borderRadius: Radii.md,
  },
  segment: {
    flexGrow: 1,
    minWidth: 72,
    paddingVertical: Spacing.two,
    paddingHorizontal: Spacing.three,
    borderRadius: Radii.sm,
    alignItems: 'center',
  },
});
