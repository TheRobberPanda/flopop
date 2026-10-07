import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { CycleRing } from '@/components/cycle-ring';
import { StatCard } from '@/components/stat-card';
import { AppText, Card, GradientCard, IconButton, Row, SectionHeader } from '@/components/ui';
import { catalogLabel } from '@/content/catalogs';
import { phaseDescription, phaseLabel } from '@/domain/cycle';
import { formatDayMonth, today } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { useCurrentCycle, useInsights, phaseColor } from '@/hooks/use-cycle';
import { useFocusRefresh } from '@/hooks/use-focus-refresh';
import { brand, cycle as cycleColors, radius, spacing, useTheme } from '@/theme';

function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function fertileRange(start: string, end: string): string {
  const startLabel = formatDayMonth(start);
  const endLabel = formatDayMonth(end);
  if (start.slice(0, 7) === end.slice(0, 7)) {
    return `${startLabel.split(' ')[0]}–${endLabel}`;
  }
  return `${startLabel} – ${endLabel}`;
}

export default function HomeScreen() {
  const { colors } = useTheme();
  const profile = useAppStore((state) => state.profile);
  const settings = useAppStore((state) => state.settings);
  const pregnancy = useAppStore((state) => state.pregnancy);
  const saveLog = useAppStore((state) => state.saveLog);
  const current = useCurrentCycle();
  const todayISO = today();
  useFocusRefresh();
  const todayLog = useAppStore((state) => state.todayLog);
  const insights = useInsights();

  const discreet = settings.discreetMode;
  const accent = phaseColor(current.phase);
  const name = profile?.name?.trim();

  const loggedChips = [
    ...(todayLog?.symptoms ?? []).slice(0, 3).map(catalogLabel),
    ...(todayLog?.moods ?? []).slice(0, 2).map(catalogLabel),
  ];
  const water = todayLog?.waterMl ?? 0;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Row style={styles.header}>
          <View style={styles.flex}>
            <AppText variant="caption" muted>
              {greeting()}
            </AppText>
            <AppText variant="title">{name ? `Hi, ${name}` : 'Hi there'}</AppText>
          </View>
          <IconButton name="calendar-heart" onPress={() => router.push('/(tabs)/calendar' as Href)} />
          <IconButton name="cog-outline" onPress={() => router.push('/(tabs)/settings' as Href)} />
        </Row>

        {pregnancy ? (
          <GradientCard colors={[brand.plum, brand.rose]}>
            <Row>
              <View style={styles.flex}>
                <AppText variant="label" color="#FFFFFFCC">
                  Pregnancy mode
                </AppText>
                <AppText variant="heading" color="#FFFFFF">
                  You’re expecting
                </AppText>
              </View>
              <IconButton
                name="arrow-right"
                color="#FFFFFF"
                background="#FFFFFF33"
                onPress={() => router.push('/pregnancy' as Href)}
              />
            </Row>
          </GradientCard>
        ) : null}

        <Card style={{ alignItems: 'center', gap: spacing.sm }}>
          <View style={[styles.phasePill, { backgroundColor: accent + '22' }]}>
            <View style={[styles.phaseDot, { backgroundColor: accent }]} />
            <AppText variant="label" color={accent}>
              {phaseLabel(current.phase)}
            </AppText>
          </View>
          <CycleRing
            cycleDay={current.cycleDay}
            cycleLength={current.cycleLength}
            color={accent}
            caption={discreet ? '••' : `Day ${current.cycleDay}`}
            subcaption={discreet ? 'Cycle day hidden' : `of ${current.cycleLength} day cycle`}
          />
          <AppText variant="bodyStrong" center>
            {current.isOnPeriod
              ? 'Your period is here'
              : discreet
                ? 'Next period soon'
                : `Period in ${Math.max(0, current.daysUntilNextPeriod)} day${current.daysUntilNextPeriod === 1 ? '' : 's'}`}
          </AppText>
          <AppText variant="caption" muted center>
            {phaseDescription(current.phase)}
          </AppText>
        </Card>

        <Row style={styles.statsRow} gap={spacing.sm}>
          <StatCard
            icon="calendar-heart"
            color={cycleColors.period}
            value={discreet ? '••' : formatDayMonth(current.nextPeriodStart)}
            label="Next period"
          />
          <StatCard
            icon="egg-easter"
            color={cycleColors.ovulation}
            value={discreet ? '••' : formatDayMonth(current.ovulationDate)}
            label="Ovulation"
          />
          <StatCard
            icon="sprout"
            color={cycleColors.fertile}
            value={discreet ? '••' : fertileRange(current.fertileStart, current.fertileEnd)}
            label="Fertile window"
          />
        </Row>

        <View style={{ gap: spacing.sm }}>
          <SectionHeader title="Today" action="Open log" onAction={() => router.push(`/log/${todayISO}` as Href)} />
          <Card onPress={() => router.push(`/log/${todayISO}` as Href)}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={styles.flex}>
                <AppText variant="bodyStrong">
                  {todayLog && loggedChips.length > 0 ? 'Logged today' : 'How are you feeling today?'}
                </AppText>
                <AppText variant="caption" muted>
                  {todayLog && loggedChips.length > 0
                    ? loggedChips.join(' · ')
                    : 'Tap to add flow, mood, symptoms and more.'}
                </AppText>
              </View>
              <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
            </Row>
            <Row style={styles.quickRow} gap={spacing.sm}>
              <QuickAction
                icon="water"
                label={`${water} ml`}
                onPress={() => saveLog(todayISO, { waterMl: water + 250 })}
                tint="#3F9BE0"
              />
              <QuickAction
                icon="emoticon-happy-outline"
                label="Mood"
                tint={cycleColors.luteal}
                onPress={() => router.push(`/log/${todayISO}` as Href)}
              />
              <QuickAction
                icon="flash"
                label="Symptoms"
                tint={cycleColors.period}
                onPress={() => router.push(`/log/${todayISO}` as Href)}
              />
            </Row>
          </Card>
        </View>

        {insights.length > 0 ? (
          <Card onPress={() => router.push('/(tabs)/insights' as Href)}>
            <Row style={{ gap: spacing.md }}>
              <View style={[styles.insightIcon, { backgroundColor: colors.primarySoft }]}>
                <MaterialCommunityIcons name="lightbulb-on-outline" size={20} color={colors.primary} />
              </View>
              <View style={styles.flex}>
                <AppText variant="caption" muted>
                  Daily insight
                </AppText>
                <AppText variant="bodyStrong">{insights[0].title}</AppText>
                <AppText variant="caption" muted numberOfLines={2}>
                  {insights[0].body}
                </AppText>
              </View>
            </Row>
          </Card>
        ) : null}

        <Card onPress={() => router.push('/predictions' as Href)}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Upcoming cycles</AppText>
              <AppText variant="caption" muted>
                See the next six predicted periods, ovulation and fertile days.
              </AppText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
          </Row>
        </Card>

        <Card onPress={() => router.push('/report' as Href)}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Health report</AppText>
              <AppText variant="caption" muted>
                A clear summary of your cycle and symptoms.
              </AppText>
            </View>
            <MaterialCommunityIcons name="file-chart-outline" size={22} color={colors.textMuted} />
          </Row>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function QuickAction({
  icon,
  label,
  onPress,
  tint,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  onPress: () => void;
  tint: string;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.quick, { backgroundColor: tint + '18' }, pressed && styles.quickPressed]}>
      <MaterialCommunityIcons name={icon} size={20} color={tint} />
      <AppText variant="caption" color={tint}>
        {label}
      </AppText>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  header: { gap: spacing.sm, marginTop: spacing.sm },
  flex: { flex: 1, gap: 2 },
  phasePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  phaseDot: { width: 8, height: 8, borderRadius: 4 },
  statsRow: { alignItems: 'stretch' },
  quickRow: { marginTop: spacing.md },
  quick: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingVertical: spacing.sm,
    borderRadius: radius.md,
  },
  quickPressed: { opacity: 0.7 },
  insightIcon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
});
