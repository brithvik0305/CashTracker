/** App settings: appearance plus a summary of the fixed financial rules. */

import { StyleSheet, View } from 'react-native';
import Constants from 'expo-constants';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { SegmentedControl } from '@/components/ui/segmented-control';
import { Spacing } from '@/constants/theme';
import { useTheme } from '@/hooks/use-theme';
import { useUiStore } from '@/store/ui-store';
import type { ThemeMode } from '@/schemas/settings';

const THEME_OPTIONS: { label: string; value: ThemeMode }[] = [
  { label: 'System', value: 'system' },
  { label: 'Light', value: 'light' },
  { label: 'Dark', value: 'dark' },
];

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <ThemedText type="small" themeColor="textTertiary">
        {label}
      </ThemedText>
      <ThemedText type="small">{value}</ThemedText>
    </View>
  );
}

export function SettingsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const themeMode = useUiStore((state) => state.themeMode);
  const setThemeMode = useUiStore((state) => state.setThemeMode);

  const version = Constants.expoConfig?.version ?? '1.0.0';

  return (
    <AppModal visible={visible} onClose={onClose} title="Settings">
      <ThemedText type="smallBold" themeColor="textSecondary">
        APPEARANCE
      </ThemedText>
      <SegmentedControl
        label="Theme"
        value={themeMode}
        onChange={setThemeMode}
        options={THEME_OPTIONS}
      />
      <ThemedText type="small" themeColor="textTertiary">
        System follows your phone&apos;s light or dark setting.
      </ThemedText>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="smallBold" themeColor="textSecondary">
        FINANCIAL RULES
      </ThemedText>
      <Row label="Currency" value="Indian Rupee (₹)" />
      <Row label="Financial week" value="Wednesday to Tuesday" />
      <Row label="Month & year" value="Calendar" />
      <ThemedText type="small" themeColor="textTertiary">
        Safe to Spend = cash + owed to you − you owe − unpaid card statements. Investments are
        excluded because they are locked.
      </ThemedText>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="smallBold" themeColor="textSecondary">
        ABOUT
      </ThemedText>
      <Row label="Version" value={version} />
      <Row label="Storage" value="On this device only" />
    </AppModal>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.three,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
});
