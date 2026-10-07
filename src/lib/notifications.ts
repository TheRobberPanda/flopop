import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

let configured = false;

export function configureNotifications(): void {
  if (configured) return;
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: false,
    }),
  });
  configured = true;
}

export async function ensurePermissions(): Promise<boolean> {
  const current = await Notifications.getPermissionsAsync();
  if (current.granted) return true;
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
}

export async function ensureAndroidChannel(): Promise<void> {
  if (Platform.OS !== 'android') return;
  await Notifications.setNotificationChannelAsync('flopop', {
    name: 'Flopop reminders',
    importance: Notifications.AndroidImportance.HIGH,
    vibrationPattern: [0, 250, 250, 250],
    lightColor: '#FF5C8A',
  });
}

export async function scheduleDaily(input: {
  hour: number;
  minute: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<string> {
  await ensureAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body, data: input.data ?? {}, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour: input.hour,
      minute: input.minute,
      channelId: 'flopop',
    },
  });
}

export async function scheduleWeekly(input: {
  weekday: number;
  hour: number;
  minute: number;
  title: string;
  body: string;
  data?: Record<string, unknown>;
}): Promise<string> {
  await ensureAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body, data: input.data ?? {}, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.WEEKLY,
      weekday: input.weekday,
      hour: input.hour,
      minute: input.minute,
      channelId: 'flopop',
    },
  });
}

export async function scheduleAtDate(
  date: Date,
  input: { title: string; body: string; data?: Record<string, unknown> },
): Promise<string> {
  await ensureAndroidChannel();
  return Notifications.scheduleNotificationAsync({
    content: { title: input.title, body: input.body, data: input.data ?? {}, sound: true },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date,
      channelId: 'flopop',
    },
  });
}

export async function cancelNotification(id: string | null): Promise<void> {
  if (!id) return;
  try {
    await Notifications.cancelScheduledNotificationAsync(id);
  } catch {
    // already gone
  }
}

export async function cancelAll(): Promise<void> {
  await Notifications.cancelAllScheduledNotificationsAsync();
}
