/**
 * Backup and export service.
 *
 * Backups are JSON snapshots written to the app's document directory. The
 * timestamp lives in the filename, so listing and sorting never depends on
 * filesystem metadata. Exports are written to the cache directory and handed to
 * the system share sheet.
 */

import { format as formatDate, parse as parseDate } from 'date-fns';
import * as DocumentPicker from 'expo-document-picker';
import { Directory, File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

import { toRupees } from '@/domain/money';
import { toCsv } from '@/lib/csv';
import {
  countRows,
  createSnapshot,
  parseSnapshot,
  restoreSnapshot,
} from '@/repositories/backup-repository';
import { listAllTransactionsForExport } from '@/repositories/transactions-repository';

const BACKUP_DIR = 'backups';
const NAME_PREFIX = 'cashtracker-';
const STAMP_FORMAT = 'yyyyMMdd-HHmmss';
const NAME_PATTERN = /^cashtracker-(\d{8}-\d{6})\.json$/;

/** Keep this many automatic backups before pruning the oldest. */
export const MAX_BACKUPS = 10;
/** Take an automatic backup at most once a day. */
const AUTO_BACKUP_INTERVAL_MS = 24 * 60 * 60 * 1000;

export interface BackupFile {
  name: string;
  uri: string;
  size: number;
  createdAt: number;
}

function backupsDirectory(): Directory {
  const dir = new Directory(Paths.document, BACKUP_DIR);
  if (!dir.exists) dir.create();
  return dir;
}

function fileNameFor(date: Date): string {
  return `${NAME_PREFIX}${formatDate(date, STAMP_FORMAT)}.json`;
}

function dateFromFileName(name: string): Date | null {
  const match = name.match(NAME_PATTERN);
  if (!match) return null;
  const parsed = parseDate(match[1], STAMP_FORMAT, new Date());
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

/** Existing backups, newest first. */
export function listBackups(): BackupFile[] {
  const files: BackupFile[] = [];

  for (const entry of backupsDirectory().list()) {
    if (!(entry instanceof File)) continue;
    const name = Paths.basename(entry.uri);
    const created = dateFromFileName(name);
    if (!created) continue;
    files.push({ name, uri: entry.uri, size: entry.size ?? 0, createdAt: created.getTime() });
  }

  return files.sort((a, b) => b.createdAt - a.createdAt);
}

function pruneBackups(): void {
  const extra = listBackups().slice(MAX_BACKUPS);
  for (const backup of extra) {
    try {
      new File(backup.uri).delete();
    } catch {
      // A file we cannot remove should never break the backup itself.
    }
  }
}

/** Write a snapshot of everything to a new backup file. */
export async function writeBackup(): Promise<BackupFile> {
  const snapshot = await createSnapshot();
  const now = new Date();
  const file = new File(backupsDirectory(), fileNameFor(now));

  file.write(JSON.stringify(snapshot));
  pruneBackups();

  return { name: Paths.basename(file.uri), uri: file.uri, size: file.size ?? 0, createdAt: now.getTime() };
}

/** Called at startup: back up if the newest backup is older than a day. */
export async function maybeAutoBackup(): Promise<void> {
  const newest = listBackups()[0];
  if (newest && Date.now() - newest.createdAt < AUTO_BACKUP_INTERVAL_MS) return;
  await writeBackup();
}

export function deleteBackup(uri: string): void {
  new File(uri).delete();
}

/** Replaces all current data with the given backup. Destructive. */
export async function restoreFromUri(uri: string): Promise<number> {
  const text = await new File(uri).text();
  const snapshot = parseSnapshot(text);
  await restoreSnapshot(snapshot);
  return countRows(snapshot);
}

async function shareFile(uri: string, mimeType: string): Promise<void> {
  if (!(await Sharing.isAvailableAsync())) {
    throw new Error('Sharing is not available on this device.');
  }
  await Sharing.shareAsync(uri, { mimeType });
}

/** Full JSON export (also a valid backup file). */
export async function exportJson(): Promise<void> {
  const snapshot = await createSnapshot();
  const file = new File(Paths.cache, `${NAME_PREFIX}export-${formatDate(new Date(), STAMP_FORMAT)}.json`);
  file.write(JSON.stringify(snapshot, null, 2));
  await shareFile(file.uri, 'application/json');
}

/** Transaction CSV export, oldest first. */
export async function exportCsv(): Promise<void> {
  const transactions = await listAllTransactionsForExport();

  const headers = [
    'Date',
    'Type',
    'Amount (INR)',
    'Account',
    'Category',
    'Card',
    'Investment',
    'Person',
    'Notes',
  ];
  const rows = transactions.map((t) => [
    t.date,
    t.type,
    toRupees(t.amount).toFixed(2),
    t.account_name ?? '',
    t.category_name ?? '',
    t.card_name ?? '',
    t.investment_name ?? '',
    t.counterparty ?? '',
    t.notes ?? '',
  ]);

  const file = new File(
    Paths.cache,
    `${NAME_PREFIX}transactions-${formatDate(new Date(), STAMP_FORMAT)}.csv`,
  );
  file.write(toCsv(headers, rows));
  await shareFile(file.uri, 'text/csv');
}

/** Pick a backup file from device storage and restore it. Returns false if cancelled. */
export async function pickAndRestore(): Promise<number | false> {
  const result = await DocumentPicker.getDocumentAsync({
    type: ['application/json', 'text/plain', '*/*'],
    copyToCacheDirectory: true,
  });
  if (result.canceled || !result.assets?.length) return false;
  return restoreFromUri(result.assets[0].uri);
}
