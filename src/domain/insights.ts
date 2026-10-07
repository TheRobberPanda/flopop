import { addDaysISO, daysBetween, isWithin, type ISODate } from '@/lib/dates';
import { catalogLabel } from '@/content/catalogs';

import { cycleLengths } from './cycle';
import type { CycleStats, DayLogRow, DayState, Insight, PeriodCycle } from './types';

function countTop(values: string[], limit = 3): { id: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

function average(values: (number | null | undefined)[]): number | null {
  const nums = values.filter((v): v is number => typeof v === 'number' && Number.isFinite(v));
  if (nums.length === 0) return null;
  return nums.reduce((sum, v) => sum + v, 0) / nums.length;
}

export function generateInsights(params: {
  logs: DayLogRow[];
  periods: PeriodCycle[];
  stats: CycleStats;
  dayStates: Map<ISODate, DayState>;
  today: ISODate;
}): Insight[] {
  const { logs, periods, stats, today } = params;
  const insights: Insight[] = [];

  if (stats.sampleSize >= 1) {
    const detail =
      stats.sampleSize >= 2
        ? `Your last ${stats.sampleSize} cycles averaged ${stats.avgCycleLength} days, ranging from ${stats.shortest} to ${stats.longest}.`
        : `Based on what you've logged, your cycle is about ${stats.avgCycleLength} days.`;
    insights.push({
      id: 'cycle-length',
      title: `Your average cycle is ${stats.avgCycleLength} days`,
      body: detail,
      tone: 'info',
    });
  }

  if (stats.sampleSize >= 3) {
    if (stats.isRegular) {
      insights.push({
        id: 'regularity',
        title: 'Your cycles are fairly regular',
        body: `They vary by around ${stats.cycleLengthStdDev.toFixed(1)} days. Regular cycles make predictions more reliable.`,
        tone: 'good',
      });
    } else {
      insights.push({
        id: 'regularity',
        title: 'Your cycles vary quite a bit',
        body: `They swing by around ${stats.cycleLengthStdDev.toFixed(1)} days. Predictions use a wider window — stress, sleep, travel and weight changes can all shift timing.`,
        tone: 'watch',
      });
    }
  }

  const lengths = cycleLengths(periods);
  if (lengths.length >= 4) {
    const half = Math.floor(lengths.length / 2);
    const older = average(lengths.slice(0, half));
    const recent = average(lengths.slice(-half));
    if (older && recent && Math.abs(recent - older) >= 2) {
      const direction = recent > older ? 'longer' : 'shorter';
      insights.push({
        id: 'trend',
        title: `Your recent cycles are ${direction}`,
        body: `They moved from about ${older.toFixed(1)} to ${recent.toFixed(1)} days. Keep tracking to see if it settles.`,
        tone: 'info',
      });
    }
  }

  const allSymptoms = logs.flatMap((l) => l.symptoms);
  const topSymptoms = countTop(allSymptoms, 3);
  if (topSymptoms.length > 0) {
    insights.push({
      id: 'top-symptoms',
      title: 'Your most logged symptoms',
      body: topSymptoms.map((s) => `${catalogLabel(s.id)} (${s.count})`).join(', ') + '.',
      tone: 'info',
    });
  }

  const premenstrualSymptoms: string[] = [];
  for (const period of periods) {
    const windowStart = addDaysISO(period.startDate, -5);
    const windowEnd = addDaysISO(period.startDate, -1);
    for (const log of logs) {
      if (isWithin(log.date, windowStart, windowEnd)) premenstrualSymptoms.push(...log.symptoms);
    }
  }
  const topPre = countTop(premenstrualSymptoms, 2);
  if (topPre.length > 0 && premenstrualSymptoms.length >= 3) {
    insights.push({
      id: 'pms-pattern',
      title: 'A pattern before your period',
      body: `You often log ${topPre.map((s) => catalogLabel(s.id).toLowerCase()).join(' and ')} in the 5 days before your period starts.`,
      tone: 'info',
    });
  }

  const lutealMoods: string[] = [];
  const follicularMoods: string[] = [];
  for (const log of logs) {
    const state = params.dayStates.get(log.date);
    if (!state) continue;
    if (state.phase === 'luteal') lutealMoods.push(...log.moods);
    if (state.phase === 'follicular') follicularMoods.push(...log.moods);
  }
  const topLuteal = countTop(lutealMoods, 1)[0];
  const topFollicular = countTop(follicularMoods, 1)[0];
  if (topLuteal && topFollicular && topLuteal.id !== topFollicular.id) {
    insights.push({
      id: 'mood-phases',
      title: 'Your mood shifts with your cycle',
      body: `You log ${catalogLabel(topFollicular.id).toLowerCase()} more in your follicular phase and ${catalogLabel(topLuteal.id).toLowerCase()} more in your luteal phase.`,
      tone: 'info',
    });
  }

  const avgWater = average(logs.map((l) => l.waterMl));
  if (avgWater !== null && avgWater < 1500) {
    insights.push({
      id: 'hydration',
      title: 'Hydration could be higher',
      body: `You average about ${Math.round(avgWater)} ml on days you track. Around 2 litres is a common target.`,
      tone: 'watch',
    });
  }

  const avgSleep = average(logs.map((l) => l.sleepHours));
  if (avgSleep !== null) {
    if (avgSleep < 7) {
      insights.push({
        id: 'sleep',
        title: 'Sleep is running a little short',
        body: `You average ${avgSleep.toFixed(1)} hours. Short sleep can make PMS symptoms feel stronger.`,
        tone: 'watch',
      });
    } else {
      insights.push({
        id: 'sleep',
        title: 'Your sleep looks healthy',
        body: `You average ${avgSleep.toFixed(1)} hours on days you track.`,
        tone: 'good',
      });
    }
  }

  const recentLogs = logs.filter((l) => daysBetween(l.date, today) <= 30).length;
  if (recentLogs >= 10) {
    insights.push({
      id: 'logging',
      title: 'Great logging streak',
      body: `You logged ${recentLogs} days in the last month. More data makes your predictions sharper.`,
      tone: 'good',
    });
  } else if (logs.length > 0) {
    insights.push({
      id: 'logging',
      title: 'Log a little more for sharper predictions',
      body: `You tracked ${recentLogs} day${recentLogs === 1 ? '' : 's'} in the last month. Even logging mood and flow helps.`,
      tone: 'info',
    });
  }

  return insights;
}
