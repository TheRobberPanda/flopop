import { getDb } from '../client';

export const BACKUP_VERSION = 1;

const TABLES = [
  'profile',
  'settings',
  'cycles',
  'logs',
  'log_symptoms',
  'log_moods',
  'log_activities',
  'log_cravings',
  'reminders',
  'contraceptives',
  'contraceptive_logs',
  'pregnancies',
  'kicks',
  'contractions',
  'articles_read',
] as const;

export interface BackupPayload {
  app: 'flopop';
  version: number;
  exportedAt: string;
  tables: Record<string, Record<string, unknown>[]>;
}

export function exportData(): BackupPayload {
  const db = getDb();
  const tables: Record<string, Record<string, unknown>[]> = {};
  for (const table of TABLES) {
    tables[table] = db.getAllSync<Record<string, unknown>>(`SELECT * FROM ${table}`);
  }
  return { app: 'flopop', version: BACKUP_VERSION, exportedAt: new Date().toISOString(), tables };
}

function wipeTables(): void {
  const db = getDb();
  db.withTransactionSync(() => {
    for (const table of TABLES) {
      if (table === 'profile') continue;
      db.runSync(`DELETE FROM ${table}`);
    }
    db.runSync('DELETE FROM profile');
  });
}

function insertRows(table: string, rows: Record<string, unknown>[]): void {
  if (!rows || rows.length === 0) return;
  const db = getDb();
  const columns = Object.keys(rows[0]);
  const placeholders = columns.map(() => '?').join(', ');
  const statement = `INSERT INTO ${table} (${columns.join(', ')}) VALUES (${placeholders})`;
  for (const row of rows) {
    db.runSync(
      statement,
      columns.map((column) => (row[column] ?? null) as never),
    );
  }
}

export function validateBackup(payload: unknown): payload is BackupPayload {
  if (!payload || typeof payload !== 'object') return false;
  const candidate = payload as Partial<BackupPayload>;
  return candidate.app === 'flopop' && typeof candidate.version === 'number' && !!candidate.tables;
}

export function importData(payload: BackupPayload): void {
  wipeTables();
  const db = getDb();
  db.withTransactionSync(() => {
    for (const table of TABLES) {
      const rows = payload.tables[table];
      if (rows) insertRows(table, rows);
    }
  });
}

export function wipeAll(): void {
  wipeTables();
}
