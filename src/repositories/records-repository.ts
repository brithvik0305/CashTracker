/**
 * Cross-entity record maintenance: permanently delete a record, restore an
 * archived one, and list what is currently archived.
 *
 * This app is a record of your finances, so anything entered by mistake has to
 * be correctable — including removing a record outright rather than only hiding
 * it. Deleting a money record also deletes its ledger rows, because those
 * entries are meaningless without it. Deleting a category is different: the
 * expenses stay and simply become uncategorised.
 */

import { getDb } from '@/db';

export type RecordKind = 'account' | 'card' | 'lending' | 'borrowing' | 'investment' | 'category';

interface RecordConfig {
  table: string;
  /** Column on `transactions` linking back to this record. */
  fk: string;
  /** Column holding the human-readable name. */
  labelColumn: string;
  /** Categories only label transactions, so their rows survive a delete. */
  keepTransactions?: boolean;
}

const CONFIG: Record<RecordKind, RecordConfig> = {
  account: { table: 'accounts', fk: 'account_id', labelColumn: 'name' },
  card: { table: 'credit_cards', fk: 'credit_card_id', labelColumn: 'name' },
  lending: { table: 'lendings', fk: 'lending_id', labelColumn: 'person' },
  borrowing: { table: 'borrowings', fk: 'borrowing_id', labelColumn: 'person' },
  investment: { table: 'investments', fk: 'investment_id', labelColumn: 'name' },
  category: {
    table: 'categories',
    fk: 'category_id',
    labelColumn: 'name',
    keepTransactions: true,
  },
};

export const RECORD_LABELS: Record<RecordKind, string> = {
  account: 'Account',
  card: 'Credit card',
  lending: 'Money lent',
  borrowing: 'Money borrowed',
  investment: 'Investment',
  category: 'Category',
};

/** How many ledger rows point at this record — shown before a delete. */
export async function countLinkedTransactions(kind: RecordKind, id: number): Promise<number> {
  const db = await getDb();
  const { fk } = CONFIG[kind];
  const row = await db.getFirstAsync<{ n: number }>(
    `SELECT COUNT(*) AS n FROM transactions WHERE ${fk} = ?`,
    [id],
  );
  return row?.n ?? 0;
}

/**
 * Permanently removes a record. For money records this also removes their
 * ledger rows; for categories the transactions are kept and uncategorised.
 */
export async function deleteRecord(kind: RecordKind, id: number): Promise<void> {
  const db = await getDb();
  const { table, fk, keepTransactions } = CONFIG[kind];

  await db.withTransactionAsync(async () => {
    if (keepTransactions) {
      await db.runAsync(`UPDATE transactions SET ${fk} = NULL WHERE ${fk} = ?`, [id]);
    } else {
      await db.runAsync(`DELETE FROM transactions WHERE ${fk} = ?`, [id]);
    }
    await db.runAsync(`DELETE FROM ${table} WHERE id = ?`, [id]);
  });
}

export async function unarchiveRecord(kind: RecordKind, id: number): Promise<void> {
  const db = await getDb();
  await db.runAsync(
    `UPDATE ${CONFIG[kind].table} SET is_archived = 0, updated_at = datetime('now') WHERE id = ?`,
    [id],
  );
}

export interface ArchivedRecord {
  kind: RecordKind;
  id: number;
  label: string;
}

/** Everything currently archived, across all record types. */
export async function listArchivedRecords(): Promise<ArchivedRecord[]> {
  const db = await getDb();
  const results: ArchivedRecord[] = [];

  for (const kind of Object.keys(CONFIG) as RecordKind[]) {
    const { table, labelColumn } = CONFIG[kind];
    const rows = await db.getAllAsync<{ id: number; label: string }>(
      `SELECT id, ${labelColumn} AS label FROM ${table} WHERE is_archived = 1 ORDER BY ${labelColumn}`,
    );
    rows.forEach((row) => results.push({ kind, id: row.id, label: row.label }));
  }

  return results;
}
