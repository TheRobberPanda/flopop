import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { router, type Href } from 'expo-router';
import { StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button } from '@/components/ui';
import { brand, radius, spacing, useTheme } from '@/theme';

const POINTS = [
  { icon: 'calendar-heart' as const, text: 'Predict periods, ovulation and fertile days' },
  { icon: 'notebook-heart-outline' as const, text: 'Log symptoms, moods and flow in seconds' },
  { icon: 'shield-lock-outline' as const, text: 'Works fully offline — your data never leaves this phone' },
];

export default function Welcome() {
  const { colors } = useTheme();
  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.content}>
        <View style={styles.hero}>
          <LinearGradient
            colors={[brand.rose, brand.peachDeep]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logo}>
            <MaterialCommunityIcons name="flower-tulip-outline" size={46} color="#FFFFFF" />
          </LinearGradient>
          <AppText variant="display">Flopop</AppText>
          <AppText variant="body" muted center>
            Your cycle, your body, your data — private and offline.
          </AppText>
        </View>

        <View style={styles.points}>
          {POINTS.map((point) => (
            <View
              key={point.text}
              style={[styles.point, { backgroundColor: colors.surface, borderColor: colors.border }]}>
              <View style={[styles.pointIcon, { backgroundColor: colors.primarySoft }]}>
                <MaterialCommunityIcons name={point.icon} size={20} color={colors.primary} />
              </View>
              <AppText variant="body" style={styles.pointText}>
                {point.text}
              </AppText>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          title="Get started"
          icon="arrow-right"
          onPress={() => router.push('/onboarding/profile' as Href)}
          fullWidth
        />
        <AppText variant="caption" muted center>
          No account. No cloud. Everything stays on this phone.
        </AppText>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, paddingHorizontal: spacing.lg },
  content: { flex: 1, justifyContent: 'center', gap: spacing.xxl },
  hero: { alignItems: 'center', gap: spacing.sm },
  logo: {
    width: 96,
    height: 96,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  points: { gap: spacing.sm },
  point: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  pointIcon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  pointText: { flex: 1 },
  footer: { paddingBottom: spacing.lg, gap: spacing.sm },
});
