import { create } from 'zustand';

import { computeCycleStats } from '@/domain/cycle';
import type { CycleStats, DayLogRow, FlowLevel, PeriodCycle } from '@/domain/types';
import { getDb } from '@/db/client';
import { createProfile, getProfile, updateProfile, type Profile } from '@/db/repositories/profile';
import { getJson, setJson } from '@/db/repositories/settings';
import { listCycles, addPeriodRange } from '@/db/repositories/cycles';
import { deleteDayLog, getDayLog, saveDayLog, type DayLogInput } from '@/db/repositories/logs';
import {
  createReminder,
  deleteReminder,
  listReminders,
  updateReminder,
  type Reminder,
} from '@/db/repositories/reminders';
import {
  createContraceptive,
  deleteContraceptive,
  listContraceptives,
  setContraceptiveActive,
  toggleTaken,
  type Contraceptive,
} from '@/db/repositories/contraception';
import {
  endPregnancy,
  getActivePregnancy,
  startPregnancy,
  type Pregnancy,
} from '@/db/repositories/pregnancy';
import { isLockEnabled, clearPin } from '@/lib/lock';
import { today as todayISO } from '@/lib/dates';
import { applyReminders } from '@/lib/reminder-engine';
import { wipeAll } from '@/db/repositories/backup';
import { DEFAULT_SETTINGS, SETTINGS_KEY, mergeSettings, type AppSettings } from './settings';

interface OnboardingInput {
  name: string;
  dob: string | null;
  goal: Profile['goal'];
  units: Profile['units'];
  avgCycleLength: number;
  avgPeriodLength: number;
  lastPeriodStart: string | null;
  lastPeriodEnd: string | null;
}

interface AppState {
  ready: boolean;
  locked: boolean;
  revision: number;
  profile: Profile | null;
  cycles: PeriodCycle[];
  stats: CycleStats;
  settings: AppSettings;
  reminders: Reminder[];
  contraceptives: Contraceptive[];
  pregnancy: Pregnancy | null;
  todayLog: DayLogRow | null;

  init: () => Promise<void>;
  unlock: () => void;
  lock: () => void;

  refresh: () => void;
  recompute: () => void;
  syncReminders: () => void;
  bumpRevision: () => void;

  updateSettings: (patch: Partial<AppSettings>) => void;
  completeOnboarding: (input: OnboardingInput) => void;
  saveProfile: (patch: Partial<Omit<Profile, 'id' | 'createdAt'>>) => void;
  addPeriod: (start: string, end: string) => void;

  saveLog: (date: string, patch: DayLogInput) => void;
  getLog: typeof getDayLog;
  deleteLog: (date: string) => void;

  addReminder: (input: Parameters<typeof createReminder>[0]) => Reminder;
  patchReminder: (id: number, patch: Parameters<typeof updateReminder>[1]) => void;
  removeReminder: (id: number) => void;

  addContraceptive: (input: Parameters<typeof createContraceptive>[0]) => Contraceptive;
  toggleContraceptiveTaken: (id: number, date: string, taken: boolean) => void;
  setContraceptiveActive: (id: number, active: boolean) => void;
  removeContraceptive: (id: number) => void;

  beginPregnancy: (lmpDate: string) => void;
  finishPregnancy: () => void;
  wipeEverything: () => void;
}

const EMPTY_STATS: CycleStats = {
  avgCycleLength: 28,
  avgPeriodLength: 5,
  cycleLengthStdDev: 0,
  variability: 0,
  sampleSize: 0,
  shortest: 28,
  longest: 28,
  isRegular: true,
  lutealLength: 14,
};

function loadAll() {
  const profile = getProfile();
  const cycles = listCycles();
  const stats = computeCycleStats(cycles, {
    fallbackCycleLength: profile?.avgCycleLength ?? 28,
    fallbackPeriodLength: profile?.avgPeriodLength ?? 5,
    lutealLength: profile?.lutealLength ?? 14,
  });
  return {
    profile,
    cycles,
    stats,
    settings: mergeSettings(getJson<Partial<AppSettings>>(SETTINGS_KEY, {})),
    reminders: listReminders(),
    contraceptives: listContraceptives(),
    pregnancy: getActivePregnancy(),
    todayLog: getDayLog(todayISO()),
  };
}

export const useAppStore = create<AppState>((set, get) => ({
  ready: false,
  locked: false,
  revision: 0,
  profile: null,
  cycles: [],
  stats: EMPTY_STATS,
  settings: mergeSettings({}),
  reminders: [],
  contraceptives: [],
  pregnancy: null,
  todayLog: null,

  init: async () => {
    getDb();
    const lockEnabled = await isLockEnabled();
    const data = loadAll();
    set({
      ...data,
      settings: { ...data.settings, lockEnabled },
      locked: lockEnabled && data.settings.onboardingComplete,
      ready: true,
    });
    get().syncReminders();
  },

  unlock: () => set({ locked: false }),
  lock: () => set({ locked: true }),

  refresh: () => set((state) => ({ ...loadAll(), revision: state.revision + 1 })),
  recompute: () => {
    const { cycles, profile } = get();
    set({
      stats: computeCycleStats(cycles, {
        fallbackCycleLength: profile?.avgCycleLength ?? 28,
        fallbackPeriodLength: profile?.avgPeriodLength ?? 5,
        lutealLength: profile?.lutealLength ?? 14,
      }),
    });
  },
  syncReminders: () => {
    const { settings, contraceptives, reminders, cycles, stats } = get();
    void applyReminders({ settings, contraceptives, reminders, cycles, stats }).catch(() => {});
  },
  bumpRevision: () => set((state) => ({ revision: state.revision + 1 })),

  updateSettings: (patch) => {
    const next = { ...get().settings, ...patch };
    setJson(SETTINGS_KEY, next);
    set((state) => ({ settings: next, revision: state.revision + 1 }));
    get().syncReminders();
  },

  completeOnboarding: (input) => {
    createProfile({
      name: input.name,
      dob: input.dob,
      units: input.units,
      goal: input.goal,
      avgCycleLength: input.avgCycleLength,
      avgPeriodLength: input.avgPeriodLength,
      createdAt: new Date().toISOString(),
    });
    if (input.lastPeriodStart) {
      addPeriodRange(input.lastPeriodStart, input.lastPeriodEnd ?? input.lastPeriodStart);
    }
    get().updateSettings({ onboardingComplete: true, units: input.units });
    get().refresh();
  },

  saveProfile: (patch) => {
    updateProfile(patch);
    get().refresh();
  },

  addPeriod: (start, end) => {
    addPeriodRange(start, end);
    get().refresh();
  },

  saveLog: (date, patch) => {
    saveDayLog(date, patch);
    get().refresh();
  },
  getLog: getDayLog,
  deleteLog: (date) => {
    deleteDayLog(date);
    get().refresh();
  },

  addReminder: (input) => {
    const reminder = createReminder(input);
    get().refresh();
    get().syncReminders();
    return reminder;
  },
  patchReminder: (id, patch) => {
    updateReminder(id, patch);
    get().refresh();
    get().syncReminders();
  },
  removeReminder: (id) => {
    deleteReminder(id);
    get().refresh();
    get().syncReminders();
  },

  addContraceptive: (input) => {
    const item = createContraceptive(input);
    get().refresh();
    get().syncReminders();
    return item;
  },
  toggleContraceptiveTaken: (id, date, taken) => {
    toggleTaken(id, date, taken);
    set((state) => ({ revision: state.revision + 1 }));
  },
  setContraceptiveActive: (id, active) => {
    setContraceptiveActive(id, active);
    get().refresh();
    get().syncReminders();
  },
  removeContraceptive: (id) => {
    deleteContraceptive(id);
    get().refresh();
    get().syncReminders();
  },

  beginPregnancy: (lmpDate) => {
    startPregnancy(lmpDate);
    get().saveProfile({ goal: 'pregnancy' });
  },
  finishPregnancy: () => {
    const current = get().pregnancy;
    if (current) endPregnancy(current.id);
    get().saveProfile({ goal: 'track' });
  },

  wipeEverything: () => {
    wipeAll();
    void clearPin();
    setJson(SETTINGS_KEY, DEFAULT_SETTINGS);
    set((state) => ({
      ready: true,
      locked: false,
      revision: state.revision + 1,
      profile: null,
      cycles: [],
      stats: EMPTY_STATS,
      settings: DEFAULT_SETTINGS,
      reminders: [],
      contraceptives: [],
      pregnancy: null,
    }));
  },
}));

export function flowValue(flow: FlowLevel | undefined): FlowLevel {
  return flow ?? 'none';
}
