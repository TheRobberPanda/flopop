import {
  buildDayStates,
  computeCycleStats,
  currentCycleState,
  cycleLengths,
  predictCycleFrom,
  upcomingPredictions,
} from '../cycle';
import type { PeriodCycle } from '../types';

function cycle(id: number, startDate: string, endDate: string | null = null): PeriodCycle {
  return { id, startDate, endDate, notes: null };
}

describe('cycleLengths', () => {
  it('returns the gaps between consecutive period starts', () => {
    const periods = [cycle(1, '2026-01-01', '2026-01-05'), cycle(2, '2026-01-29'), cycle(3, '2026-02-26')];
    expect(cycleLengths(periods)).toEqual([28, 28]);
  });

  it('ignores implausible gaps', () => {
    const periods = [cycle(1, '2026-01-01'), cycle(2, '2026-03-15'), cycle(3, '2026-04-12')];
    expect(cycleLengths(periods)).toEqual([28]);
  });
});

describe('computeCycleStats', () => {
  it('averages recent cycle lengths', () => {
    const periods = [
      cycle(1, '2026-01-01', '2026-01-05'),
      cycle(2, '2026-01-29', '2026-02-02'),
      cycle(3, '2026-02-26', '2026-03-02'),
    ];
    const stats = computeCycleStats(periods);
    expect(stats.avgCycleLength).toBe(28);
    expect(stats.avgPeriodLength).toBe(5);
    expect(stats.sampleSize).toBe(2);
    expect(stats.isRegular).toBe(true);
    expect(stats.shortest).toBe(28);
    expect(stats.longest).toBe(28);
  });

  it('flags irregular cycles with a high standard deviation', () => {
    const periods = [
      cycle(1, '2026-01-01'),
      cycle(2, '2026-01-24'),
      cycle(3, '2026-03-02'),
      cycle(4, '2026-03-30'),
    ];
    const stats = computeCycleStats(periods);
    expect(stats.sampleSize).toBe(3);
    expect(stats.cycleLengthStdDev).toBeGreaterThan(5);
    expect(stats.isRegular).toBe(false);
  });

  it('falls back to defaults with no history', () => {
    const stats = computeCycleStats([], { fallbackCycleLength: 30, fallbackPeriodLength: 6 });
    expect(stats.avgCycleLength).toBe(30);
    expect(stats.avgPeriodLength).toBe(6);
    expect(stats.sampleSize).toBe(0);
  });
});

describe('predictCycleFrom', () => {
  it('places ovulation 14 days before the next period', () => {
    const stats = computeCycleStats([], { fallbackCycleLength: 28, fallbackPeriodLength: 5 });
    const prediction = predictCycleFrom('2026-01-01', stats);
    expect(prediction.ovulationDate).toBe('2026-01-15');
    expect(prediction.fertileStart).toBe('2026-01-10');
    expect(prediction.fertileEnd).toBe('2026-01-16');
    expect(prediction.periodEnd).toBe('2026-01-05');
    expect(prediction.pmsStart).toBe('2026-01-24');
    expect(prediction.pmsEnd).toBe('2026-01-28');
  });
});

describe('upcomingPredictions', () => {
  it('skips the current cycle and returns future ones', () => {
    const periods = [cycle(1, '2026-01-01', '2026-01-05')];
    const stats = computeCycleStats(periods, { fallbackCycleLength: 28 });
    const predictions = upcomingPredictions(periods, stats, '2026-03-01', 2);
    expect(predictions).toHaveLength(2);
    expect(predictions[0].cycleStart > '2026-03-01').toBe(true);
    expect(predictions[1].cycleStart > predictions[0].cycleStart).toBe(true);
  });
});

describe('buildDayStates', () => {
  it('marks logged period days and fertile days differently', () => {
    const periods = [cycle(1, '2026-01-01', '2026-01-05')];
    const stats = computeCycleStats(periods, { fallbackCycleLength: 28 });
    const states = buildDayStates(periods, stats, '2026-01-01', '2026-01-31');
    expect(states.get('2026-01-01')?.isPeriod).toBe(true);
    expect(states.get('2026-01-01')?.phase).toBe('menstrual');
    expect(states.get('2026-01-15')?.isOvulation).toBe(true);
    expect(states.get('2026-01-12')?.isFertile).toBe(true);
    expect(states.get('2026-01-26')?.isPms).toBe(true);
  });
});

describe('currentCycleState', () => {
  it('computes cycle day from the last period start', () => {
    const periods = [cycle(1, '2026-01-01', '2026-01-05')];
    const stats = computeCycleStats(periods, { fallbackCycleLength: 28 });
    const state = currentCycleState(periods, stats, '2026-01-10');
    expect(state.cycleDay).toBe(10);
    expect(state.isOnPeriod).toBe(false);
    expect(state.phase).toBe('menstrual' === state.phase ? 'menstrual' : state.phase);
  });

  it('reports being on a period', () => {
    const periods = [cycle(1, '2026-01-01', '2026-01-05')];
    const stats = computeCycleStats(periods, { fallbackCycleLength: 28 });
    const state = currentCycleState(periods, stats, '2026-01-03');
    expect(state.isOnPeriod).toBe(true);
    expect(state.phase).toBe('menstrual');
  });
});
