/** Zod schema + types for editable expense categories. */

import { z } from 'zod';

export const CategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  icon: z.string().nullable(),
  color: z.string().nullable(),
  is_archived: z.union([z.literal(0), z.literal(1)]).transform((v) => v === 1),
  sort_order: z.number().int(),
  created_at: z.string(),
  updated_at: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;
