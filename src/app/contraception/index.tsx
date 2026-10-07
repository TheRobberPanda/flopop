import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { Segmented, TextField } from '@/components/field';
import { AppText, Button, Card, Chip, IconButton, Row, SectionHeader } from '@/components/ui';
import { adherence, isTaken } from '@/db/repositories/contraception';
import { addDaysISO, today } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

const METHODS = [
  { value: 'pill', label: 'Pill' },
  { value: 'patch', label: 'Patch' },
  { value: 'ring', label: 'Ring' },
  { value: 'injection', label: 'Injection' },
  { value: 'implant', label: 'Implant' },
  { value: 'iud', label: 'IUD' },
  { value: 'condom', label: 'Condom' },
  { value: 'other', label: 'Other' },
] as const;

export default function ContraceptionScreen() {
  const { colors } = useTheme();
  const contraceptives = useAppStore((state) => state.contraceptives);
  const addContraceptive = useAppStore((state) => state.addContraceptive);
  const removeContraceptive = useAppStore((state) => state.removeContraceptive);
  const setActive = useAppStore((state) => state.setContraceptiveActive);
  const toggleTaken = useAppStore((state) => state.toggleContraceptiveTaken);
  const revision = useAppStore((state) => state.revision);

  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [method, setMethod] = useState<(typeof METHODS)[number]['value']>('pill');
  const [schedule, setSchedule] = useState<'daily' | 'weekly' | 'custom'>('daily');
  const [dose, setDose] = useState('');
  const [startDate, setStartDate] = useState<string | null>(today());
  const [reminderTime, setReminderTime] = useState('21:00');

  const date = today();

  const submit = () => {
    if (!name.trim() || !startDate) return;
    addContraceptive({
      name: name.trim(),
      method,
      dose: dose.trim() || null,
      schedule,
      startDate,
      reminderTime: reminderTime.trim() || null,
    });
    setName('');
    setDose('');
    setShowForm(false);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Contraception
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false} key={revision}>
        {contraceptives.length === 0 && !showForm ? (
          <Card style={{ gap: spacing.sm, alignItems: 'center' }}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="pill" size={30} color={colors.primary} />
            </View>
            <AppText variant="heading" center>
              Track your method
            </AppText>
            <AppText variant="body" muted center>
              Add the contraception you use and Flopop will help you remember it and track how consistent you’ve been.
            </AppText>
          </Card>
        ) : null}

        {contraceptives.map((item) => {
          const takenToday = isTaken(item.id, date);
          const stats = adherence(item.id, addDaysISO(date, -30), date);
          const rate = stats.total > 0 ? stats.taken / stats.total : 0;
          return (
            <Card key={item.id} style={{ gap: spacing.md }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={styles.flex}>
                  <AppText variant="heading">{item.name}</AppText>
                  <AppText variant="caption" muted>
                    {METHODS.find((m) => m.value === item.method)?.label ?? item.method}
                    {item.dose ? ` · ${item.dose}` : ''} · {item.schedule}
                  </AppText>
                </View>
                <Chip
                  label={item.active ? 'Active' : 'Paused'}
                  color={item.active ? colors.success : colors.textMuted}
                  compact
                />
              </Row>

              <Row style={{ justifyContent: 'space-between' }}>
                <View>
                  <AppText variant="display">{Math.round(rate * 100)}%</AppText>
                  <AppText variant="caption" muted>
                    taken in 30 days ({stats.taken}/{stats.total})
                  </AppText>
                </View>
                <Pressable
                  onPress={() => toggleTaken(item.id, date, !takenToday)}
                  style={[
                    styles.takeButton,
                    {
                      backgroundColor: takenToday ? colors.primarySoft : colors.surfaceAlt,
                      borderColor: takenToday ? colors.primary : colors.border,
                    },
                  ]}>
                  <MaterialCommunityIcons
                    name={takenToday ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                    size={22}
                    color={takenToday ? colors.primary : colors.textMuted}
                  />
                  <AppText variant="label">Taken today</AppText>
                </Pressable>
              </Row>

              <Row gap={spacing.sm}>
                <Button
                  title={item.active ? 'Pause' : 'Resume'}
                  variant="secondary"
                  onPress={() => setActive(item.id, !item.active)}
                  style={styles.flex}
                />
                <Button title="Remove" variant="ghost" onPress={() => removeContraceptive(item.id)} />
              </Row>
            </Card>
          );
        })}

        {showForm ? (
          <Card style={{ gap: spacing.md }}>
            <SectionHeader title="New method" action="Cancel" onAction={() => setShowForm(false)} />
            <TextField label="Name" value={name} onChangeText={setName} placeholder="e.g. Combined pill" />
            <View style={{ gap: 6 }}>
              <AppText variant="label" muted>
                Method
              </AppText>
              <View style={styles.wrap}>
                {METHODS.map((option) => (
                  <Chip
                    key={option.value}
                    label={option.label}
                    selected={method === option.value}
                    onPress={() => setMethod(option.value)}
                    compact
                  />
                ))}
              </View>
            </View>
            <View style={{ gap: 6 }}>
              <AppText variant="label" muted>
                Schedule
              </AppText>
              <Segmented
                options={[
                  { value: 'daily', label: 'Daily' },
                  { value: 'weekly', label: 'Weekly' },
                  { value: 'custom', label: 'Custom' },
                ]}
                value={schedule}
                onChange={setSchedule}
              />
            </View>
            <TextField label="Dose (optional)" value={dose} onChangeText={setDose} placeholder="e.g. 1 tablet" />
            <DateField label="Start date" value={startDate} onChange={setStartDate} maximumDate={new Date()} />
            <TextField
              label="Reminder time (24h)"
              value={reminderTime}
              onChangeText={setReminderTime}
              placeholder="21:00"
              maxLength={5}
            />
            <Button title="Add method" fullWidth onPress={submit} disabled={!name.trim() || !startDate} />
          </Card>
        ) : (
          <Button title="Add a method" icon="plus" fullWidth onPress={() => setShowForm(true)} />
        )}

        <Card>
          <Row gap={spacing.md}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.textSecondary} />
            <AppText variant="caption" muted style={styles.flex}>
              Flopop helps you remember your method but does not replace medical advice. Contact a clinician if you miss
              doses or have side effects.
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
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  heroIcon: { width: 68, height: 68, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  takeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: 12,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
