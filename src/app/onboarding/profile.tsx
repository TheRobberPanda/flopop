import { router, type Href } from 'expo-router';
import { View } from 'react-native';

import { TextField, Segmented } from '@/components/field';
import { DateField } from '@/components/date-field';
import { OnboardingStep } from '@/components/onboarding-step';
import { Button } from '@/components/ui';
import { useOnboarding } from '@/store/useOnboarding';

export default function ProfileStep() {
  const draft = useOnboarding();
  const canContinue = draft.name.trim().length > 0;

  return (
    <OnboardingStep
      step={1}
      total={4}
      title="Let's get to know you"
      subtitle="We use this to personalise your predictions. You can change it anytime."
      onBack={() => router.back()}
      footer={
        <Button
          title="Continue"
          fullWidth
          disabled={!canContinue}
          onPress={() => router.push('/onboarding/cycle' as Href)}
        />
      }>
      <TextField
        label="Your name"
        value={draft.name}
        onChangeText={(name) => draft.set({ name })}
        placeholder="e.g. Sofia"
      />
      <DateField
        label="Date of birth"
        value={draft.dob}
        onChange={(dob) => draft.set({ dob })}
        maximumDate={new Date()}
        placeholder="Add your birthday"
      />
      <View style={{ gap: 6 }}>
        <Segmented
          options={[
            { value: 'metric', label: 'Metric (kg, cm)' },
            { value: 'imperial', label: 'Imperial (lb, in)' },
          ]}
          value={draft.units}
          onChange={(units) => draft.set({ units })}
        />
      </View>
    </OnboardingStep>
  );
}
