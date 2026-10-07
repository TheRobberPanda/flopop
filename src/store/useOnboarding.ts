import { create } from 'zustand';

import type { Profile } from '@/db/repositories/profile';

interface Draft {
  name: string;
  dob: string | null;
  goal: Profile['goal'];
  units: Profile['units'];
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodStart: string | null;
  lastPeriodEnd: string | null;
  set: (patch: Partial<Omit<Draft, 'set' | 'reset'>>) => void;
  reset: () => void;
}

const initial = {
  name: '',
  dob: null as string | null,
  goal: 'track' as Profile['goal'],
  units: 'metric' as Profile['units'],
  avgCycleLength: 28,
  avgPeriodLength: 5,
  lastPeriodStart: null as string | null,
  lastPeriodEnd: null as string | null,
};

export const useOnboarding = create<Draft>((set) => ({
  ...initial,
  set: (patch) => set(patch),
  reset: () => set(initial),
}));
