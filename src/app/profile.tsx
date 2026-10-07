import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { Segmented, TextField } from '@/components/field';
import { Stepper } from '@/components/stepper';
import { AppText, Button, Card, IconButton, Row } from '@/components/ui';
import type { Profile } from '@/db/repositories/profile';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

const GOALS: { value: Profile['goal']; label: string; icon: keyof typeof MaterialCommunityIcons.glyphMap }[] = [
  { value: 'track', label: 'Track my cycle', icon: 'calendar-heart' },
  { value: 'conceive', label: 'Trying to conceive', icon: 'baby-face-outline' },
  { value: 'pregnancy', label: 'Pregnancy', icon: 'human-pregnant' },
  { value: 'contraception', label: 'Contraception', icon: 'pill' },
];

export default function ProfileScreen() {
  const { colors } = useTheme();
  const profile = useAppStore((state) => state.profile);
  const saveProfile = useAppStore((state) => state.saveProfile);
  const updateSettings = useAppStore((state) => state.updateSettings);

  const [name, setName] = useState(profile?.name ?? '');
  const [dob, setDob] = useState<string | null>(profile?.dob ?? null);
  const [units, setUnits] = useState<Profile['units']>(profile?.units ?? 'metric');
  const [goal, setGoal] = useState<Profile['goal']>(profile?.goal ?? 'track');
  const [cycle, setCycle] = useState(profile?.avgCycleLength ?? 28);
  const [period, setPeriod] = useState(profile?.avgPeriodLength ?? 5);
  const [luteal, setLuteal] = useState(profile?.lutealLength ?? 14);

  const save = () => {
    saveProfile({
      name: name.trim(),
      dob,
      units,
      goal,
      avgCycleLength: cycle,
      avgPeriodLength: period,
      lutealLength: luteal,
    });
    updateSettings({ units });
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Your profile
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Card style={{ gap: spacing.md }}>
          <TextField label="Name" value={name} onChangeText={setName} placeholder="Your name" />
          <DateField label="Date of birth" value={dob} onChange={setDob} maximumDate={new Date()} />
          <View style={{ gap: 6 }}>
            <AppText variant="label" muted>
              Units
            </AppText>
            <Segmented
              options={[
                { value: 'metric', label: 'Metric (kg, cm)' },
                { value: 'imperial', label: 'Imperial (lb, in)' },
              ]}
              value={units}
              onChange={setUnits}
            />
          </View>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <AppText variant="heading">What brings you here?</AppText>
          {GOALS.map((item) => {
            const active = goal === item.value;
            return (
              <Pressable
                key={item.value}
                onPress={() => setGoal(item.value)}
                style={[
                  styles.goal,
                  {
                    backgroundColor: active ? colors.primarySoft : colors.surfaceAlt,
                    borderColor: active ? colors.primary : 'transparent',
                  },
                ]}>
                <MaterialCommunityIcons name={item.icon} size={20} color={active ? colors.primary : colors.textSecondary} />
                <AppText variant="bodyStrong" style={styles.flex}>
                  {item.label}
                </AppText>
                {active ? <MaterialCommunityIcons name="check-circle" size={20} color={colors.primary} /> : null}
              </Pressable>
            );
          })}
        </Card>

        <Card style={{ gap: spacing.md }}>
          <View>
            <AppText variant="heading">Cycle defaults</AppText>
            <AppText variant="caption" muted>
              Used until Flopop has enough logged cycles to learn your pattern.
            </AppText>
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="label" muted>
              Average cycle length
            </AppText>
            <Stepper value={cycle} onChange={setCycle} min={18} max={45} suffix="days" />
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="label" muted>
              Average period length
            </AppText>
            <Stepper value={period} onChange={setPeriod} min={2} max={10} suffix="days" />
          </View>
          <View style={{ gap: 6 }}>
            <AppText variant="label" muted>
              Luteal phase length
            </AppText>
            <Stepper value={luteal} onChange={setLuteal} min={9} max={17} suffix="days" />
            <AppText variant="caption" muted>
              Days between ovulation and your period, usually 12–14.
            </AppText>
          </View>
        </Card>

        <Button title="Save changes" fullWidth onPress={save} />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  goal: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
});
