/**
 * Screen — a consistent, safe-area-aware page container.
 *
 * Gives every screen the same background, horizontal padding, optional scrolling,
 * and an optional header (title + subtitle). Keeps screens uncluttered and uniform.
 */

import { ScrollView, StyleSheet, View, type ViewProps } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { BottomTabInset, MaxContentWidth, Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';

interface ScreenProps extends ViewProps {
  title?: string;
  subtitle?: string;
  /** Wrap content in a ScrollView (default true). */
  scroll?: boolean;
}

export function Screen({ title, subtitle, scroll = true, children, style, ...rest }: ScreenProps) {
  const theme = useTheme();

  const header =
    title || subtitle ? (
      <View style={styles.header}>
        {title ? <ThemedText type="subtitle">{title}</ThemedText> : null}
        {subtitle ? (
          <ThemedText themeColor="textSecondary" type="small">
            {subtitle}
          </ThemedText>
        ) : null}
      </View>
    ) : null;

  const body = (
    <View style={[styles.content, style]} {...rest}>
      {header}
      {children}
    </View>
  );

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: theme.background }]} edges={['top']}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          {body}
        </ScrollView>
      ) : (
        body
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: BottomTabInset + Spacing.four,
  },
  content: {
    width: '100%',
    maxWidth: MaxContentWidth,
    alignSelf: 'center',
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.four,
    gap: Spacing.four,
  },
  header: {
    gap: Spacing.one,
  },
});
