import { getDb } from '../client';

export interface Profile {
  id: number;
  name: string;
  dob: string | null;
  units: 'metric' | 'imperial';
  goal: 'track' | 'conceive' | 'pregnancy' | 'contraception';
  avgCycleLength: number;
  avgPeriodLength: number;
  lutealLength: number;
  createdAt: string;
}

interface ProfileRow {
  id: number;
  name: string;
  dob: string | null;
  units: 'metric' | 'imperial';
  goal: Profile['goal'];
  avg_cycle_length: number;
  avg_period_length: number;
  luteal_length: number;
  created_at: string;
}

function map(row: ProfileRow): Profile {
  return {
    id: row.id,
    name: row.name,
    dob: row.dob,
    units: row.units,
    goal: row.goal,
    avgCycleLength: row.avg_cycle_length,
    avgPeriodLength: row.avg_period_length,
    lutealLength: row.luteal_length,
    createdAt: row.created_at,
  };
}

export function getProfile(): Profile | null {
  const row = getDb().getFirstSync<ProfileRow>('SELECT * FROM profile WHERE id = 1');
  return row ? map(row) : null;
}

export function createProfile(input: {
  name: string;
  dob: string | null;
  units: Profile['units'];
  goal: Profile['goal'];
  avgCycleLength: number;
  avgPeriodLength: number;
  lutealLength?: number;
  createdAt: string;
}): Profile {
  getDb().runSync(
    `INSERT OR REPLACE INTO profile
      (id, name, dob, units, goal, avg_cycle_length, avg_period_length, luteal_length, created_at)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      input.name,
      input.dob,
      input.units,
      input.goal,
      input.avgCycleLength,
      input.avgPeriodLength,
      input.lutealLength ?? 14,
      input.createdAt,
    ],
  );
  return getProfile() as Profile;
}

export function updateProfile(patch: Partial<Omit<Profile, 'id' | 'createdAt'>>): void {
  const current = getProfile();
  if (!current) return;
  const next = { ...current, ...patch };
  createProfile({
    name: next.name,
    dob: next.dob,
    units: next.units,
    goal: next.goal,
    avgCycleLength: next.avgCycleLength,
    avgPeriodLength: next.avgPeriodLength,
    lutealLength: next.lutealLength,
    createdAt: current.createdAt,
  });
}
