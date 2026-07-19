/**
 * StatCard — a rounded metric card used across the dashboard.
 *
 * `tone` maps to the semantic status palette. An optional icon gives each card a
 * touch of colour so a row of figures does not read as a wall of text.
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Shadow, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

export type StatTone = 'neutral' | 'brand' | 'success' | 'warning' | 'caution' | 'danger';

const TONE_TEXT: Record<StatTone, ThemeColor> = {
  neutral: 'text',
  brand: 'brand',
  success: 'success',
  warning: 'warning',
  caution: 'caution',
  danger: 'danger',
};

const TONE_ACCENT: Record<StatTone, ThemeColor> = {
  neutral: 'brand',
  brand: 'brand',
  success: 'success',
  warning: 'warning',
  caution: 'caution',
  danger: 'danger',
};

const TONE_SUBTLE: Record<StatTone, ThemeColor> = {
  neutral: 'brandSubtle',
  brand: 'brandSubtle',
  success: 'successSubtle',
  warning: 'warningSubtle',
  caution: 'cautionSubtle',
  danger: 'dangerSubtle',
};

interface StatCardProps extends ViewProps {
  label: string;
  value: string;
  caption?: string;
  tone?: StatTone;
  icon?: React.ComponentProps<typeof Ionicons>['name'];
}

export function StatCard({
  label,
  value,
  caption,
  tone = 'neutral',
  icon,
  style,
  ...rest
}: StatCardProps) {
  const theme = useTheme();

  return (
    <View
      style={[
        styles.card,
        Shadow.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder },
        style,
      ]}
      {...rest}>
      <View style={styles.header}>
        {icon ? (
          <View style={[styles.icon, { backgroundColor: theme[TONE_SUBTLE[tone]] }]}>
            <Ionicons name={icon} size={12} color={theme[TONE_ACCENT[tone]]} />
          </View>
        ) : null}
        <ThemedText type="small" themeColor="textSecondary" numberOfLines={1} style={styles.label}>
          {label}
        </ThemedText>
      </View>
      <ThemedText themeColor={TONE_TEXT[tone]} style={styles.value}>
        {value}
      </ThemedText>
      {caption ? (
        <ThemedText type="small" themeColor="textTertiary">
          {caption}
        </ThemedText>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
    gap: Spacing.one,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  icon: {
    width: 20,
    height: 20,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  label: {
    flex: 1,
  },
  value: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
});
