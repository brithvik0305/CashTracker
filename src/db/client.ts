/**
 * SQLite connection for CashTracker.
 *
 * A single shared connection is opened lazily and reused for the app's lifetime.
 * WAL mode improves write concurrency; foreign keys are enforced so the schema's
 * referential integrity actually holds.
 */

import * as SQLite from 'expo-sqlite';

export const DB_NAME = 'cashtracker.db';

let dbPromise: Promise<SQLite.SQLiteDatabase> | null = null;

/** Returns the shared database connection, opening it on first use. */
export function getDb(): Promise<SQLite.SQLiteDatabase> {
  if (!dbPromise) {
    dbPromise = SQLite.openDatabaseAsync(DB_NAME).then(async (db) => {
      await db.execAsync('PRAGMA journal_mode = WAL;');
      await db.execAsync('PRAGMA foreign_keys = ON;');
      return db;
    });
  }
  return dbPromise;
}

export type Database = SQLite.SQLiteDatabase;
