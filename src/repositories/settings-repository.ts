/**
 * Settings repository.
 *
 * Repositories are the ONLY layer that talks SQL. Everything above them works
 * with validated domain objects. This one manages the single settings row and
 * doubles as the first proof that the read/write pipeline works end-to-end.
 */

import { getDb } from '@/db';
import { SettingsSchema, type Settings, type ThemeMode } from '@/schemas/settings';

export async function getSettings(): Promise<Settings> {
  const db = await getDb();
  const row = await db.getFirstAsync<Record<string, unknown>>(
    'SELECT * FROM settings WHERE id = 1',
  );
  if (!row) throw new Error('Settings row missing — migrations may not have run.');
  return SettingsSchema.parse(row);
}

export async function updateTheme(theme: ThemeMode): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    "UPDATE settings SET theme = ?, updated_at = datetime('now') WHERE id = 1",
    [theme],
  );
}
