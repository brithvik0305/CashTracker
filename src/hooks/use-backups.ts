/**
 * Backup and export hooks. A restore replaces everything, so it invalidates the
 * entire query cache rather than individual keys.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import {
  deleteBackup,
  exportCsv,
  exportJson,
  listBackups,
  pickAndRestore,
  restoreFromUri,
  writeBackup,
} from '@/services/backup-service';

export function useBackups() {
  return useQuery({
    queryKey: queryKeys.backups,
    queryFn: async () => listBackups(),
  });
}

function useInvalidateBackups() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.backups });
}

/** Everything changed — drop the whole cache so every screen refetches. */
function useResetEverything() {
  const client = useQueryClient();
  return () => client.invalidateQueries();
}

export function useCreateBackup() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: () => writeBackup(),
    onSuccess: invalidate,
  });
}

export function useDeleteBackup() {
  const invalidate = useInvalidateBackups();
  return useMutation({
    mutationFn: async (uri: string) => deleteBackup(uri),
    onSuccess: invalidate,
  });
}

export function useRestoreBackup() {
  const resetAll = useResetEverything();
  return useMutation({
    mutationFn: (uri: string) => restoreFromUri(uri),
    onSuccess: resetAll,
  });
}

export function useRestoreFromFile() {
  const resetAll = useResetEverything();
  return useMutation({
    mutationFn: () => pickAndRestore(),
    onSuccess: resetAll,
  });
}

export function useExportCsv() {
  return useMutation({ mutationFn: () => exportCsv() });
}

export function useExportJson() {
  return useMutation({ mutationFn: () => exportJson() });
}
