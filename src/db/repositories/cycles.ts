import { addDaysISO, nowStamp, type ISODate } from '@/lib/dates';
import type { PeriodCycle } from '@/domain/types';

import { getDb } from '../client';

interface CycleRow {
  id: number;
  start_date: string;
  end_date: string | null;
  notes: string | null;
}

interface Range {
  start: ISODate;
  end: ISODate;
  notes: string | null;
}

export function listCycles(): PeriodCycle[] {
  const rows = getDb().getAllSync<CycleRow>(
    'SELECT id, start_date, end_date, notes FROM cycles ORDER BY start_date ASC',
  );
  return rows.map((r) => ({ id: r.id, startDate: r.start_date, endDate: r.end_date, notes: r.notes }));
}

export function lastPeriod(): PeriodCycle | null {
  return listCycles().at(-1) ?? null;
}

function mergeRanges(ranges: Range[]): Range[] {
  const sorted = [...ranges].sort((a, b) => (a.start < b.start ? -1 : 1));
  const merged: Range[] = [];
  for (const range of sorted) {
    const last = merged.at(-1);
    if (last && range.start <= addDaysISO(last.end, 2)) {
      if (range.end > last.end) last.end = range.end;
      if (!last.notes) last.notes = range.notes;
    } else {
      merged.push({ ...range });
    }
  }
  return merged;
}

function replacePeriods(ranges: Range[]): void {
  const merged = mergeRanges(ranges);
  const db = getDb();
  db.withTransactionSync(() => {
    db.runSync('DELETE FROM cycles');
    for (const range of merged) {
      db.runSync('INSERT OR REPLACE INTO cycles (start_date, end_date, notes, created_at) VALUES (?, ?, ?, ?)', [
        range.start,
        range.end,
        range.notes,
        nowStamp(),
      ]);
    }
  });
}

export function addPeriodRange(startDate: ISODate, endDate: ISODate, notes: string | null = null): void {
  const ranges = listCycles().map((c) => ({
    start: c.startDate,
    end: c.endDate ?? c.startDate,
    notes: c.notes,
  }));
  ranges.push({ start: startDate, end: endDate, notes });
  replacePeriods(ranges);
}

export function applyFlowToPeriods(date: ISODate, hasFlow: boolean): void {
  const ranges: Range[] = listCycles().map((c) => ({
    start: c.startDate,
    end: c.endDate ?? c.startDate,
    notes: c.notes,
  }));

  if (!hasFlow) {
    const next: Range[] = [];
    for (const range of ranges) {
      if (date < range.start || date > range.end) {
        next.push(range);
        continue;
      }
      if (date > range.start) next.push({ start: range.start, end: addDaysISO(date, -1), notes: range.notes });
      if (date < range.end) next.push({ start: addDaysISO(date, 1), end: range.end, notes: range.notes });
    }
    replacePeriods(next);
    return;
  }

  const touching = ranges.filter(
    (r) => date >= addDaysISO(r.start, -2) && date <= addDaysISO(r.end, 2),
  );
  if (touching.length === 0) {
    ranges.push({ start: date, end: date, notes: null });
  } else {
    let start = date;
    let end = date;
    for (const r of touching) {
      if (r.start < start) start = r.start;
      if (r.end > end) end = r.end;
    }
    const notes = touching.find((r) => r.notes)?.notes ?? null;
    for (const r of touching) {
      const idx = ranges.indexOf(r);
      if (idx >= 0) ranges.splice(idx, 1);
    }
    ranges.push({ start, end, notes });
  }
  replacePeriods(ranges);
}

export function updateCycle(id: number, patch: { startDate?: ISODate; endDate?: ISODate | null; notes?: string | null }): void {
  const current = listCycles().find((c) => c.id === id);
  if (!current) return;
  const ranges: Range[] = listCycles()
    .filter((c) => c.id !== id)
    .map((c) => ({ start: c.startDate, end: c.endDate ?? c.startDate, notes: c.notes }));
  const start = patch.startDate ?? current.startDate;
  let end = patch.endDate === undefined ? current.endDate ?? current.startDate : patch.endDate;
  if (end && end < start) end = start;
  ranges.push({ start, end: end ?? start, notes: patch.notes ?? current.notes });
  replacePeriods(ranges);
}

export function deleteCycle(id: number): void {
  const ranges: Range[] = listCycles()
    .filter((c) => c.id !== id)
    .map((c) => ({ start: c.startDate, end: c.endDate ?? c.startDate, notes: c.notes }));
  replacePeriods(ranges);
}
