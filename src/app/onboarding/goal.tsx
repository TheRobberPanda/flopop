import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';

import { OnboardingStep } from '@/components/onboarding-step';
import { AppText, Button } from '@/components/ui';
import type { Profile } from '@/db/repositories/profile';
import { useOnboarding } from '@/store/useOnboarding';
import { radius, spacing, useTheme } from '@/theme';

const GOALS: {
  value: Profile['goal'];
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  title: string;
  description: string;
}[] = [
  {
    value: 'track',
    icon: 'calendar-heart',
    title: 'Track my cycle',
    description: 'Predict periods, ovulation, fertile days and symptoms.',
  },
  {
    value: 'conceive',
    icon: 'baby-face-outline',
    title: 'Trying to conceive',
    description: 'Put fertile days and ovulation front and centre.',
  },
  {
    value: 'pregnancy',
    icon: 'human-pregnant',
    title: "I'm pregnant",
    description: 'Switch to week-by-week pregnancy tracking.',
  },
  {
    value: 'contraception',
    icon: 'pill',
    title: 'Contraception',
    description: 'Birth control reminders and adherence tracking.',
  },
];

export default function GoalStep() {
  const { colors } = useTheme();
  const draft = useOnboarding();

  return (
    <OnboardingStep
      step={3}
      total={4}
      title="What brings you here?"
      subtitle="This shapes your home screen. You can change it whenever you like."
      onBack={() => router.back()}
      footer={
        <Button title="Continue" fullWidth onPress={() => router.push('/onboarding/lock' as Href)} />
      }>
      <View style={styles.list}>
        {GOALS.map((goal) => {
          const active = draft.goal === goal.value;
          return (
            <Pressable
              key={goal.value}
              onPress={() => draft.set({ goal: goal.value })}
              style={[
                styles.card,
                {
                  backgroundColor: active ? colors.primarySoft : colors.surface,
                  borderColor: active ? colors.primary : colors.border,
                  borderWidth: active ? 2 : 1,
                },
              ]}>
              <View style={[styles.icon, { backgroundColor: active ? colors.primary : colors.surfaceSunken }]}>
                <MaterialCommunityIcons
                  name={goal.icon}
                  size={22}
                  color={active ? '#FFFFFF' : colors.textSecondary}
                />
              </View>
              <View style={styles.text}>
                <AppText variant="bodyStrong">{goal.title}</AppText>
                <AppText variant="caption" muted>
                  {goal.description}
                </AppText>
              </View>
              {active ? (
                <MaterialCommunityIcons name="check-circle" size={22} color={colors.primary} />
              ) : null}
            </Pressable>
          );
        })}
      </View>
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  list: { gap: spacing.sm },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
  },
  icon: { width: 44, height: 44, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
});
