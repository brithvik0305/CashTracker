/** Category data hooks (TanStack Query). */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/lib/query-client';
import {
  archiveCategory,
  createCategory,
  listCategories,
  renameCategory,
} from '@/repositories/categories-repository';

export function useCategories() {
  return useQuery({
    queryKey: queryKeys.categories,
    queryFn: () => listCategories(false),
  });
}

function useInvalidateCategories() {
  const client = useQueryClient();
  return () => client.invalidateQueries({ queryKey: queryKeys.categories });
}

export function useCreateCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (name: string) => createCategory(name),
    onSuccess: invalidate,
  });
}

export function useRenameCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: ({ id, name }: { id: number; name: string }) => renameCategory(id, name),
    onSuccess: invalidate,
  });
}

export function useArchiveCategory() {
  const invalidate = useInvalidateCategories();
  return useMutation({
    mutationFn: (id: number) => archiveCategory(id),
    onSuccess: invalidate,
  });
}
