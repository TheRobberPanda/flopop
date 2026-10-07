import type { ISODate } from '@/lib/dates';

export type FlowLevel = 'none' | 'spotting' | 'light' | 'medium' | 'heavy';
export type CyclePhase = 'menstrual' | 'follicular' | 'ovulatory' | 'luteal';
export type Confidence = 'low' | 'medium' | 'high';

export interface PeriodCycle {
  id: number;
  startDate: ISODate;
  endDate: ISODate | null;
  notes: string | null;
}

export interface DayLogRow {
  date: ISODate;
  flow: FlowLevel;
  discharge: string | null;
  sex: string | null;
  bbt: number | null;
  weightKg: number | null;
  waterMl: number | null;
  sleepHours: number | null;
  pillTaken: number | null;
  cravings: string[];
  symptoms: string[];
  moods: string[];
  activities: string[];
  notes: string | null;
}

export interface CycleStats {
  avgCycleLength: number;
  avgPeriodLength: number;
  cycleLengthStdDev: number;
  variability: number;
  sampleSize: number;
  shortest: number;
  longest: number;
  isRegular: boolean;
  lutealLength: number;
}

export interface CyclePrediction {
  cycleStart: ISODate;
  periodEnd: ISODate;
  ovulationDate: ISODate;
  fertileStart: ISODate;
  fertileEnd: ISODate;
  pmsStart: ISODate;
  pmsEnd: ISODate;
  cycleLength: number;
  periodLength: number;
  confidence: Confidence;
}

export interface DayState {
  date: ISODate;
  isPeriod: boolean;
  isPredictedPeriod: boolean;
  isFertile: boolean;
  isOvulation: boolean;
  isPms: boolean;
  phase: CyclePhase;
  cycleDay: number | null;
  pregnancyChance: 'low' | 'medium' | 'high';
}

export interface CurrentCycleState {
  cycleDay: number;
  phase: CyclePhase;
  isOnPeriod: boolean;
  daysUntilNextPeriod: number;
  nextPeriodStart: ISODate;
  ovulationDate: ISODate;
  fertileStart: ISODate;
  fertileEnd: ISODate;
  pregnancyChance: 'low' | 'medium' | 'high';
  cycleLength: number;
}

export interface Insight {
  id: string;
  title: string;
  body: string;
  tone: 'info' | 'good' | 'watch';
}
