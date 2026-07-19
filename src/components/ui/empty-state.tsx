/**
 * Empty state with an optional call to action. Replaces the placeholder card
 * that stood in for this during earlier milestones.
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Radii, Shadow, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface EmptyStateProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon,
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  const theme = useTheme();

  return (
    <View style={[styles.card, Shadow.card, { backgroundColor: theme.card, borderColor: theme.cardBorder }]}>
      <View style={[styles.icon, { backgroundColor: theme.brandSubtle }]}>
        <Ionicons name={icon} size={22} color={theme.brand} />
      </View>
      <ThemedText type="smallBold">{title}</ThemedText>
      <ThemedText type="small" themeColor="textTertiary" style={styles.description}>
        {description}
      </ThemedText>
      {actionLabel && onAction ? (
        <Button title={actionLabel} onPress={onAction} style={styles.action} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.four,
    alignItems: 'center',
    gap: Spacing.two,
  },
  icon: {
    width: 48,
    height: 48,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.one,
  },
  description: {
    textAlign: 'center',
  },
  action: {
    marginTop: Spacing.two,
    alignSelf: 'stretch',
  },
});
