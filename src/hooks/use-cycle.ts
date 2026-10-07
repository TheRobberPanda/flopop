import { useMemo } from 'react';

import { buildDayStates, currentCycleState } from '@/domain/cycle';
import { generateInsights } from '@/domain/insights';
import type { CyclePhase, DayState, Insight } from '@/domain/types';
import { getDayLog, getAllLogs, getLogsInRange, loggedDates } from '@/db/repositories/logs';
import { addDaysISO, today as todayISO, type ISODate } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { cycle as cycleColors } from '@/theme';

export function useCycleStats() {
  return useAppStore((state) => state.stats);
}

export function useCycleData(from: ISODate, to: ISODate): Map<ISODate, DayState> {
  const cycles = useAppStore((state) => state.cycles);
  const stats = useAppStore((state) => state.stats);
  return useMemo(() => buildDayStates(cycles, stats, from, to), [cycles, stats, from, to]);
}

export function useCurrentCycle() {
  const cycles = useAppStore((state) => state.cycles);
  const stats = useAppStore((state) => state.stats);
  return useMemo(() => currentCycleState(cycles, stats, todayISO()), [cycles, stats]);
}

export function useTodayLog() {
  const revision = useAppStore((state) => state.revision);
  void revision;
  return getDayLog(todayISO());
}

export function useLog(date: ISODate) {
  const revision = useAppStore((state) => state.revision);
  void revision;
  return getDayLog(date);
}

export function useLogsRange(from: ISODate, to: ISODate) {
  const revision = useAppStore((state) => state.revision);
  void revision;
  return getLogsInRange(from, to);
}

export function useLoggedDates(from: ISODate, to: ISODate): Set<ISODate> {
  const revision = useAppStore((state) => state.revision);
  void revision;
  return loggedDates(from, to);
}

export function useAllLogs() {
  const revision = useAppStore((state) => state.revision);
  void revision;
  return getAllLogs();
}

export function useInsights(): Insight[] {
  const revision = useAppStore((state) => state.revision);
  const cycles = useAppStore((state) => state.cycles);
  const stats = useAppStore((state) => state.stats);
  void revision;
  const logs = getAllLogs();
  if (logs.length === 0) return [];
  const first = logs[0].date;
  const last = logs[logs.length - 1].date;
  const dayStates = buildDayStates(cycles, stats, first, last);
  return generateInsights({ logs, periods: cycles, stats, dayStates, today: todayISO() });
}

export function phaseColor(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return cycleColors.period;
    case 'follicular':
      return cycleColors.follicular;
    case 'ovulatory':
      return cycleColors.ovulation;
    case 'luteal':
      return cycleColors.luteal;
  }
}

export function monthWindow(anchor: ISODate): { from: ISODate; to: ISODate } {
  const first = `${anchor.slice(0, 7)}-01`;
  return { from: addDaysISO(first, -7), to: addDaysISO(first, 45) };
}
