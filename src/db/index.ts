/**
 * Database entry point: open the connection and bring the schema up to date.
 * UI code should call `initDatabase()` once at startup (see DatabaseProvider),
 * then use repositories for all reads and writes.
 */

import { getDb, type Database } from './client';
import { runMigrations, type MigrationResult } from './migrate';

export { getDb } from './client';
export type { Database } from './client';

export interface InitResult {
  db: Database;
  migration: MigrationResult;
}

export async function initDatabase(): Promise<InitResult> {
  const db = await getDb();
  const migration = await runMigrations(db);
  return { db, migration };
}
