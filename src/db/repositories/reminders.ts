import { nowStamp } from '@/lib/dates';

import { getDb } from '../client';

export type ReminderType = 'period' | 'log' | 'pill' | 'custom';

export interface Reminder {
  id: number;
  type: ReminderType;
  label: string;
  time: string;
  daysBefore: number;
  weekdays: number[] | null;
  enabled: boolean;
  notificationId: string | null;
  createdAt: string;
}

interface ReminderRow {
  id: number;
  type: ReminderType;
  label: string;
  time: string;
  days_before: number;
  weekdays: string | null;
  enabled: number;
  notification_id: string | null;
  created_at: string;
}

function map(row: ReminderRow): Reminder {
  return {
    id: row.id,
    type: row.type,
    label: row.label,
    time: row.time,
    daysBefore: row.days_before,
    weekdays: row.weekdays ? (JSON.parse(row.weekdays) as number[]) : null,
    enabled: row.enabled === 1,
    notificationId: row.notification_id,
    createdAt: row.created_at,
  };
}

export function listReminders(): Reminder[] {
  return getDb()
    .getAllSync<ReminderRow>('SELECT * FROM reminders ORDER BY time ASC')
    .map(map);
}

export function createReminder(input: {
  type: ReminderType;
  label: string;
  time: string;
  daysBefore?: number;
  weekdays?: number[] | null;
}): Reminder {
  const result = getDb().runSync(
    `INSERT INTO reminders (type, label, time, days_before, weekdays, enabled, notification_id, created_at)
     VALUES (?, ?, ?, ?, ?, 1, NULL, ?)`,
    [
      input.type,
      input.label,
      input.time,
      input.daysBefore ?? 0,
      input.weekdays ? JSON.stringify(input.weekdays) : null,
      nowStamp(),
    ],
  );
  const row = getDb().getFirstSync<ReminderRow>('SELECT * FROM reminders WHERE id = ?', [result.lastInsertRowId]);
  return map(row as ReminderRow);
}

export function updateReminder(
  id: number,
  patch: Partial<Pick<Reminder, 'label' | 'time' | 'daysBefore' | 'weekdays' | 'enabled' | 'notificationId'>>,
): void {
  const current = listReminders().find((r) => r.id === id);
  if (!current) return;
  const next = { ...current, ...patch };
  getDb().runSync(
    `UPDATE reminders SET label = ?, time = ?, days_before = ?, weekdays = ?, enabled = ?, notification_id = ? WHERE id = ?`,
    [
      next.label,
      next.time,
      next.daysBefore,
      next.weekdays ? JSON.stringify(next.weekdays) : null,
      next.enabled ? 1 : 0,
      next.notificationId,
      id,
    ],
  );
}

export function deleteReminder(id: number): void {
  getDb().runSync('DELETE FROM reminders WHERE id = ?', [id]);
}
