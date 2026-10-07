import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { DateField } from '@/components/date-field';
import { OnboardingStep } from '@/components/onboarding-step';
import { Stepper } from '@/components/stepper';
import { AppText, Button, Card } from '@/components/ui';
import { addDaysISO, today } from '@/lib/dates';
import { useOnboarding } from '@/store/useOnboarding';
import { spacing } from '@/theme';

export default function CycleStep() {
  const draft = useOnboarding();

  const setLastPeriod = (start: string) => {
    draft.set({ lastPeriodStart: start, lastPeriodEnd: addDaysISO(start, draft.avgPeriodLength - 1) });
  };

  const onPeriodLengthChange = (length: number) => {
    draft.set({
      avgPeriodLength: length,
      lastPeriodEnd: draft.lastPeriodStart
        ? addDaysISO(draft.lastPeriodStart, length - 1)
        : draft.lastPeriodEnd,
    });
  };

  return (
    <OnboardingStep
      step={2}
      total={4}
      title="Your cycle"
      subtitle="Not sure about exact dates? A good guess is fine — Flopop learns as you log."
      onBack={() => router.back()}
      footer={
        <Button
          title="Continue"
          fullWidth
          onPress={() => router.push('/onboarding/goal' as Href)}
        />
      }>
      <DateField
        label="First day of your last period"
        value={draft.lastPeriodStart}
        onChange={setLastPeriod}
        maximumDate={new Date()}
        placeholder="Tap to choose"
      />

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <AppText variant="bodyStrong">Cycle length</AppText>
            <AppText variant="caption" muted>
              Days from one period to the next. Average is 28.
            </AppText>
          </View>
        </View>
        <Stepper
          value={draft.avgCycleLength}
          onChange={(value) => draft.set({ avgCycleLength: value })}
          min={18}
          max={45}
          suffix="days"
        />
      </Card>

      <Card>
        <View style={styles.row}>
          <View style={styles.rowText}>
            <AppText variant="bodyStrong">Period length</AppText>
            <AppText variant="caption" muted>
              How many days your period usually lasts.
            </AppText>
          </View>
        </View>
        <Stepper value={draft.avgPeriodLength} onChange={onPeriodLengthChange} min={2} max={10} suffix="days" />
      </Card>

      <AppText variant="caption" muted>
        Today is {today()}. You can edit all of this later in Settings.
      </AppText>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  rowText: { flex: 1, gap: 2 },
});
