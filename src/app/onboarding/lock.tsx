import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { TextField } from '@/components/field';
import { OnboardingStep } from '@/components/onboarding-step';
import { AppText, Button } from '@/components/ui';
import { hasBiometrics, setPin } from '@/lib/lock';
import { useAppStore } from '@/store/useAppStore';
import { useOnboarding } from '@/store/useOnboarding';
import { radius, spacing, useTheme } from '@/theme';

export default function LockStep() {
  const { colors } = useTheme();
  const draft = useOnboarding();
  const completeOnboarding = useAppStore((state) => state.completeOnboarding);
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [biometric, setBiometric] = useState(false);
  const [useBiometric, setUseBiometric] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hasBiometrics().then(setBiometric);
  }, []);

  const pinValid = pin.length === 4 && pin === confirm;

  const finish = async (withLock: boolean) => {
    setSaving(true);
    completeOnboarding({
      name: draft.name.trim(),
      dob: draft.dob,
      goal: draft.goal,
      units: draft.units,
      avgCycleLength: draft.avgCycleLength,
      avgPeriodLength: draft.avgPeriodLength,
      lastPeriodStart: draft.lastPeriodStart,
      lastPeriodEnd: draft.lastPeriodEnd,
    });
    if (withLock && pinValid) {
      await setPin(pin);
      updateSettings({ lockEnabled: true, biometricUnlock: biometric && useBiometric });
    }
    draft.reset();
    setSaving(false);
    router.replace('/(tabs)' as Href);
  };

  return (
    <OnboardingStep
      step={4}
      total={4}
      title="Protect your data"
      subtitle="Flopop is a private space. Add a 4-digit PIN to keep it that way."
      onBack={() => router.back()}
      footer={
        <>
          <Button
            title={pinValid ? 'Set PIN & finish' : 'Continue without a PIN'}
            fullWidth
            loading={saving}
            onPress={() => finish(pinValid)}
          />
          {pinValid ? (
            <Button title="Skip protection" variant="ghost" fullWidth onPress={() => finish(false)} />
          ) : null}
        </>
      }>
      <TextField
        label="Choose a 4-digit PIN"
        value={pin}
        onChangeText={(value) => setPinValue(value.replace(/[^0-9]/g, '').slice(0, 4))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        placeholder="••••"
      />
      <TextField
        label="Confirm PIN"
        value={confirm}
        onChangeText={(value) => setConfirm(value.replace(/[^0-9]/g, '').slice(0, 4))}
        keyboardType="number-pad"
        secureTextEntry
        maxLength={4}
        placeholder="••••"
        helper={confirm.length === 4 && !pinValid ? "PINs don't match yet" : undefined}
      />

      {biometric ? (
        <Pressable
          onPress={() => setUseBiometric((current) => !current)}
          style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          <MaterialCommunityIcons name="fingerprint" size={24} color={colors.primary} />
          <View style={styles.toggleText}>
            <AppText variant="bodyStrong">Unlock with fingerprint</AppText>
            <AppText variant="caption" muted>
              Use your fingerprint on supported devices.
            </AppText>
          </View>
          <MaterialCommunityIcons
            name={useBiometric ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
            size={22}
            color={useBiometric ? colors.primary : colors.textMuted}
          />
        </Pressable>
      ) : null}
    </OnboardingStep>
  );
}

const styles = StyleSheet.create({
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  toggleText: { flex: 1, gap: 2 },
});
