/**
 * Data & backups: export CSV/JSON, take a manual backup, restore an automatic
 * backup, or restore from a file. Restores replace everything, so each one is
 * confirmed first.
 */

import { Ionicons } from '@expo/vector-icons';
import { format } from 'date-fns';
import { Alert, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { Radii, Spacing } from '@/constants/theme';
import {
  useBackups,
  useCreateBackup,
  useDeleteBackup,
  useExportCsv,
  useExportJson,
  useRestoreBackup,
  useRestoreFromFile,
} from '@/hooks/use-backups';
import { useTheme } from '@/hooks/use-theme';
import { MAX_BACKUPS, type BackupFile } from '@/services/backup-service';

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function reportError(error: unknown) {
  Alert.alert('Something went wrong', error instanceof Error ? error.message : String(error));
}

export function BackupsModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const { data: backups } = useBackups();
  const create = useCreateBackup();
  const remove = useDeleteBackup();
  const restore = useRestoreBackup();
  const restoreFile = useRestoreFromFile();
  const csv = useExportCsv();
  const json = useExportJson();

  const list = backups ?? [];

  const confirmRestore = (backup: BackupFile) => {
    Alert.alert(
      'Restore this backup?',
      'Everything currently in the app will be replaced by the contents of this backup. This cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Restore',
          style: 'destructive',
          onPress: async () => {
            try {
              const rows = await restore.mutateAsync(backup.uri);
              Alert.alert('Restored', `${rows} records were restored.`);
              onClose();
            } catch (error) {
              reportError(error);
            }
          },
        },
      ],
    );
  };

  const confirmRestoreFromFile = () => {
    Alert.alert(
      'Restore from a file?',
      'Choose a CashTracker JSON backup. Everything currently in the app will be replaced.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Choose file',
          onPress: async () => {
            try {
              const rows = await restoreFile.mutateAsync();
              if (rows === false) return;
              Alert.alert('Restored', `${rows} records were restored.`);
              onClose();
            } catch (error) {
              reportError(error);
            }
          },
        },
      ],
    );
  };

  const confirmDelete = (backup: BackupFile) => {
    Alert.alert('Delete this backup?', 'The backup file will be removed from your device.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => remove.mutate(backup.uri),
      },
    ]);
  };

  const run = async (action: () => Promise<unknown>) => {
    try {
      await action();
    } catch (error) {
      reportError(error);
    }
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Data & backups">
      <ThemedText type="smallBold" themeColor="textSecondary">
        EXPORT
      </ThemedText>
      <View style={styles.actions}>
        <Button
          title="Export CSV"
          variant="secondary"
          onPress={() => run(() => csv.mutateAsync())}
          loading={csv.isPending}
          style={styles.action}
        />
        <Button
          title="Export JSON"
          variant="secondary"
          onPress={() => run(() => json.mutateAsync())}
          loading={json.isPending}
          style={styles.action}
        />
      </View>
      <ThemedText type="small" themeColor="textTertiary">
        CSV lists every transaction. JSON is a complete backup you can restore later.
      </ThemedText>

      <View style={[styles.divider, { backgroundColor: theme.border }]} />

      <ThemedText type="smallBold" themeColor="textSecondary">
        BACKUPS
      </ThemedText>
      <ThemedText type="small" themeColor="textTertiary">
        A backup is taken automatically once a day. The most recent {MAX_BACKUPS} are kept.
      </ThemedText>
      <View style={styles.actions}>
        <Button
          title="Back up now"
          onPress={() => run(() => create.mutateAsync())}
          loading={create.isPending}
          style={styles.action}
        />
        <Button
          title="Restore file"
          variant="secondary"
          onPress={confirmRestoreFromFile}
          loading={restoreFile.isPending}
          style={styles.action}
        />
      </View>

      {list.length === 0 ? (
        <ThemedText type="small" themeColor="textTertiary">
          No backups yet.
        </ThemedText>
      ) : (
        list.map((backup) => (
          <View
            key={backup.uri}
            style={[styles.row, { backgroundColor: theme.background, borderColor: theme.border }]}>
            <View style={styles.info}>
              <ThemedText type="smallBold">
                {format(new Date(backup.createdAt), 'd MMM yyyy, HH:mm')}
              </ThemedText>
              <ThemedText type="small" themeColor="textTertiary">
                {formatSize(backup.size)}
              </ThemedText>
            </View>
            <Pressable onPress={() => confirmRestore(backup)} hitSlop={8} style={styles.icon}>
              <Ionicons name="refresh-outline" size={20} color={theme.brand} />
            </Pressable>
            <Pressable onPress={() => confirmDelete(backup)} hitSlop={8} style={styles.icon}>
              <Ionicons name="trash-outline" size={20} color={theme.danger} />
            </Pressable>
          </View>
        ))
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  actions: {
    flexDirection: 'row',
    gap: Spacing.two,
  },
  action: {
    flex: 1,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    marginVertical: Spacing.one,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.two,
  },
  info: {
    flex: 1,
    gap: 2,
  },
  icon: {
    padding: Spacing.one,
  },
});
