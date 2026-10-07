import { nowStamp, today, type ISODate } from '@/lib/dates';
import { dueDateFromLMP, type Contraction } from '@/domain/pregnancy';

import { getDb } from '../client';

export interface Pregnancy {
  id: number;
  lmpDate: ISODate;
  dueDate: ISODate;
  active: boolean;
  endedDate: ISODate | null;
  createdAt: string;
}

interface PregnancyRow {
  id: number;
  lmp_date: string;
  due_date: string;
  active: number;
  ended_date: string | null;
  created_at: string;
}

function map(row: PregnancyRow): Pregnancy {
  return {
    id: row.id,
    lmpDate: row.lmp_date,
    dueDate: row.due_date,
    active: row.active === 1,
    endedDate: row.ended_date,
    createdAt: row.created_at,
  };
}

export function getActivePregnancy(): Pregnancy | null {
  const row = getDb().getFirstSync<PregnancyRow>('SELECT * FROM pregnancies WHERE active = 1 ORDER BY id DESC LIMIT 1');
  return row ? map(row) : null;
}

export function startPregnancy(lmpDate: ISODate): Pregnancy {
  const result = getDb().runSync(
    `INSERT INTO pregnancies (lmp_date, due_date, active, ended_date, created_at) VALUES (?, ?, 1, NULL, ?)`,
    [lmpDate, dueDateFromLMP(lmpDate), nowStamp()],
  );
  const row = getDb().getFirstSync<PregnancyRow>('SELECT * FROM pregnancies WHERE id = ?', [result.lastInsertRowId]);
  return map(row as PregnancyRow);
}

export function endPregnancy(id: number, endedDate: ISODate = today()): void {
  getDb().runSync('UPDATE pregnancies SET active = 0, ended_date = ? WHERE id = ?', [endedDate, id]);
}

export function addKick(pregnancyId: number, timestamp: string, sessionDate: ISODate): void {
  getDb().runSync('INSERT INTO kicks (pregnancy_id, timestamp, session_date) VALUES (?, ?, ?)', [
    pregnancyId,
    timestamp,
    sessionDate,
  ]);
}

export function kicksForSession(sessionDate: ISODate): string[] {
  return getDb()
    .getAllSync<{ timestamp: string }>('SELECT timestamp FROM kicks WHERE session_date = ? ORDER BY timestamp ASC', [
      sessionDate,
    ])
    .map((r) => r.timestamp);
}

export function clearKicks(sessionDate: ISODate): void {
  getDb().runSync('DELETE FROM kicks WHERE session_date = ?', [sessionDate]);
}

interface ContractionRow {
  id: number;
  start_ts: number;
  end_ts: number | null;
  intensity: Contraction['intensity'];
}

export function addContraction(pregnancyId: number, startTs: number): Contraction {
  const result = getDb().runSync(
    'INSERT INTO contractions (pregnancy_id, start_ts, end_ts, intensity) VALUES (?, ?, NULL, ?)',
    [pregnancyId, startTs, 'mild'],
  );
  const row = getDb().getFirstSync<ContractionRow>('SELECT * FROM contractions WHERE id = ?', [
    result.lastInsertRowId,
  ]);
  const r = row as ContractionRow;
  return { id: String(r.id), start: r.start_ts, end: r.end_ts, intensity: r.intensity };
}

export function endContraction(id: string, endTs: number, intensity: Contraction['intensity']): void {
  getDb().runSync('UPDATE contractions SET end_ts = ?, intensity = ? WHERE id = ?', [endTs, intensity, Number(id)]);
}

export function listContractions(): Contraction[] {
  return getDb()
    .getAllSync<ContractionRow>('SELECT * FROM contractions ORDER BY start_ts ASC')
    .map((r) => ({ id: String(r.id), start: r.start_ts, end: r.end_ts, intensity: r.intensity }));
}

export function clearContractions(): void {
  getDb().runSync('DELETE FROM contractions');
}
