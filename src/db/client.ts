import { openDatabaseSync, type SQLiteDatabase } from 'expo-sqlite';

import { runMigrations } from './migrations';

export const DB_NAME = 'flopop.db';

let instance: SQLiteDatabase | null = null;

export function getDb(): SQLiteDatabase {
  if (!instance) {
    instance = openDatabaseSync(DB_NAME);
    instance.execSync('PRAGMA journal_mode = WAL;');
    instance.execSync('PRAGMA foreign_keys = ON;');
    runMigrations(instance);
  }
  return instance;
}

export function resetDb(): void {
  if (!instance) return;
  instance.closeSync();
  instance = null;
}
