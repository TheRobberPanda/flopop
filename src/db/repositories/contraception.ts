import { nowStamp, type ISODate } from '@/lib/dates';

import { getDb } from '../client';

export interface Contraceptive {
  id: number;
  name: string;
  method: string;
  dose: string | null;
  schedule: 'daily' | 'weekly' | 'custom';
  startDate: ISODate;
  reminderTime: string | null;
  active: boolean;
  createdAt: string;
}

interface ContraceptiveRow {
  id: number;
  name: string;
  method: string;
  dose: string | null;
  schedule: Contraceptive['schedule'];
  start_date: string;
  reminder_time: string | null;
  active: number;
  created_at: string;
}

function map(row: ContraceptiveRow): Contraceptive {
  return {
    id: row.id,
    name: row.name,
    method: row.method,
    dose: row.dose,
    schedule: row.schedule,
    startDate: row.start_date,
    reminderTime: row.reminder_time,
    active: row.active === 1,
    createdAt: row.created_at,
  };
}

export function listContraceptives(): Contraceptive[] {
  return getDb()
    .getAllSync<ContraceptiveRow>('SELECT * FROM contraceptives ORDER BY active DESC, created_at DESC')
    .map(map);
}

export function createContraceptive(input: {
  name: string;
  method: string;
  dose?: string | null;
  schedule: Contraceptive['schedule'];
  startDate: ISODate;
  reminderTime?: string | null;
}): Contraceptive {
  const result = getDb().runSync(
    `INSERT INTO contraceptives (name, method, dose, schedule, start_date, reminder_time, active, created_at)
     VALUES (?, ?, ?, ?, ?, ?, 1, ?)`,
    [input.name, input.method, input.dose ?? null, input.schedule, input.startDate, input.reminderTime ?? null, nowStamp()],
  );
  const row = getDb().getFirstSync<ContraceptiveRow>('SELECT * FROM contraceptives WHERE id = ?', [
    result.lastInsertRowId,
  ]);
  return map(row as ContraceptiveRow);
}

export function setContraceptiveActive(id: number, active: boolean): void {
  getDb().runSync('UPDATE contraceptives SET active = ? WHERE id = ?', [active ? 1 : 0, id]);
}

export function deleteContraceptive(id: number): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM contraceptives WHERE id = ?', [id]);
    db.runSync('DELETE FROM contraceptive_logs WHERE contraceptive_id = ?', [id]);
  });
}

export function toggleTaken(contraceptiveId: number, date: ISODate, taken: boolean): void {
  getDb().runSync(
    `INSERT INTO contraceptive_logs (contraceptive_id, date, taken) VALUES (?, ?, ?)
     ON CONFLICT(contraceptive_id, date) DO UPDATE SET taken = excluded.taken`,
    [contraceptiveId, date, taken ? 1 : 0],
  );
}

export function takenDates(contraceptiveId: number): Set<ISODate> {
  const rows = getDb().getAllSync<{ date: string }>(
    'SELECT date FROM contraceptive_logs WHERE contraceptive_id = ? AND taken = 1',
    [contraceptiveId],
  );
  return new Set(rows.map((r) => r.date));
}

export function isTaken(contraceptiveId: number, date: ISODate): boolean {
  const row = getDb().getFirstSync<{ taken: number }>(
    'SELECT taken FROM contraceptive_logs WHERE contraceptive_id = ? AND date = ?',
    [contraceptiveId, date],
  );
  return row?.taken === 1;
}

export function adherence(contraceptiveId: number, start: ISODate, end: ISODate): { taken: number; total: number } {
  const row = getDb().getFirstSync<{ taken: number; total: number }>(
    `SELECT COALESCE(SUM(taken), 0) AS taken, COUNT(*) AS total
     FROM contraceptive_logs WHERE contraceptive_id = ? AND date >= ? AND date <= ?`,
    [contraceptiveId, start, end],
  );
  return { taken: row?.taken ?? 0, total: row?.total ?? 0 };
}
