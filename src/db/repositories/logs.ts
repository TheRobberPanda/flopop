import { nowStamp, rangeBetween, type ISODate } from '@/lib/dates';
import type { DayLogRow, FlowLevel } from '@/domain/types';

import { getDb } from '../client';
import { applyFlowToPeriods } from './cycles';

interface LogRow {
  date: string;
  flow: FlowLevel;
  discharge: string | null;
  sex: string | null;
  bbt: number | null;
  weight_kg: number | null;
  water_ml: number | null;
  sleep_hours: number | null;
  pill_taken: number | null;
  notes: string | null;
}

const EMPTY: DayLogRow = {
  date: '',
  flow: 'none',
  discharge: null,
  sex: null,
  bbt: null,
  weightKg: null,
  waterMl: null,
  sleepHours: null,
  pillTaken: null,
  cravings: [],
  symptoms: [],
  moods: [],
  activities: [],
  notes: null,
};

export interface DayLogInput {
  flow?: FlowLevel;
  discharge?: string | null;
  sex?: string | null;
  bbt?: number | null;
  weightKg?: number | null;
  waterMl?: number | null;
  sleepHours?: number | null;
  pillTaken?: boolean | null;
  notes?: string | null;
  symptoms?: string[];
  moods?: string[];
  activities?: string[];
  cravings?: string[];
}

function junctions(table: string, column: string, date: ISODate): string[] {
  const rows = getDb().getAllSync<Record<string, string>>(
    `SELECT ${column} AS id FROM ${table} WHERE log_date = ?`,
    [date],
  );
  return rows.map((r) => r.id);
}

export function getDayLog(date: ISODate): DayLogRow | null {
  const row = getDb().getFirstSync<LogRow>(
    'SELECT date, flow, discharge, sex, bbt, weight_kg, water_ml, sleep_hours, pill_taken, notes FROM logs WHERE date = ?',
    [date],
  );
  if (!row) return null;
  return {
    date: row.date,
    flow: row.flow,
    discharge: row.discharge,
    sex: row.sex,
    bbt: row.bbt,
    weightKg: row.weight_kg,
    waterMl: row.water_ml,
    sleepHours: row.sleep_hours,
    pillTaken: row.pill_taken,
    notes: row.notes,
    symptoms: junctions('log_symptoms', 'symptom_id', date),
    moods: junctions('log_moods', 'mood_id', date),
    activities: junctions('log_activities', 'activity_id', date),
    cravings: junctions('log_cravings', 'craving_id', date),
  };
}

export function getLogsInRange(from: ISODate, to: ISODate): DayLogRow[] {
  const rows = getDb().getAllSync<LogRow>(
    `SELECT date, flow, discharge, sex, bbt, weight_kg, water_ml, sleep_hours, pill_taken, notes
     FROM logs WHERE date >= ? AND date <= ? ORDER BY date ASC`,
    [from, to],
  );
  return rows.map((row) => ({
    date: row.date,
    flow: row.flow,
    discharge: row.discharge,
    sex: row.sex,
    bbt: row.bbt,
    weightKg: row.weight_kg,
    waterMl: row.water_ml,
    sleepHours: row.sleep_hours,
    pillTaken: row.pill_taken,
    notes: row.notes,
    symptoms: junctions('log_symptoms', 'symptom_id', row.date),
    moods: junctions('log_moods', 'mood_id', row.date),
    activities: junctions('log_activities', 'activity_id', row.date),
    cravings: junctions('log_cravings', 'craving_id', row.date),
  }));
}

export function getAllLogs(): DayLogRow[] {
  const bounds = getDb().getFirstSync<{ min: string | null; max: string | null }>(
    'SELECT MIN(date) AS min, MAX(date) AS max FROM logs',
  );
  if (!bounds?.min || !bounds.max) return [];
  return getLogsInRange(bounds.min, bounds.max);
}

export function loggedDates(from: ISODate, to: ISODate): Set<ISODate> {
  const rows = getDb().getAllSync<{ date: string }>(
    'SELECT date FROM logs WHERE date >= ? AND date <= ?',
    [from, to],
  );
  return new Set(rows.map((r) => r.date));
}

function writeJunction(table: string, column: string, date: ISODate, ids: string[]): void {
  const db = getDb();
  db.runSync(`DELETE FROM ${table} WHERE log_date = ?`, [date]);
  for (const id of ids) {
    db.runSync(`INSERT OR IGNORE INTO ${table} (log_date, ${column}) VALUES (?, ?)`, [date, id]);
  }
}

export function saveDayLog(date: ISODate, patch: DayLogInput): DayLogRow {
  const db = getDb();
  const existing = getDayLog(date);
  const base: DayLogRow = existing ?? { ...EMPTY, date };
  const next: DayLogRow = {
    ...base,
    flow: patch.flow ?? base.flow,
    discharge: patch.discharge !== undefined ? patch.discharge : base.discharge,
    sex: patch.sex !== undefined ? patch.sex : base.sex,
    bbt: patch.bbt !== undefined ? patch.bbt : base.bbt,
    weightKg: patch.weightKg !== undefined ? patch.weightKg : base.weightKg,
    waterMl: patch.waterMl !== undefined ? patch.waterMl : base.waterMl,
    sleepHours: patch.sleepHours !== undefined ? patch.sleepHours : base.sleepHours,
    pillTaken: patch.pillTaken !== undefined ? (patch.pillTaken ? 1 : 0) : base.pillTaken,
    notes: patch.notes !== undefined ? patch.notes : base.notes,
    symptoms: patch.symptoms ?? base.symptoms,
    moods: patch.moods ?? base.moods,
    activities: patch.activities ?? base.activities,
    cravings: patch.cravings ?? base.cravings,
  };

  db.withTransactionSync(() => {
    db.runSync(
      `INSERT INTO logs (date, flow, discharge, sex, bbt, weight_kg, water_ml, sleep_hours, pill_taken, notes, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(date) DO UPDATE SET
         flow = excluded.flow,
         discharge = excluded.discharge,
         sex = excluded.sex,
         bbt = excluded.bbt,
         weight_kg = excluded.weight_kg,
         water_ml = excluded.water_ml,
         sleep_hours = excluded.sleep_hours,
         pill_taken = excluded.pill_taken,
         notes = excluded.notes,
         updated_at = excluded.updated_at`,
      [
        date,
        next.flow,
        next.discharge,
        next.sex,
        next.bbt,
        next.weightKg,
        next.waterMl,
        next.sleepHours,
        next.pillTaken,
        next.notes,
        nowStamp(),
      ],
    );
    if (patch.symptoms) writeJunction('log_symptoms', 'symptom_id', date, patch.symptoms);
    if (patch.moods) writeJunction('log_moods', 'mood_id', date, patch.moods);
    if (patch.activities) writeJunction('log_activities', 'activity_id', date, patch.activities);
    if (patch.cravings) writeJunction('log_cravings', 'craving_id', date, patch.cravings);
  });

  if (patch.flow !== undefined) applyFlowToPeriods(date, next.flow !== 'none');
  return getDayLog(date) as DayLogRow;
}

export function deleteDayLog(date: ISODate): void {
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM logs WHERE date = ?', [date]);
    db.runSync('DELETE FROM log_symptoms WHERE log_date = ?', [date]);
    db.runSync('DELETE FROM log_moods WHERE log_date = ?', [date]);
    db.runSync('DELETE FROM log_activities WHERE log_date = ?', [date]);
    db.runSync('DELETE FROM log_cravings WHERE log_date = ?', [date]);
  });
  applyFlowToPeriods(date, false);
}

export function logCount(): number {
  const row = getDb().getFirstSync<{ n: number }>('SELECT COUNT(*) AS n FROM logs');
  return row?.n ?? 0;
}

export function logsInRangeOrEmpty(from: ISODate, to: ISODate): DayLogRow[] {
  const all = getLogsInRange(from, to);
  const byDate = new Map(all.map((l) => [l.date, l]));
  return rangeBetween(from, to).map((date) => byDate.get(date) ?? { ...EMPTY, date });
}
