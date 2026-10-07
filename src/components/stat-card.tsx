import { StyleSheet, Pressable, View } from 'react-native';

import { AppText, type IconName } from '@/components/ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { radius, shadow, spacing, useTheme } from '@/theme';

export function StatCard({
  icon,
  value,
  label,
  color,
  onPress,
}: {
  icon: IconName;
  value: string;
  label: string;
  color?: string;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.stat,
        { backgroundColor: colors.surface, borderColor: colors.border },
        pressed && onPress && styles.pressed,
      ]}>
      <View style={[styles.statIcon, { backgroundColor: (color ?? colors.primary) + '22' }]}>
        <MaterialCommunityIcons name={icon} size={18} color={color ?? colors.primary} />
      </View>
      <AppText variant="heading">{value}</AppText>
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  stat: {
    flex: 1,
    minWidth: 100,
    borderRadius: radius.lg,
    borderWidth: 1,
    padding: spacing.md,
    gap: 4,
    ...shadow.soft,
  },
  statIcon: { width: 32, height: 32, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.85 },
});
