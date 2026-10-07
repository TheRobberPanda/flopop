import type { Contraceptive } from '@/db/repositories/contraception';
import type { Reminder } from '@/db/repositories/reminders';
import { currentCycleState } from '@/domain/cycle';
import type { CycleStats, PeriodCycle } from '@/domain/types';
import type { AppSettings } from '@/store/settings';

import { addDaysISO, fromISO, today } from './dates';
import { cancelAll, ensurePermissions, scheduleAtDate, scheduleDaily, scheduleWeekly } from './notifications';

export function parseTime(time: string): { hour: number; minute: number } {
  const [hours, minutes] = time.split(':').map((part) => Number(part));
  return {
    hour: Number.isFinite(hours) ? Math.min(23, Math.max(0, hours)) : 9,
    minute: Number.isFinite(minutes) ? Math.min(59, Math.max(0, minutes)) : 0,
  };
}

function atDateTime(dateISO: string, time: string): Date {
  const { hour, minute } = parseTime(time);
  const date = fromISO(dateISO);
  date.setHours(hour, minute, 0, 0);
  return date;
}

export async function applyReminders(input: {
  settings: AppSettings;
  contraceptives: Contraceptive[];
  reminders: Reminder[];
  cycles: PeriodCycle[];
  stats: CycleStats;
}): Promise<void> {
  const { settings, contraceptives, reminders, cycles, stats } = input;

  await cancelAll();

  const hasWork =
    settings.periodReminderEnabled ||
    settings.logReminderEnabled ||
    (settings.pillReminderEnabled && contraceptives.some((c) => c.active && c.reminderTime)) ||
    reminders.some((r) => r.enabled);
  if (!hasWork) return;

  if (!(await ensurePermissions())) return;

  if (settings.periodReminderEnabled && cycles.length > 0) {
    const state = currentCycleState(cycles, stats, today());
    const when = addDaysISO(state.nextPeriodStart, -settings.periodReminderDaysBefore);
    const date = atDateTime(when, settings.periodReminderTime);
    if (date.getTime() > Date.now()) {
      await scheduleAtDate(date, {
        title: 'Your period is coming',
        body: `Predicted to start in ${settings.periodReminderDaysBefore} day${
          settings.periodReminderDaysBefore === 1 ? '' : 's'
        }.`,
        data: { type: 'period' },
      });
    }
  }

  if (settings.logReminderEnabled) {
    const { hour, minute } = parseTime(settings.logReminderTime);
    await scheduleDaily({
      hour,
      minute,
      title: 'How are you feeling?',
      body: 'Take a moment to log your mood and symptoms.',
      data: { type: 'log' },
    });
  }

  if (settings.pillReminderEnabled) {
    for (const contraceptive of contraceptives) {
      if (!contraceptive.active || !contraceptive.reminderTime) continue;
      const { hour, minute } = parseTime(contraceptive.reminderTime);
      await scheduleDaily({
        hour,
        minute,
        title: `Time for ${contraceptive.name}`,
        body: 'Tap to mark it as taken.',
        data: { type: 'pill', id: contraceptive.id },
      });
    }
  }

  for (const reminder of reminders) {
    if (!reminder.enabled) continue;
    const { hour, minute } = parseTime(reminder.time);
    if (reminder.weekdays && reminder.weekdays.length > 0) {
      for (const day of reminder.weekdays) {
        await scheduleWeekly({
          weekday: day + 1,
          hour,
          minute,
          title: reminder.label,
          body: 'Flopop reminder',
          data: { type: reminder.type, id: reminder.id },
        });
      }
    } else {
      await scheduleDaily({
        hour,
        minute,
        title: reminder.label,
        body: 'Flopop reminder',
        data: { type: reminder.type, id: reminder.id },
      });
    }
  }
}
