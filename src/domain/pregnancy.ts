import { addDaysISO, daysBetween, type ISODate } from '@/lib/dates';

export const PREGNANCY_DAYS = 280;

export interface Gestation {
  totalDays: number;
  weeks: number;
  daysIntoWeek: number;
  trimester: 1 | 2 | 3;
  daysRemaining: number;
  progress: number;
}

export function dueDateFromLMP(lmp: ISODate): ISODate {
  return addDaysISO(lmp, PREGNANCY_DAYS);
}

export function conceptionEstimate(lmp: ISODate): ISODate {
  return addDaysISO(lmp, 14);
}

export function gestation(lmp: ISODate, today: ISODate): Gestation {
  const totalDays = Math.max(0, daysBetween(lmp, today));
  const weeks = Math.floor(totalDays / 7);
  const daysIntoWeek = totalDays % 7;
  const trimester: 1 | 2 | 3 = weeks < 13 ? 1 : weeks < 28 ? 2 : 3;
  const daysRemaining = Math.max(0, PREGNANCY_DAYS - totalDays);
  return {
    totalDays,
    weeks,
    daysIntoWeek,
    trimester,
    daysRemaining,
    progress: Math.min(1, totalDays / PREGNANCY_DAYS),
  };
}

interface WeekContent {
  size: string;
  length: string;
  weight: string;
  body: string;
}

const SIZES: Record<number, [string, string]> = {
  4: ['A poppy seed', '1 mm'],
  5: ['A sesame seed', '2 mm'],
  6: ['A lentil', '4 mm'],
  7: ['A blueberry', '1 cm'],
  8: ['A raspberry', '1.6 cm'],
  9: ['A grape', '2.3 cm'],
  10: ['A strawberry', '3.1 cm'],
  11: ['A fig', '4.1 cm'],
  12: ['A lime', '5.4 cm'],
  13: ['A pea pod', '7.4 cm'],
  14: ['A lemon', '8.7 cm'],
  15: ['An apple', '10.1 cm'],
  16: ['An avocado', '11.6 cm'],
  17: ['A pear', '13 cm'],
  18: ['A bell pepper', '14.2 cm'],
  19: ['A mango', '15.3 cm'],
  20: ['A banana', '25.6 cm'],
  21: ['A carrot', '26.7 cm'],
  22: ['A papaya', '27.8 cm'],
  23: ['A grapefruit', '28.9 cm'],
  24: ['An ear of corn', '30 cm'],
  25: ['A cauliflower', '34.6 cm'],
  26: ['A lettuce head', '35.6 cm'],
  27: ['A cabbage', '36.6 cm'],
  28: ['An eggplant', '37.6 cm'],
  29: ['A butternut squash', '38.6 cm'],
  30: ['A cucumber', '39.9 cm'],
  31: ['A coconut', '41.1 cm'],
  32: ['A jicama', '42.4 cm'],
  33: ['A pineapple', '43.7 cm'],
  34: ['A cantaloupe', '45 cm'],
  35: ['A honeydew melon', '46.2 cm'],
  36: ['A romaine lettuce', '47.4 cm'],
  37: ['A bunch of swiss chard', '48.6 cm'],
  38: ['A leek', '49.8 cm'],
  39: ['A small watermelon', '50.7 cm'],
  40: ['A pumpkin', '51.2 cm'],
};

function clampWeek(week: number): number {
  return Math.min(40, Math.max(4, week));
}

export function weekContent(week: number): WeekContent {
  const clamped = clampWeek(week);
  const [size, length] = SIZES[clamped] ?? ['A tiny human', '—'];
  return {
    size,
    length,
    weight: clamped >= 28 ? 'about 1 kg or more' : 'still very light',
    body: `This week your baby is roughly the size of ${size.toLowerCase()} and about ${length} long. Organs and features keep developing fast.`,
  };
}

export function trimesterLabel(trimester: 1 | 2 | 3): string {
  return trimester === 1 ? 'First trimester' : trimester === 2 ? 'Second trimester' : 'Third trimester';
}

export interface Contraction {
  id: string;
  start: number;
  end: number | null;
  intensity: 'mild' | 'moderate' | 'strong';
}

export interface ContractionStats {
  count: number;
  avgDurationMinutes: number | null;
  avgFrequencyMinutes: number | null;
  pattern: 'no_data' | 'irregular' | 'building' | 'regular_strong';
  advice: string;
}

export function analyzeContractions(list: Contraction[]): ContractionStats {
  const completed = list.filter((c) => c.end !== null);
  const durations = completed.map((c) => (c.end as number) - c.start);
  const avgDuration = durations.length > 0 ? durations.reduce((a, b) => a + b, 0) / durations.length / 60000 : null;

  const starts = list.map((c) => c.start).sort((a, b) => a - b);
  const gaps: number[] = [];
  for (let i = 1; i < starts.length; i += 1) gaps.push((starts[i] - starts[i - 1]) / 60000);
  const recentGaps = gaps.slice(-5);
  const avgFrequency = recentGaps.length > 0 ? recentGaps.reduce((a, b) => a + b, 0) / recentGaps.length : null;

  if (list.length < 2 || avgFrequency === null || avgDuration === null) {
    return {
      count: list.length,
      avgDurationMinutes: avgDuration,
      avgFrequencyMinutes: avgFrequency,
      pattern: 'no_data',
      advice: 'Time a few contractions to see a pattern.',
    };
  }

  const spread = Math.max(...recentGaps) - Math.min(...recentGaps);
  const isRegular = spread <= 2;

  if (isRegular && avgFrequency <= 5 && avgDuration >= 0.75) {
    return {
      count: list.length,
      avgDurationMinutes: avgDuration,
      avgFrequencyMinutes: avgFrequency,
      pattern: 'regular_strong',
      advice: 'Contractions are regular, close and lasting about a minute. If this keeps up, contact your midwife or hospital.',
    };
  }

  return {
    count: list.length,
    avgDurationMinutes: avgDuration,
    avgFrequencyMinutes: avgFrequency,
    pattern: isRegular ? 'building' : 'irregular',
    advice: isRegular
      ? 'A regular pattern is forming. Keep timing and rest while you can.'
      : 'Contractions are still irregular — this is often early labour. Rest, hydrate and keep timing.',
  };
}
