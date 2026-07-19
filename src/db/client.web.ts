/**
 * Web stub for the SQLite client.
 *
 * CashTracker targets Android; the web bundle exists only as a quick UI preview.
 * expo-sqlite's web build pulls in a wa-sqlite `.wasm` worker that Metro can't
 * resolve without extra setup, so on web we skip SQLite entirely. `getDb()`
 * rejects; DatabaseProvider catches that and renders the UI without a database.
 */

export const DB_NAME = 'cashtracker.db';

export type Database = never;

export function getDb(): Promise<Database> {
  return Promise.reject(new Error('SQLite is not available on the web preview.'));
}
