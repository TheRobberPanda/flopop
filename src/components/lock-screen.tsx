import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { authenticateBiometric, hasBiometrics, verifyPin } from '@/lib/lock';
import { useAppStore } from '@/store/useAppStore';
import { brand, radius, spacing, useTheme } from '@/theme';

const PIN_LENGTH = 4;

export function LockScreen() {
  const { colors } = useTheme();
  const unlock = useAppStore((state) => state.unlock);
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);
  const [biometric, setBiometric] = useState(false);

  const tryBiometric = async () => {
    const ok = await authenticateBiometric();
    if (ok) unlock();
  };

  useEffect(() => {
    let active = true;
    (async () => {
      const available = await hasBiometrics();
      if (!active) return;
      setBiometric(available);
      if (available) {
        const ok = await authenticateBiometric();
        if (active && ok) unlock();
      }
    })();
    return () => {
      active = false;
    };
  }, [unlock]);

  const push = (digit: string) => {
    setError(false);
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    if (next.length === PIN_LENGTH) {
      void submit(next);
    }
  };

  const submit = async (value: string) => {
    const ok = await verifyPin(value);
    if (ok) {
      unlock();
    } else {
      setError(true);
      setPin('');
    }
  };

  return (
    <View style={[styles.screen, { backgroundColor: colors.background }]}>
      <View style={styles.top}>
        <View style={[styles.logo, { backgroundColor: colors.primary }]}>
          <MaterialCommunityIcons name="flower-tulip-outline" size={30} color="#FFFFFF" />
        </View>
        <AppText variant="title">Welcome back</AppText>
        <AppText variant="body" muted center>
          Enter your PIN to open Flopop
        </AppText>
        <View style={styles.dots}>
          {Array.from({ length: PIN_LENGTH }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index < pin.length ? colors.primary : 'transparent',
                  borderColor: error ? colors.danger : colors.border,
                },
              ]}
            />
          ))}
        </View>
        <AppText variant="caption" color={error ? colors.danger : 'transparent'}>
          Incorrect PIN, try again
        </AppText>
      </View>

      <View style={styles.keypad}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
          <Key key={digit} label={digit} onPress={() => push(digit)} />
        ))}
        {biometric ? (
          <Key icon="fingerprint" onPress={tryBiometric} />
        ) : (
          <View style={styles.key} />
        )}
        <Key label="0" onPress={() => push('0')} />
        <Key icon="backspace-outline" onPress={() => setPin((current) => current.slice(0, -1))} />
      </View>
    </View>
  );
}

function Key({ label, icon, onPress }: { label?: string; icon?: 'fingerprint' | 'backspace-outline'; onPress: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.key, pressed && styles.keyPressed]}>
      {label ? (
        <AppText variant="title">{label}</AppText>
      ) : icon ? (
        <MaterialCommunityIcons name={icon} size={26} color={colors.text} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, alignItems: 'center', justifyContent: 'space-between', paddingVertical: spacing.xxxl },
  top: { alignItems: 'center', gap: spacing.sm, paddingTop: spacing.xxxl },
  logo: {
    width: 64,
    height: 64,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  dots: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.xl },
  dot: { width: 16, height: 16, borderRadius: 8, borderWidth: 1.5 },
  keypad: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: 280,
    justifyContent: 'space-between',
    rowGap: spacing.md,
  },
  key: { width: 76, height: 76, alignItems: 'center', justifyContent: 'center', borderRadius: radius.pill },
  keyPressed: { backgroundColor: brand.blush },
});
