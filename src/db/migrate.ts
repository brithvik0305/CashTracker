/**
 * Migration runner.
 *
 * Tracks applied versions in `_migrations` and applies any pending migrations in
 * order. Each migration runs in its own transaction so a failure leaves the schema
 * at the last good version rather than half-applied.
 */

import type { Database } from './client';
import { migrations } from './migrations';

export interface MigrationResult {
  /** Schema version before this run. */
  from: number;
  /** Schema version after this run. */
  to: number;
  /** Versions applied during this run. */
  applied: number[];
}

export async function runMigrations(db: Database): Promise<MigrationResult> {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version    INTEGER PRIMARY KEY,
      name       TEXT NOT NULL,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const row = await db.getFirstAsync<{ version: number | null }>(
    'SELECT MAX(version) AS version FROM _migrations',
  );
  const from = row?.version ?? 0;

  const pending = migrations
    .filter((m) => m.version > from)
    .sort((a, b) => a.version - b.version);

  const applied: number[] = [];
  for (const migration of pending) {
    await db.withTransactionAsync(async () => {
      await db.execAsync(migration.up);
      await db.runAsync('INSERT INTO _migrations (version, name) VALUES (?, ?)', [
        migration.version,
        migration.name,
      ]);
    });
    applied.push(migration.version);
  }

  const to = applied.length ? (applied.at(-1) ?? from) : from;
  return { from, to, applied };
}
