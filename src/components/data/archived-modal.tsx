/**
 * Archived items: bring anything back, or remove it for good.
 *
 * Archiving hides a record but keeps its history. Without this screen that
 * would be a one-way door, so everything archived is listed here with a way
 * back.
 */

import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Radii, Spacing } from '@/constants/theme';
import { useArchivedRecords, useDeleteRecordFlow, useUnarchiveRecord } from '@/hooks/use-records';
import { useTheme } from '@/hooks/use-theme';
import { RECORD_LABELS } from '@/repositories/records-repository';

export function ArchivedModal({ visible, onClose }: { visible: boolean; onClose: () => void }) {
  const theme = useTheme();
  const { data: archived } = useArchivedRecords();
  const restore = useUnarchiveRecord();
  const { confirmDelete } = useDeleteRecordFlow();

  const list = archived ?? [];

  return (
    <AppModal visible={visible} onClose={onClose} title="Archived items">
      {list.length === 0 ? (
        <ThemedText type="small" themeColor="textTertiary">
          Nothing is archived. Archived accounts, cards, people, investments, and categories show up
          here so you can restore them.
        </ThemedText>
      ) : (
        <>
          <ThemedText type="small" themeColor="textTertiary">
            Restore an item to use it again, or delete it permanently.
          </ThemedText>
          {list.map((item) => (
            <View
              key={`${item.kind}-${item.id}`}
              style={[
                styles.row,
                { backgroundColor: theme.background, borderColor: theme.border },
              ]}>
              <View style={styles.info}>
                <ThemedText type="smallBold">{item.label}</ThemedText>
                <ThemedText type="small" themeColor="textTertiary">
                  {RECORD_LABELS[item.kind]}
                </ThemedText>
              </View>
              <Pressable
                onPress={() => restore.mutate({ kind: item.kind, id: item.id })}
                hitSlop={8}
                style={styles.icon}
                accessibilityLabel={`Restore ${item.label}`}>
                <Ionicons name="arrow-undo-outline" size={20} color={theme.brand} />
              </Pressable>
              <Pressable
                onPress={() => confirmDelete(item.kind, item.id, item.label)}
                hitSlop={8}
                style={styles.icon}
                accessibilityLabel={`Delete ${item.label}`}>
                <Ionicons name="trash-outline" size={20} color={theme.danger} />
              </Pressable>
            </View>
          ))}
        </>
      )}
    </AppModal>
  );
}

const styles = StyleSheet.create({
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
