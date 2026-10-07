import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { radius, spacing, useTheme } from '@/theme';

export function Stepper({
  value,
  onChange,
  min,
  max,
  suffix,
}: {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  suffix?: string;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.wrap, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      <Pressable
        onPress={() => onChange(Math.max(min, value - 1))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="minus" size={22} color={colors.primary} />
      </Pressable>
      <View style={styles.value}>
        <AppText variant="title">{value}</AppText>
        {suffix ? (
          <AppText variant="caption" muted>
            {suffix}
          </AppText>
        ) : null}
      </View>
      <Pressable
        onPress={() => onChange(Math.min(max, value + 1))}
        style={({ pressed }) => [styles.button, pressed && styles.pressed]}>
        <MaterialCommunityIcons name="plus" size={22} color={colors.primary} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.sm,
  },
  button: { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', borderRadius: radius.md },
  pressed: { opacity: 0.6 },
  value: { alignItems: 'center', minWidth: 80 },
});
