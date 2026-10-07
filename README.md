# Flopop

A private, fully offline period and cycle tracker for Android. Everything lives on the phone — there is no account, no cloud and no network access at runtime.

## What it does

- **Cycle predictions** — periods, ovulation, fertile window and PMS, learned from your logged cycles (with confidence that widens when cycles are irregular).
- **Calendar** — colour-coded month view (period, predicted, fertile, ovulation, PMS) with tap-to-log.
- **Daily log** — flow, ~40 symptoms, moods, discharge, sex, cravings, activities, water, sleep, weight, basal temperature, notes and contraceptive taken.
- **Insights** — cycle-length history chart, symptom and mood patterns, PMS correlations, hydration and sleep checks.
- **Predictions** — the next six cycles with confidence bands.
- **Pregnancy mode** — due date, week-by-week updates, kick counter and contraction timer.
- **Contraception** — method schedules, daily adherence tracking and reminders.
- **Reminders** — local notifications for period, daily logging, contraception and custom reminders.
- **Health report** — an in-app summary you can share as text.
- **Backup & restore** — encrypted (AES-256) or plain JSON export/import you keep yourself.
- **Privacy** — 4-digit PIN and fingerprint lock, discreet mode, and a full data wipe.
- **Health library** — short offline articles on cycles, PMS, fertility and more.

Not included, because they need servers: Flo-style community/secret chats, cloud sync and accounts.

> Flopop is a personal tracker, not a medical device. Predictions are estimates and must not be used as contraception or for diagnosis.

## Tech

Expo SDK 57 · React Native 0.86 · TypeScript · expo-router · expo-sqlite (SQLite, WAL) · Zustand · date-fns · react-native-svg · @noble/ciphers. All data is stored locally in `flopop.db`.

## Development

```bash
npm install
npx expo start            # dev server
npx expo run:android      # build & install on a device/emulator
npm run typecheck         # tsc --noEmit
npm run lint              # expo lint
npm test                  # jest (cycle + pregnancy engine tests)
```

## Building a standalone APK (no servers)

```bash
npx expo prebuild -p android
cd android && ./gradlew assembleRelease
```

The signed APK is written to `android/app/build/outputs/apk/release/app-release.apk`. Sideload it onto the phone (enable "install unknown apps"), or use the debug build with `./gradlew assembleDebug`.

The release build bundles the JavaScript, so the installed app runs entirely offline. Use only on-device SQLite, local notifications and the device keychain — no network calls.

## Project layout

```
src/
  app/         expo-router screens (onboarding, (tabs), log, pregnancy, …)
  components/  UI kit and domain widgets (cycle ring, calendar, lock screen)
  content/     offline catalogs: symptoms, moods, articles
  db/          SQLite client, migrations and repositories
  domain/      cycle prediction engine, insights, pregnancy maths (pure + tested)
  hooks/       data hooks that read the local database
  lib/         crypto, backups, notifications, PIN lock, date helpers
  store/       Zustand app state
  theme/       colours, spacing, typography
```
