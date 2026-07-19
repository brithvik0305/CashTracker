/**
 * StatCard — a rounded metric card used across the dashboard.
 *
 * `tone` maps to the semantic status palette (used later by the weekly-spending
 * indicator). `emphasis="hero"` renders the large Safe To Spend card.
 */

import { StyleSheet, View, type ViewProps } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing, type ThemeColor } from '@/constants/theme';
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

interface StatCardProps extends ViewProps {
  label: string;
  value: string;
  caption?: string;
  tone?: StatTone;
  emphasis?: 'default' | 'hero';
}

export function StatCard({
  label,
  value,
  caption,
  tone = 'neutral',
  emphasis = 'default',
  style,
  ...rest
}: StatCardProps) {
  const theme = useTheme();
  const isHero = emphasis === 'hero';

  return (
    <View
      style={[
        styles.card,
        { backgroundColor: theme.card, borderColor: theme.border },
        isHero && styles.heroCard,
        style,
      ]}
      {...rest}>
      <ThemedText type="small" themeColor="textSecondary">
        {label}
      </ThemedText>
      <ThemedText
        themeColor={TONE_TEXT[tone]}
        style={[styles.value, isHero && styles.heroValue]}>
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
  heroCard: {
    borderRadius: Radii.xxl,
    padding: Spacing.four,
    gap: Spacing.two,
  },
  value: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  heroValue: {
    fontSize: 44,
    lineHeight: 50,
    fontWeight: '800',
  },
});
