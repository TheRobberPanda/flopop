import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, Switch, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/field';
import { Stepper } from '@/components/stepper';
import { AppText, Button, Card, Chip, IconButton, Row, SectionHeader } from '@/components/ui';
import { ensurePermissions } from '@/lib/notifications';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export default function RemindersScreen() {
  const { colors } = useTheme();
  const settings = useAppStore((state) => state.settings);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const reminders = useAppStore((state) => state.reminders);
  const addReminder = useAppStore((state) => state.addReminder);
  const removeReminder = useAppStore((state) => state.removeReminder);
  const patchReminder = useAppStore((state) => state.patchReminder);

  const [label, setLabel] = useState('');
  const [time, setTime] = useState('09:00');
  const [days, setDays] = useState<number[]>([]);

  const requestAndToggle = async (key: 'periodReminderEnabled' | 'logReminderEnabled' | 'pillReminderEnabled', value: boolean) => {
    if (value) await ensurePermissions();
    updateSettings({ [key]: value } as never);
  };

  const submit = () => {
    if (!label.trim()) return;
    addReminder({
      type: 'custom',
      label: label.trim(),
      time: time.trim() || '09:00',
      weekdays: days.length > 0 ? days : null,
    });
    setLabel('');
    setDays([]);
    setTime('09:00');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Reminders
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Period reminder" />
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="body" muted style={styles.flex}>
              Get a heads-up before your predicted period.
            </AppText>
            <Switch
              value={settings.periodReminderEnabled}
              onValueChange={(value) => requestAndToggle('periodReminderEnabled', value)}
              trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
              thumbColor="#FFFFFF"
            />
          </Row>
          {settings.periodReminderEnabled ? (
            <>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label">Days before</AppText>
              </Row>
              <Stepper
                value={settings.periodReminderDaysBefore}
                onChange={(value) => updateSettings({ periodReminderDaysBefore: value })}
                min={0}
                max={7}
                suffix="days"
              />
              <TextField
                label="Time (24h)"
                value={settings.periodReminderTime}
                onChangeText={(value) => updateSettings({ periodReminderTime: value })}
                placeholder="09:00"
                maxLength={5}
              />
            </>
          ) : null}
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Daily log reminder" />
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="body" muted style={styles.flex}>
              A gentle nudge to log how you feel.
            </AppText>
            <Switch
              value={settings.logReminderEnabled}
              onValueChange={(value) => requestAndToggle('logReminderEnabled', value)}
              trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
              thumbColor="#FFFFFF"
            />
          </Row>
          {settings.logReminderEnabled ? (
            <TextField
              label="Time (24h)"
              value={settings.logReminderTime}
              onChangeText={(value) => updateSettings({ logReminderTime: value })}
              placeholder="20:00"
              maxLength={5}
            />
          ) : null}
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Contraception reminders" />
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="body" muted style={styles.flex}>
              Remind me at each method’s saved time.
            </AppText>
            <Switch
              value={settings.pillReminderEnabled}
              onValueChange={(value) => requestAndToggle('pillReminderEnabled', value)}
              trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
              thumbColor="#FFFFFF"
            />
          </Row>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Custom reminders" />
          {reminders.length === 0 ? (
            <AppText variant="body" muted>
              No custom reminders yet.
            </AppText>
          ) : (
            reminders.map((reminder) => (
              <Row key={reminder.id} style={styles.reminderRow}>
                <View style={[styles.icon, { backgroundColor: colors.primarySoft }]}>
                  <MaterialCommunityIcons name="bell-ring-outline" size={18} color={colors.primary} />
                </View>
                <View style={styles.flex}>
                  <AppText variant="bodyStrong">{reminder.label}</AppText>
                  <AppText variant="caption" muted>
                    {reminder.time}
                    {reminder.weekdays && reminder.weekdays.length > 0
                      ? ` · ${reminder.weekdays.map((d) => WEEKDAYS[d]).join(' ')}`
                      : ' · every day'}
                  </AppText>
                </View>
                <Switch
                  value={reminder.enabled}
                  onValueChange={(value) => patchReminder(reminder.id, { enabled: value })}
                  trackColor={{ true: colors.primary, false: colors.surfaceSunken }}
                  thumbColor="#FFFFFF"
                />
                <IconButton name="trash-can-outline" size={18} onPress={() => removeReminder(reminder.id)} />
              </Row>
            ))
          )}
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="New reminder" />
          <TextField label="Label" value={label} onChangeText={setLabel} placeholder="e.g. Take folic acid" />
          <TextField label="Time (24h)" value={time} onChangeText={setTime} placeholder="09:00" maxLength={5} />
          <View style={{ gap: 6 }}>
            <AppText variant="label" muted>
              Repeat on (leave empty for every day)
            </AppText>
            <Row gap={spacing.xs} style={styles.wrap}>
              {WEEKDAYS.map((day, index) => (
                <Chip
                  key={`${day}-${index}`}
                  label={day}
                  selected={days.includes(index)}
                  onPress={() =>
                    setDays((current) =>
                      current.includes(index) ? current.filter((d) => d !== index) : [...current, index],
                    )
                  }
                  compact
                />
              ))}
            </Row>
          </View>
          <Button title="Add reminder" icon="plus" fullWidth disabled={!label.trim()} onPress={submit} />
        </Card>

        <Card>
          <Row gap={spacing.md}>
            <MaterialCommunityIcons name="wifi-off" size={20} color={colors.textSecondary} />
            <AppText variant="caption" muted style={styles.flex}>
              Reminders are scheduled by your phone. No internet connection is needed and nothing is sent anywhere.
            </AppText>
          </Row>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.md, paddingBottom: spacing.xxxl },
  reminderRow: { gap: spacing.sm, paddingVertical: spacing.xs },
  icon: { width: 36, height: 36, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  wrap: { flexWrap: 'wrap' },
});
