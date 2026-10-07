import type { SQLiteDatabase } from 'expo-sqlite';

const MIGRATIONS: string[] = [
  `
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    dob TEXT,
    units TEXT NOT NULL DEFAULT 'metric',
    goal TEXT NOT NULL DEFAULT 'track',
    avg_cycle_length INTEGER NOT NULL DEFAULT 28,
    avg_period_length INTEGER NOT NULL DEFAULT 5,
    luteal_length INTEGER NOT NULL DEFAULT 14,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY NOT NULL,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS cycles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    start_date TEXT NOT NULL UNIQUE,
    end_date TEXT,
    notes TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS logs (
    date TEXT PRIMARY KEY NOT NULL,
    flow TEXT NOT NULL DEFAULT 'none',
    discharge TEXT,
    sex TEXT,
    bbt REAL,
    weight_kg REAL,
    water_ml INTEGER,
    sleep_hours REAL,
    pill_taken INTEGER,
    notes TEXT,
    updated_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS log_symptoms (
    log_date TEXT NOT NULL,
    symptom_id TEXT NOT NULL,
    PRIMARY KEY (log_date, symptom_id)
  );

  CREATE TABLE IF NOT EXISTS log_moods (
    log_date TEXT NOT NULL,
    mood_id TEXT NOT NULL,
    PRIMARY KEY (log_date, mood_id)
  );

  CREATE TABLE IF NOT EXISTS log_activities (
    log_date TEXT NOT NULL,
    activity_id TEXT NOT NULL,
    PRIMARY KEY (log_date, activity_id)
  );

  CREATE TABLE IF NOT EXISTS log_cravings (
    log_date TEXT NOT NULL,
    craving_id TEXT NOT NULL,
    PRIMARY KEY (log_date, craving_id)
  );

  CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    label TEXT NOT NULL,
    time TEXT NOT NULL DEFAULT '09:00',
    days_before INTEGER NOT NULL DEFAULT 0,
    weekdays TEXT,
    enabled INTEGER NOT NULL DEFAULT 1,
    notification_id TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contraceptives (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    method TEXT NOT NULL DEFAULT 'pill',
    dose TEXT,
    schedule TEXT NOT NULL DEFAULT 'daily',
    start_date TEXT NOT NULL,
    reminder_time TEXT,
    active INTEGER NOT NULL DEFAULT 1,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contraceptive_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    contraceptive_id INTEGER NOT NULL,
    date TEXT NOT NULL,
    taken INTEGER NOT NULL DEFAULT 1,
    UNIQUE (contraceptive_id, date)
  );

  CREATE TABLE IF NOT EXISTS pregnancies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lmp_date TEXT NOT NULL,
    due_date TEXT NOT NULL,
    active INTEGER NOT NULL DEFAULT 1,
    ended_date TEXT,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS kicks (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pregnancy_id INTEGER NOT NULL,
    timestamp TEXT NOT NULL,
    session_date TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS contractions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    pregnancy_id INTEGER NOT NULL,
    start_ts INTEGER NOT NULL,
    end_ts INTEGER,
    intensity TEXT NOT NULL DEFAULT 'mild'
  );

  CREATE TABLE IF NOT EXISTS articles_read (
    article_id TEXT PRIMARY KEY NOT NULL,
    read_at TEXT NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_cycles_start ON cycles (start_date);
  CREATE INDEX IF NOT EXISTS idx_logs_date ON logs (date);
  CREATE INDEX IF NOT EXISTS idx_kicks_session ON kicks (session_date);
  CREATE INDEX IF NOT EXISTS idx_contractions_pregnancy ON contractions (pregnancy_id);
  `,
];

export function runMigrations(db: SQLiteDatabase): void {
  const row = db.getFirstSync<{ user_version: number }>('PRAGMA user_version');
  const current = row?.user_version ?? 0;
  for (let i = current; i < MIGRATIONS.length; i += 1) {
    db.withTransactionSync(() => {
      db.execSync(MIGRATIONS[i]);
    });
    db.execSync(`PRAGMA user_version = ${i + 1}`);
  }
}
