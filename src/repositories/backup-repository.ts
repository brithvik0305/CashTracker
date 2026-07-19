/**
 * Backup snapshots: a full dump of every table, and a restore that replaces the
 * database contents with a snapshot.
 *
 * Restores run inside a single transaction, so a failure leaves your existing
 * data untouched rather than half-replaced.
 */

import { getDb } from '@/db';

export const BACKUP_FORMAT = 'cashtracker-backup';
export const BACKUP_VERSION = 1;

/** Children first, so foreign keys never block a delete. */
const DELETE_ORDER = [
  'transactions',
  'investments',
  'borrowings',
  'lendings',
  'credit_cards',
  'categories',
  'accounts',
  'settings',
] as const;

/** Parents first, so foreign keys always resolve on insert. */
const INSERT_ORDER = [...DELETE_ORDER].reverse();

export interface BackupSnapshot {
  format: string;
  version: number;
  schemaVersion: number;
  createdAt: string;
  tables: Record<string, Record<string, unknown>[]>;
}

export async function createSnapshot(): Promise<BackupSnapshot> {
  const db = await getDb();
  const versionRow = await db.getFirstAsync<{ v: number | null }>(
    'SELECT MAX(version) AS v FROM _migrations',
  );

  const tables: Record<string, Record<string, unknown>[]> = {};
  for (const table of INSERT_ORDER) {
    tables[table] = await db.getAllAsync<Record<string, unknown>>(`SELECT * FROM ${table}`);
  }

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    schemaVersion: versionRow?.v ?? 0,
    createdAt: new Date().toISOString(),
    tables,
  };
}

/** Parses and validates a backup file's contents before it is trusted. */
export function parseSnapshot(text: string): BackupSnapshot {
  let data: unknown;
  try {
    data = JSON.parse(text);
  } catch {
    throw new Error('That file is not valid JSON.');
  }

  const snapshot = data as Partial<BackupSnapshot>;
  if (!snapshot || snapshot.format !== BACKUP_FORMAT) {
    throw new Error('That is not a CashTracker backup file.');
  }
  if (typeof snapshot.version !== 'number' || snapshot.version > BACKUP_VERSION) {
    throw new Error('This backup was made by a newer version of CashTracker.');
  }
  if (!snapshot.tables || typeof snapshot.tables !== 'object') {
    throw new Error('This backup is missing its data.');
  }
  return snapshot as BackupSnapshot;
}

export function countRows(snapshot: BackupSnapshot): number {
  return Object.values(snapshot.tables).reduce((sum, rows) => sum + (rows?.length ?? 0), 0);
}

/** Replaces ALL current data with the snapshot's contents. Destructive. */
export async function restoreSnapshot(snapshot: BackupSnapshot): Promise<void> {
  const db = await getDb();

  await db.withTransactionAsync(async () => {
    for (const table of DELETE_ORDER) {
      await db.runAsync(`DELETE FROM ${table}`);
    }

    for (const table of INSERT_ORDER) {
      const rows = snapshot.tables[table] ?? [];
      for (const row of rows) {
        const columns = Object.keys(row);
        if (columns.length === 0) continue;
        const placeholders = columns.map(() => '?').join(', ');
        await db.runAsync(
          `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`,
          columns.map((c) => row[c] as string | number | null),
        );
      }
    }
  });
}
