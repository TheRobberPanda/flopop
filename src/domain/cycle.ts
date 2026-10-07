import {
  addDaysISO,
  daysBetween,
  isWithin,
  rangeBetween,
  type ISODate,
} from '@/lib/dates';

import type {
  CyclePhase,
  CyclePrediction,
  CycleStats,
  CurrentCycleState,
  Confidence,
  DayState,
  PeriodCycle,
} from './types';

export const DEFAULT_CYCLE_LENGTH = 28;
export const DEFAULT_PERIOD_LENGTH = 5;
export const DEFAULT_LUTEAL_LENGTH = 14;
export const FERTILE_DAYS_BEFORE_OVULATION = 5;
export const PMS_DAYS = 5;
export const MIN_CYCLE = 15;
export const MAX_CYCLE = 60;
export const HISTORY_WINDOW = 6;

function mean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

function stdDev(values: number[]): number {
  if (values.length < 2) return 0;
  const m = mean(values);
  const variance = values.reduce((sum, v) => sum + (v - m) ** 2, 0) / (values.length - 1);
  return Math.sqrt(variance);
}

export function cycleLengths(periods: PeriodCycle[]): number[] {
  const starts = periods
    .map((p) => p.startDate)
    .filter((value, index, arr) => arr.indexOf(value) === index)
    .sort();
  const lengths: number[] = [];
  for (let i = 1; i < starts.length; i += 1) {
    const length = daysBetween(starts[i - 1], starts[i]);
    if (length >= MIN_CYCLE && length <= MAX_CYCLE) lengths.push(length);
  }
  return lengths;
}

export function computeCycleStats(
  periods: PeriodCycle[],
  options: { fallbackCycleLength?: number; fallbackPeriodLength?: number; lutealLength?: number } = {},
): CycleStats {
  const fallbackCycleLength = options.fallbackCycleLength ?? DEFAULT_CYCLE_LENGTH;
  const fallbackPeriodLength = options.fallbackPeriodLength ?? DEFAULT_PERIOD_LENGTH;
  const lutealLength = options.lutealLength ?? DEFAULT_LUTEAL_LENGTH;

  const lengths = cycleLengths(periods).slice(-HISTORY_WINDOW);
  const durations = periods
    .filter((p) => p.endDate)
    .map((p) => daysBetween(p.startDate, p.endDate as ISODate) + 1)
    .filter((d) => d >= 1 && d <= 14)
    .slice(-HISTORY_WINDOW);

  const avgCycleLength = lengths.length > 0 ? Math.round(mean(lengths)) : Math.round(fallbackCycleLength);
  const avgPeriodLength = durations.length > 0 ? Math.round(mean(durations)) : Math.round(fallbackPeriodLength);
  const dev = stdDev(lengths);
  const variability = avgCycleLength > 0 ? dev / avgCycleLength : 0;

  const sorted = [...lengths].sort((a, b) => a - b);
  return {
    avgCycleLength,
    avgPeriodLength,
    cycleLengthStdDev: dev,
    variability,
    sampleSize: lengths.length,
    shortest: sorted.length > 0 ? sorted[0] : avgCycleLength,
    longest: sorted.length > 0 ? sorted[sorted.length - 1] : avgCycleLength,
    isRegular: lengths.length < 2 || dev <= 3.5,
    lutealLength,
  };
}

function confidenceFor(stats: CycleStats): Confidence {
  if (stats.sampleSize < 2) return 'low';
  if (stats.cycleLengthStdDev <= 2.5) return 'high';
  if (stats.cycleLengthStdDev <= 5) return 'medium';
  return 'low';
}

export function predictCycleFrom(start: ISODate, stats: CycleStats): CyclePrediction {
  const cycleLength = stats.avgCycleLength;
  const periodLength = stats.avgPeriodLength;
  const ovulationDate = addDaysISO(start, cycleLength - stats.lutealLength);
  return {
    cycleStart: start,
    periodEnd: addDaysISO(start, periodLength - 1),
    ovulationDate,
    fertileStart: addDaysISO(ovulationDate, -FERTILE_DAYS_BEFORE_OVULATION),
    fertileEnd: addDaysISO(ovulationDate, 1),
    pmsStart: addDaysISO(start, cycleLength - PMS_DAYS),
    pmsEnd: addDaysISO(start, cycleLength - 1),
    cycleLength,
    periodLength,
    confidence: confidenceFor(stats),
  };
}

export function lastPeriodStart(periods: PeriodCycle[]): ISODate | null {
  if (periods.length === 0) return null;
  return [...periods].map((p) => p.startDate).sort().at(-1) ?? null;
}

export function cycleContaining(periods: PeriodCycle[], stats: CycleStats, today: ISODate): ISODate {
  const last = lastPeriodStart(periods) ?? addDaysISO(today, -1);
  let cursor = last;
  let guard = 0;
  while (addDaysISO(cursor, stats.avgCycleLength) <= today && guard < 240) {
    cursor = addDaysISO(cursor, stats.avgCycleLength);
    guard += 1;
  }
  return cursor;
}

export function coveringPredictions(
  periods: PeriodCycle[],
  stats: CycleStats,
  from: ISODate,
  count = 24,
): CyclePrediction[] {
  const last = lastPeriodStart(periods);
  if (!last) return [];
  let cursor = cycleContaining(periods, stats, from);
  const predictions: CyclePrediction[] = [];
  for (let i = 0; i < count; i += 1) {
    predictions.push(predictCycleFrom(cursor, stats));
    cursor = addDaysISO(cursor, stats.avgCycleLength);
  }
  return predictions;
}

export function upcomingPredictions(
  periods: PeriodCycle[],
  stats: CycleStats,
  from: ISODate,
  count = 6,
): CyclePrediction[] {
  return coveringPredictions(periods, stats, from, count + 1).slice(1);
}

function actualPeriodDates(periods: PeriodCycle[]): Set<ISODate> {
  const dates = new Set<ISODate>();
  for (const period of periods) {
    const end = period.endDate ?? addDaysISO(period.startDate, (DEFAULT_PERIOD_LENGTH - 1));
    for (const day of rangeBetween(period.startDate, end)) dates.add(day);
  }
  return dates;
}

export function buildDayStates(
  periods: PeriodCycle[],
  stats: CycleStats,
  from: ISODate,
  to: ISODate,
): Map<ISODate, DayState> {
  const map = new Map<ISODate, DayState>();
  const actual = actualPeriodDates(periods);
  const predictions = coveringPredictions(periods, stats, from, 24);
  const last = lastPeriodStart(periods);

  const phaseFor = (date: ISODate): { phase: CyclePhase; cycleDay: number | null } => {
    if (!last) return { phase: 'follicular', cycleDay: null };
    const prediction =
      predictions.find((p) => isWithin(date, p.cycleStart, addDaysISO(p.cycleStart, p.cycleLength - 1))) ??
      null;
    const cycleStart = prediction?.cycleStart ?? last;
    const cycleDay = daysBetween(cycleStart, date) + 1;
    const ovulation = prediction?.ovulationDate ?? addDaysISO(last, stats.avgCycleLength - stats.lutealLength);
    if (actual.has(date)) return { phase: 'menstrual', cycleDay };
    if (date === ovulation || date === addDaysISO(ovulation, -1) || date === addDaysISO(ovulation, 1)) {
      return { phase: 'ovulatory', cycleDay };
    }
    if (date < ovulation) return { phase: 'follicular', cycleDay };
    return { phase: 'luteal', cycleDay };
  };

  for (const date of rangeBetween(from, to)) {
    const isPeriod = actual.has(date);
    const prediction = predictions.find((p) =>
      isWithin(date, addDaysISO(p.cycleStart, -2), addDaysISO(p.cycleStart, p.cycleLength + 2)),
    );
    const isPredictedPeriod = !!prediction && isWithin(date, prediction.cycleStart, prediction.periodEnd);
    const isOvulation = !!prediction && date === prediction.ovulationDate;
    const isFertile =
      !!prediction && isWithin(date, prediction.fertileStart, prediction.fertileEnd) && !isPeriod && !isPredictedPeriod;
    const isPms = !!prediction && isWithin(date, prediction.pmsStart, prediction.pmsEnd) && !isPeriod && !isPredictedPeriod;
    const { phase, cycleDay } = phaseFor(date);

    let pregnancyChance: 'low' | 'medium' | 'high' = 'low';
    if (prediction) {
      const distance = Math.abs(daysBetween(prediction.ovulationDate, date));
      if (date <= prediction.ovulationDate && isWithin(date, prediction.fertileStart, prediction.ovulationDate)) {
        pregnancyChance = 'high';
      } else if (distance <= 1) pregnancyChance = 'high';
      else if (isWithin(date, prediction.fertileStart, prediction.fertileEnd)) pregnancyChance = 'medium';
    }

    map.set(date, {
      date,
      isPeriod,
      isPredictedPeriod,
      isFertile,
      isOvulation,
      isPms,
      phase,
      cycleDay,
      pregnancyChance,
    });
  }
  return map;
}

export function currentCycleState(
  periods: PeriodCycle[],
  stats: CycleStats,
  today: ISODate,
): CurrentCycleState {
  const cycleStart = cycleContaining(periods, stats, today);
  const prediction = predictCycleFrom(cycleStart, stats);
  const nextPeriodStart = addDaysISO(cycleStart, stats.avgCycleLength);
  const actual = actualPeriodDates(periods);

  const cycleDay = Math.max(1, daysBetween(cycleStart, today) + 1);
  const ovulationDate = prediction.ovulationDate;
  const isOnPeriod = actual.has(today);

  let phase: CyclePhase = 'follicular';
  if (isOnPeriod) phase = 'menstrual';
  else if (today === ovulationDate) phase = 'ovulatory';
  else if (today > ovulationDate) phase = 'luteal';

  let pregnancyChance: 'low' | 'medium' | 'high' = 'low';
  if (isWithin(today, prediction.fertileStart, prediction.ovulationDate)) pregnancyChance = 'high';
  else if (isWithin(today, prediction.fertileStart, prediction.fertileEnd)) pregnancyChance = 'medium';

  return {
    cycleDay,
    phase,
    isOnPeriod,
    daysUntilNextPeriod: daysBetween(today, nextPeriodStart),
    nextPeriodStart,
    ovulationDate,
    fertileStart: prediction.fertileStart,
    fertileEnd: prediction.fertileEnd,
    pregnancyChance,
    cycleLength: stats.avgCycleLength,
  };
}

export function phaseLabel(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'Menstrual phase';
    case 'follicular':
      return 'Follicular phase';
    case 'ovulatory':
      return 'Ovulation';
    case 'luteal':
      return 'Luteal phase';
  }
}

export function phaseDescription(phase: CyclePhase): string {
  switch (phase) {
    case 'menstrual':
      return 'Energy is often lowest now — rest, warmth and iron-rich foods can help.';
    case 'follicular':
      return 'Estrogen is rising. Energy and mood tend to climb — a good window to be active.';
    case 'ovulatory':
      return 'Your most fertile days. You may notice more energy and a higher sex drive.';
    case 'luteal':
      return 'Progesterone rises. PMS symptoms can appear in the final week.';
  }
}

export function cyclePhaseColorKey(state: Pick<DayState, 'isPeriod' | 'isPredictedPeriod' | 'isFertile' | 'isOvulation' | 'isPms'>): string {
  if (state.isPeriod) return 'period';
  if (state.isOvulation) return 'ovulation';
  if (state.isFertile) return 'fertile';
  if (state.isPms) return 'pms';
  if (state.isPredictedPeriod) return 'predictedPeriod';
  return 'none';
}
