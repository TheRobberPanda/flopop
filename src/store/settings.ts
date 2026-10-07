export interface AppSettings {
  theme: 'system' | 'light' | 'dark';
  units: 'metric' | 'imperial';
  discreetMode: boolean;
  onboardingComplete: boolean;
  lockEnabled: boolean;
  biometricUnlock: boolean;
  periodReminderEnabled: boolean;
  periodReminderDaysBefore: number;
  periodReminderTime: string;
  logReminderEnabled: boolean;
  logReminderTime: string;
  pillReminderEnabled: boolean;
  hasSeenDisclaimer: boolean;
  savedArticles: string[];
}

export const SETTINGS_KEY = 'app.settings';

export const DEFAULT_SETTINGS: AppSettings = {
  theme: 'system',
  units: 'metric',
  discreetMode: false,
  onboardingComplete: false,
  lockEnabled: false,
  biometricUnlock: false,
  periodReminderEnabled: false,
  periodReminderDaysBefore: 2,
  periodReminderTime: '09:00',
  logReminderEnabled: false,
  logReminderTime: '20:00',
  pillReminderEnabled: false,
  hasSeenDisclaimer: false,
  savedArticles: [],
};

export function mergeSettings(partial: Partial<AppSettings> | null | undefined): AppSettings {
  return { ...DEFAULT_SETTINGS, ...(partial ?? {}) };
}
