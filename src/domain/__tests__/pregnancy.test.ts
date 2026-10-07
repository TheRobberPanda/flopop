import { analyzeContractions, dueDateFromLMP, gestation, weekContent } from '../pregnancy';
import type { Contraction } from '../pregnancy';

describe('dueDateFromLMP', () => {
  it('adds 280 days to the last menstrual period', () => {
    expect(dueDateFromLMP('2026-01-01')).toBe('2026-10-08');
  });
});

describe('gestation', () => {
  it('computes weeks, trimester and progress', () => {
    const g = gestation('2026-01-01', '2026-01-01');
    expect(g.weeks).toBe(0);
    expect(g.trimester).toBe(1);
    expect(g.daysRemaining).toBe(280);
  });

  it('lands in the third trimester late on', () => {
    const g = gestation('2026-01-01', '2026-08-01');
    expect(g.weeks).toBeGreaterThanOrEqual(30);
    expect(g.trimester).toBe(3);
    expect(g.progress).toBeGreaterThan(0.7);
  });
});

describe('weekContent', () => {
  it('clamps weeks to a sensible range', () => {
    expect(weekContent(1).size).toBe(weekContent(4).size);
    expect(weekContent(60).size).toBe(weekContent(40).size);
  });
});

describe('analyzeContractions', () => {
  it('reports no pattern with too little data', () => {
    const stats = analyzeContractions([]);
    expect(stats.pattern).toBe('no_data');
  });

  it('detects regular, close, long contractions', () => {
    const now = 1_000_000_000_000;
    const list: Contraction[] = [0, 1, 2, 3].map((i) => ({
      id: String(i),
      start: now + i * 4 * 60_000,
      end: now + i * 4 * 60_000 + 60_000,
      intensity: 'strong',
    }));
    const stats = analyzeContractions(list);
    expect(stats.pattern).toBe('regular_strong');
    expect(Math.round(stats.avgFrequencyMinutes ?? 0)).toBe(4);
  });
});
