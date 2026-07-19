/**
 * Zod schema + types for the app settings singleton.
 * One schema drives both runtime validation of DB rows and the TypeScript type.
 */

import { z } from 'zod';

export const ThemeMode = z.enum(['system', 'light', 'dark']);
export type ThemeMode = z.infer<typeof ThemeMode>;

export const SettingsSchema = z.object({
  id: z.literal(1),
  theme: ThemeMode,
  currency: z.string().min(1),
  week_start_day: z.number().int().min(0).max(6),
  created_at: z.string(),
  updated_at: z.string(),
});

export type Settings = z.infer<typeof SettingsSchema>;
