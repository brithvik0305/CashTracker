/** Large tappable action tile with an icon, title, and subtitle. */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { Radii, Shadow, Spacing, type ThemeColor } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ActionTileProps {
  icon: React.ComponentProps<typeof Ionicons>['name'];
  title: string;
  subtitle: string;
  tone?: Extract<ThemeColor, 'brand' | 'success' | 'danger' | 'caution'>;
  onPress: () => void;
}

export function ActionTile({ icon, title, subtitle, tone = 'brand', onPress }: ActionTileProps) {
  const theme = useTheme();
  const subtleKey = `${tone}Subtle` as ThemeColor;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.tile,
        Shadow.card,
        { backgroundColor: theme.card, borderColor: theme.cardBorder, opacity: pressed ? 0.85 : 1 },
      ]}>
      <View style={[styles.icon, { backgroundColor: theme[subtleKey] }]}>
        <Ionicons name={icon} size={22} color={theme[tone]} />
      </View>
      <View style={styles.text}>
        <ThemedText type="smallBold">{title}</ThemedText>
        <ThemedText type="small" themeColor="textTertiary">
          {subtitle}
        </ThemedText>
      </View>
      <Ionicons name="chevron-forward" size={18} color={theme.textTertiary} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.lg,
    padding: Spacing.three,
  },
  icon: {
    width: 44,
    height: 44,
    borderRadius: Radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    flex: 1,
    gap: 2,
  },
});
