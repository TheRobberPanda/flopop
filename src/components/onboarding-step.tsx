import type { ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, IconButton } from '@/components/ui';
import { spacing, useTheme } from '@/theme';

export function OnboardingStep({
  step,
  total,
  title,
  subtitle,
  children,
  footer,
  onBack,
}: {
  step: number;
  total: number;
  title: string;
  subtitle?: string;
  children?: ReactNode;
  footer: ReactNode;
  onBack?: () => void;
}) {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <View style={styles.header}>
        {onBack ? <IconButton name="arrow-left" onPress={onBack} /> : <View style={styles.spacer} />}
        <View style={styles.dots}>
          {Array.from({ length: total }).map((_, index) => (
            <View
              key={index}
              style={[
                styles.dot,
                {
                  backgroundColor: index <= step ? colors.primary : colors.surfaceSunken,
                  width: index === step ? 22 : 8,
                },
              ]}
            />
          ))}
        </View>
        <View style={styles.spacer} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled">
        <AppText variant="title">{title}</AppText>
        {subtitle ? (
          <AppText variant="body" muted>
            {subtitle}
          </AppText>
        ) : null}
        {children}
      </ScrollView>

      <View style={styles.footer}>{footer}</View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
  },
  dots: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { height: 8, borderRadius: 4 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xl, gap: spacing.md },
  footer: { padding: spacing.lg, gap: spacing.sm },
});
