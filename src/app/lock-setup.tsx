import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/field';
import { AppText, Button, Card, IconButton, Row } from '@/components/ui';
import { hasBiometrics, setPin } from '@/lib/lock';
import { useAppStore } from '@/store/useAppStore';
import { radius, spacing, useTheme } from '@/theme';

export default function LockSetupScreen() {
  const { colors } = useTheme();
  const updateSettings = useAppStore((state) => state.updateSettings);
  const [pin, setPinValue] = useState('');
  const [confirm, setConfirm] = useState('');
  const [biometric, setBiometric] = useState(false);
  const [useBiometric, setUseBiometric] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    hasBiometrics().then(setBiometric);
  }, []);

  const valid = pin.length === 4 && pin === confirm;

  const save = async () => {
    if (!valid) return;
    setSaving(true);
    await setPin(pin);
    updateSettings({ lockEnabled: true, biometricUnlock: biometric && useBiometric });
    setSaving(false);
    router.back();
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          App lock
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <AppText variant="body" muted>
          Choose a 4-digit PIN. You’ll enter it each time you open Flopop.
        </AppText>

        <Card style={{ gap: spacing.md }}>
          <TextField
            label="PIN"
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
            helper={confirm.length === 4 && pin !== confirm ? "PINs don't match yet" : undefined}
          />
        </Card>

        {biometric ? (
          <Pressable
            onPress={() => setUseBiometric((current) => !current)}
            style={[styles.toggle, { backgroundColor: colors.surface, borderColor: colors.border }]}>
            <MaterialCommunityIcons name="fingerprint" size={24} color={colors.primary} />
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Unlock with fingerprint</AppText>
              <AppText variant="caption" muted>
                Faster than typing the PIN.
              </AppText>
            </View>
            <MaterialCommunityIcons
              name={useBiometric ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
              size={22}
              color={useBiometric ? colors.primary : colors.textMuted}
            />
          </Pressable>
        ) : null}

        <Button title="Turn on app lock" fullWidth disabled={!valid} loading={saving} onPress={save} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, gap: spacing.lg },
  toggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
});
