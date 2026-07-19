/**
 * ComingSoon — placeholder body for screens whose features arrive in a later
 * milestone. Keeps the app navigable and honest about what is not built yet.
 */

import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ComingSoonProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  milestone: string;
  description: string;
}

export function ComingSoon({ icon, milestone, description }: ComingSoonProps) {
  const theme = useTheme();
  return (
    <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: theme.brandSubtle }]}>
        <Ionicons name={icon} size={22} color={theme.brand} />
      </View>
      <ThemedText type="smallBold" themeColor="textSecondary">
        {milestone}
      </ThemedText>
      <ThemedText type="small" themeColor="textTertiary" style={styles.description}>
        {description}
      </ThemedText>
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
  iconWrap: {
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
});
