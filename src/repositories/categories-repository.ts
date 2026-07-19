/** Categories repository — editable expense categories. */

import { getDb } from '@/db';
import { CategorySchema, type Category } from '@/schemas/category';

export async function listCategories(includeArchived = false): Promise<Category[]> {
  const db = await getDb();
  const where = includeArchived ? '' : 'WHERE is_archived = 0';
  const rows = await db.getAllAsync<Record<string, unknown>>(
    `SELECT * FROM categories ${where} ORDER BY sort_order, id`,
  );
  return rows.map((r) => CategorySchema.parse(r));
}

export async function createCategory(name: string, icon: string | null = null): Promise<number> {
  const db = await getDb();
  const result = await db.runAsync(
    `INSERT INTO categories (name, icon, sort_order)
     VALUES (?, ?, (SELECT COALESCE(MAX(sort_order), -1) + 1 FROM categories))`,
    [name.trim(), icon],
  );
  return result.lastInsertRowId;
}

export async function renameCategory(id: number, name: string): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE categories SET name = ?, updated_at = datetime('now') WHERE id = ?`,
    [name.trim(), id],
  );
}

export async function archiveCategory(id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE categories SET is_archived = 1, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
}
