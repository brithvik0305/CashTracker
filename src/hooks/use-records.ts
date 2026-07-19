/**
 * Record maintenance hooks: permanently delete, restore archived records, and
 * a ready-made delete flow that tells you exactly what will go with it.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { queryKeys } from '@/lib/query-client';
import {
  countLinkedTransactions,
  deleteRecord,
  listArchivedRecords,
  unarchiveRecord,
  type RecordKind,
} from '@/repositories/records-repository';

export function useArchivedRecords() {
  return useQuery({
    queryKey: queryKeys.archived,
    queryFn: () => listArchivedRecords(),
  });
}

/** Any record change can affect balances and lists, so refetch everything. */
function useResetEverything() {
  const client = useQueryClient();
  return () => client.invalidateQueries();
}

export function useUnarchiveRecord() {
  const resetAll = useResetEverything();
  return useMutation({
    mutationFn: ({ kind, id }: { kind: RecordKind; id: number }) => unarchiveRecord(kind, id),
    onSuccess: resetAll,
  });
}

export function useDeleteRecord() {
  const resetAll = useResetEverything();
  return useMutation({
    mutationFn: ({ kind, id }: { kind: RecordKind; id: number }) => deleteRecord(kind, id),
    onSuccess: resetAll,
  });
}

/**
 * Confirms and performs a permanent delete. The prompt states how many
 * transactions are attached so the consequence is never a surprise.
 */
export function useDeleteRecordFlow() {
  const remove = useDeleteRecord();

  const confirmDelete = async (
    kind: RecordKind,
    id: number,
    label: string,
    onDeleted?: () => void,
  ) => {
    const linked = await countLinkedTransactions(kind, id);

    const consequence =
      kind === 'category'
        ? linked > 0
          ? `${linked} transaction${linked === 1 ? '' : 's'} will become uncategorised.`
          : 'No transactions use this category.'
        : linked > 0
          ? `Its ${linked} transaction${linked === 1 ? '' : 's'} will also be deleted, and balances will update.`
          : 'It has no transactions.';

    Alert.alert(`Delete ${label} permanently?`, `${consequence} This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await remove.mutateAsync({ kind, id });
            onDeleted?.();
          } catch (error) {
            Alert.alert(
              'Could not delete',
              error instanceof Error ? error.message : String(error),
            );
          }
        },
      },
    ]);
  };

  return { confirmDelete, isPending: remove.isPending };
}
