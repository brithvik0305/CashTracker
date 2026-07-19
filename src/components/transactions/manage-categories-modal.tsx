/** Add, rename, and archive expense categories. */

import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { AppModal } from '@/components/ui/app-modal';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import { Spacing } from '@/constants/theme';
import {
  useArchiveCategory,
  useCategories,
  useCreateCategory,
  useRenameCategory,
} from '@/hooks/use-categories';
import { useDeleteRecordFlow } from '@/hooks/use-records';
import { useTheme } from '@/hooks/use-theme';
import type { Category } from '@/schemas/category';

function CategoryEditRow({ category }: { category: Category }) {
  const theme = useTheme();
  const [name, setName] = useState(category.name);
  const rename = useRenameCategory();
  const archive = useArchiveCategory();
  const { confirmDelete } = useDeleteRecordFlow();

  const commit = () => {
    const trimmed = name.trim();
    if (trimmed && trimmed !== category.name) {
      rename.mutate({ id: category.id, name: trimmed });
    } else if (!trimmed) {
      setName(category.name);
    }
  };

  return (
    <View style={styles.row}>
      <View style={styles.grow}>
        <TextField value={name} onChangeText={setName} onEndEditing={commit} />
      </View>
      <Pressable
        onPress={() => archive.mutate(category.id)}
        hitSlop={10}
        style={styles.trash}
        accessibilityLabel={`Archive ${category.name}`}>
        <Ionicons name="archive-outline" size={20} color={theme.textSecondary} />
      </Pressable>
      <Pressable
        onPress={() => confirmDelete('category', category.id, category.name)}
        hitSlop={10}
        style={styles.trash}
        accessibilityLabel={`Delete ${category.name}`}>
        <Ionicons name="trash-outline" size={20} color={theme.danger} />
      </Pressable>
    </View>
  );
}

export function ManageCategoriesModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { data: categories } = useCategories();
  const create = useCreateCategory();
  const [newName, setNewName] = useState('');

  const add = async () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    await create.mutateAsync(trimmed);
    setNewName('');
  };

  return (
    <AppModal visible={visible} onClose={onClose} title="Categories">
      <View style={styles.addRow}>
        <View style={styles.grow}>
          <TextField
            placeholder="New category"
            value={newName}
            onChangeText={setNewName}
            onSubmitEditing={add}
          />
        </View>
        <Button title="Add" onPress={add} loading={create.isPending} disabled={!newName.trim()} />
      </View>

      <ThemedText type="smallBold" themeColor="textSecondary">
        YOUR CATEGORIES
      </ThemedText>
      {(categories ?? []).map((category) => (
        <CategoryEditRow key={category.id} category={category} />
      ))}
    </AppModal>
  );
}

const styles = StyleSheet.create({
  addRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: Spacing.two,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
  },
  grow: {
    flex: 1,
  },
  trash: {
    padding: Spacing.two,
  },
});
