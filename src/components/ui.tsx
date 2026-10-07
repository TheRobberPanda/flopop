import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import type { ComponentProps, ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { brand, fonts, radius, shadow, spacing, useTheme } from '@/theme';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

type TextVariant = 'display' | 'title' | 'heading' | 'body' | 'bodyStrong' | 'label' | 'caption' | 'tiny';

const VARIANTS: Record<TextVariant, TextStyle> = {
  display: { fontFamily: fonts.extraBold, fontSize: 34, lineHeight: 40 },
  title: { fontFamily: fonts.bold, fontSize: 26, lineHeight: 32 },
  heading: { fontFamily: fonts.bold, fontSize: 19, lineHeight: 25 },
  body: { fontFamily: fonts.regular, fontSize: 15.5, lineHeight: 22 },
  bodyStrong: { fontFamily: fonts.semiBold, fontSize: 15.5, lineHeight: 22 },
  label: { fontFamily: fonts.semiBold, fontSize: 13.5, lineHeight: 18 },
  caption: { fontFamily: fonts.medium, fontSize: 12.5, lineHeight: 17 },
  tiny: { fontFamily: fonts.semiBold, fontSize: 11, lineHeight: 15, letterSpacing: 0.4 },
};

export interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: string;
  muted?: boolean;
  center?: boolean;
  children?: ReactNode;
}

export function AppText({ variant = 'body', color, muted, center, style, children, ...rest }: AppTextProps) {
  const { colors } = useTheme();
  return (
    <Text
      {...rest}
      style={[
        VARIANTS[variant],
        { color: color ?? (muted ? colors.textSecondary : colors.text) },
        center && styles.center,
        style,
      ]}>
      {children}
    </Text>
  );
}

export function Screen({
  children,
  style,
  background,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  background?: string;
}) {
  const { colors } = useTheme();
  return <View style={[styles.screen, { backgroundColor: background ?? colors.background }, style]}>{children}</View>;
}

export function Card({
  children,
  style,
  padded = true,
  onPress,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padded?: boolean;
  onPress?: () => void;
}) {
  const { colors } = useTheme();
  const content = (
    <View
      style={[
        styles.card,
        { backgroundColor: colors.surface, borderColor: colors.border },
        padded && styles.cardPadded,
        style,
      ]}>
      {children}
    </View>
  );
  if (onPress) {
    return (
      <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }
  return content;
}

export function GradientCard({
  children,
  style,
  colors: gradientColors,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  colors?: readonly [string, string, ...string[]];
}) {
  return (
    <LinearGradient
      colors={gradientColors ?? [brand.rose, brand.peachDeep]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={[styles.gradientCard, style]}>
      {children}
    </LinearGradient>
  );
}

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Button({
  title,
  onPress,
  variant = 'primary',
  icon,
  disabled,
  loading,
  fullWidth,
  style,
}: {
  title: string;
  onPress?: () => void;
  variant?: ButtonVariant;
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  const palette: Record<ButtonVariant, { bg: string; fg: string; border?: string }> = {
    primary: { bg: colors.primary, fg: colors.onPrimary },
    secondary: { bg: colors.surfaceAlt, fg: colors.text, border: colors.border },
    ghost: { bg: 'transparent', fg: colors.primary },
    danger: { bg: colors.danger, fg: '#FFFFFF' },
  };
  const tone = palette[variant];
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={isDisabled ? undefined : onPress}
      style={({ pressed }) => [
        styles.button,
        {
          backgroundColor: tone.bg,
          borderColor: tone.border ?? 'transparent',
          borderWidth: tone.border ? 1 : 0,
          opacity: isDisabled ? 0.5 : 1,
        },
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={tone.fg} />
      ) : (
        <>
          {icon ? <MaterialCommunityIcons name={icon} size={18} color={tone.fg} /> : null}
          <AppText variant="bodyStrong" color={tone.fg}>
            {title}
          </AppText>
        </>
      )}
    </Pressable>
  );
}

export function IconButton({
  name,
  onPress,
  size = 20,
  color,
  background,
  style,
}: {
  name: IconName;
  onPress?: () => void;
  size?: number;
  color?: string;
  background?: string;
  style?: StyleProp<ViewStyle>;
}) {
  const { colors } = useTheme();
  return (
    <Pressable
      onPress={onPress}
      hitSlop={8}
      style={({ pressed }) => [
        styles.iconButton,
        { backgroundColor: background ?? colors.surfaceAlt },
        pressed && styles.pressed,
        style,
      ]}>
      <MaterialCommunityIcons name={name} size={size} color={color ?? colors.text} />
    </Pressable>
  );
}

export function Chip({
  label,
  icon,
  selected,
  onPress,
  color,
  compact,
}: {
  label: string;
  icon?: IconName;
  selected?: boolean;
  onPress?: () => void;
  color?: string;
  compact?: boolean;
}) {
  const { colors } = useTheme();
  const active = selected ?? false;
  const accent = color ?? colors.primary;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        compact && styles.chipCompact,
        {
          backgroundColor: active ? accent : colors.surface,
          borderColor: active ? accent : colors.border,
        },
        pressed && styles.pressed,
      ]}>
      {icon ? (
        <MaterialCommunityIcons name={icon} size={compact ? 14 : 16} color={active ? '#FFFFFF' : colors.textSecondary} />
      ) : null}
      <AppText variant={compact ? 'caption' : 'label'} color={active ? '#FFFFFF' : colors.text}>
        {label}
      </AppText>
    </Pressable>
  );
}

export function Divider({ style }: { style?: StyleProp<ViewStyle> }) {
  const { colors } = useTheme();
  return <View style={[{ height: 1, backgroundColor: colors.border }, style]} />;
}

export function ProgressBar({
  value,
  color,
  height = 8,
}: {
  value: number;
  color?: string;
  height?: number;
}) {
  const { colors } = useTheme();
  const clamped = Math.max(0, Math.min(1, value));
  return (
    <View style={[styles.progressTrack, { backgroundColor: colors.surfaceSunken, height, borderRadius: height / 2 }]}>
      <View
        style={{
          width: `${clamped * 100}%`,
          height,
          borderRadius: height / 2,
          backgroundColor: color ?? colors.primary,
        }}
      />
    </View>
  );
}

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <View style={styles.sectionHeader}>
      <AppText variant="heading">{title}</AppText>
      {action ? (
        <Pressable onPress={onAction} hitSlop={8}>
          <AppText variant="label" color={brand.rose}>
            {action}
          </AppText>
        </Pressable>
      ) : null}
    </View>
  );
}

export function EmptyState({
  icon = 'heart-outline',
  title,
  body,
  action,
}: {
  icon?: IconName;
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.empty}>
      <View style={[styles.emptyIcon, { backgroundColor: colors.primarySoft }]}>
        <MaterialCommunityIcons name={icon} size={26} color={colors.primary} />
      </View>
      <AppText variant="heading" center>
        {title}
      </AppText>
      {body ? (
        <AppText variant="body" muted center>
          {body}
        </AppText>
      ) : null}
      {action}
    </View>
  );
}

export function Row({
  children,
  style,
  gap = spacing.sm,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  gap?: number;
}) {
  return <View style={[styles.row, { gap }, style]}>{children}</View>;
}

const styles = StyleSheet.create({
  center: { textAlign: 'center' },
  screen: { flex: 1 },
  card: {
    borderRadius: radius.lg,
    borderWidth: 1,
    ...shadow.soft,
  },
  cardPadded: { padding: spacing.lg },
  gradientCard: {
    borderRadius: radius.xl,
    padding: spacing.lg,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: 14,
    paddingHorizontal: spacing.xl,
    borderRadius: radius.pill,
  },
  fullWidth: { alignSelf: 'stretch' },
  pressed: { opacity: 0.82, transform: [{ scale: 0.99 }] },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 9,
    paddingHorizontal: spacing.md,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  chipCompact: { paddingVertical: 6, paddingHorizontal: spacing.sm },
  progressTrack: { width: '100%', overflow: 'hidden' },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.sm,
  },
  empty: { alignItems: 'center', gap: spacing.sm, paddingVertical: spacing.xxl, paddingHorizontal: spacing.lg },
  emptyIcon: { width: 56, height: 56, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', alignItems: 'center' },
});
