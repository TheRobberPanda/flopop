import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { StatCard } from '@/components/stat-card';
import { AppText, Card, EmptyState, ProgressBar, Row, SectionHeader } from '@/components/ui';
import { catalogIcon, catalogLabel } from '@/content/catalogs';
import { cycleLengths } from '@/domain/cycle';
import { useAllLogs, useCycleStats, useInsights } from '@/hooks/use-cycle';
import { useFocusRefresh } from '@/hooks/use-focus-refresh';
import { useAppStore } from '@/store/useAppStore';
import { cycle as cycleColors, radius, spacing, useTheme } from '@/theme';

function topCounts(values: string[], limit: number): { id: string; count: number }[] {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function InsightsScreen() {
  const { colors } = useTheme();
  useFocusRefresh();
  const stats = useCycleStats();
  const cycles = useAppStore((state) => state.cycles);
  const insights = useInsights();
  const logs = useAllLogs();
  const lengths = cycleLengths(cycles);
  const recentLengths = lengths.slice(-8);
  const maxLength = Math.max(35, ...recentLengths);

  const symptomCounts = topCounts(logs.flatMap((log) => log.symptoms), 6);
  const moodCounts = topCounts(logs.flatMap((log) => log.moods), 6);
  const maxSymptom = symptomCounts[0]?.count ?? 1;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Insights</AppText>
        <AppText variant="body" muted>
          Patterns Flopop has noticed in your logs.
        </AppText>

        <Row gap={spacing.sm} style={styles.statsRow}>
          <StatCard icon="calendar-sync" value={`${stats.avgCycleLength}d`} label="Avg cycle" />
          <StatCard icon="water" value={`${stats.avgPeriodLength}d`} label="Avg period" color={cycleColors.period} />
          <StatCard
            icon="chart-timeline-variant"
            value={stats.isRegular ? 'Regular' : 'Variable'}
            label="Regularity"
            color={stats.isRegular ? colors.success : colors.warning}
          />
        </Row>

        <Card>
          <SectionHeader title="Cycle length history" />
          {recentLengths.length >= 2 ? (
            <>
              <View style={styles.chart}>
                {recentLengths.map((length, index) => (
                  <View key={`${length}-${index}`} style={styles.barWrap}>
                    <AppText variant="tiny" muted>
                      {length}
                    </AppText>
                    <View
                      style={[
                        styles.bar,
                        {
                          height: Math.max(8, (length / maxLength) * 120),
                          backgroundColor: index === recentLengths.length - 1 ? colors.primary : colors.primarySoft,
                        },
                      ]}
                    />
                  </View>
                ))}
              </View>
              <AppText variant="caption" muted>
                Ranging from {stats.shortest} to {stats.longest} days. A difference of up to 7–9 days between cycles is
                common.
              </AppText>
            </>
          ) : (
            <AppText variant="body" muted>
              Log at least two periods and your cycle history will appear here.
            </AppText>
          )}
        </Card>

        {insights.length > 0 ? (
          <View style={{ gap: spacing.sm }}>
            <SectionHeader title="What we noticed" />
            {insights.map((insight) => (
              <Card key={insight.id}>
                <Row gap={spacing.md}>
                  <View
                    style={[
                      styles.insightIcon,
                      {
                        backgroundColor:
                          insight.tone === 'good'
                            ? colors.success + '22'
                            : insight.tone === 'watch'
                              ? colors.warning + '22'
                              : colors.primarySoft,
                      },
                    ]}>
                    <MaterialCommunityIcons
                      name={
                        insight.tone === 'good'
                          ? 'check-circle-outline'
                          : insight.tone === 'watch'
                            ? 'alert-circle-outline'
                            : 'lightbulb-on-outline'
                      }
                      size={20}
                      color={
                        insight.tone === 'good' ? colors.success : insight.tone === 'watch' ? colors.warning : colors.primary
                      }
                    />
                  </View>
                  <View style={styles.flex}>
                    <AppText variant="bodyStrong">{insight.title}</AppText>
                    <AppText variant="caption" muted>
                      {insight.body}
                    </AppText>
                  </View>
                </Row>
              </Card>
            ))}
          </View>
        ) : (
          <EmptyState
            icon="chart-donut"
            title="Not enough data yet"
            body="Log your flow and symptoms for a few days and insights will start to appear here."
          />
        )}

        {symptomCounts.length > 0 ? (
          <Card>
            <SectionHeader title="Most logged symptoms" />
            <View style={{ gap: spacing.sm }}>
              {symptomCounts.map((item) => (
                <View key={item.id} style={styles.freqRow}>
                  <MaterialCommunityIcons name={catalogIcon(item.id) as never} size={18} color={cycleColors.period} />
                  <AppText variant="label" style={styles.freqLabel}>
                    {catalogLabel(item.id)}
                  </AppText>
                  <View style={styles.freqBar}>
                    <ProgressBar value={item.count / maxSymptom} color={cycleColors.period} height={6} />
                  </View>
                  <AppText variant="caption" muted>
                    {item.count}
                  </AppText>
                </View>
              ))}
            </View>
          </Card>
        ) : null}

        {moodCounts.length > 0 ? (
          <Card>
            <SectionHeader title="Most logged moods" />
            <Row gap={spacing.sm} style={styles.wrapRow}>
              {moodCounts.map((item) => (
                <View key={item.id} style={[styles.moodPill, { backgroundColor: cycleColors.luteal + '22' }]}>
                  <MaterialCommunityIcons name={catalogIcon(item.id) as never} size={16} color={cycleColors.luteal} />
                  <AppText variant="caption" color={cycleColors.luteal}>
                    {catalogLabel(item.id)} · {item.count}
                  </AppText>
                </View>
              ))}
            </Row>
          </Card>
        ) : null}

        <Card onPress={() => router.push('/articles' as Href)}>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={styles.flex}>
              <AppText variant="bodyStrong">Health library</AppText>
              <AppText variant="caption" muted>
                Short reads on cycles, PMS, fertility and more.
              </AppText>
            </View>
            <MaterialCommunityIcons name="chevron-right" size={22} color={colors.textMuted} />
          </Row>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.lg },
  statsRow: { alignItems: 'stretch' },
  chart: { flexDirection: 'row', alignItems: 'flex-end', gap: spacing.sm, height: 150, marginBottom: spacing.md },
  barWrap: { flex: 1, alignItems: 'center', gap: 4 },
  bar: { width: '100%', borderRadius: radius.sm, maxWidth: 32 },
  flex: { flex: 1, gap: 2 },
  insightIcon: { width: 40, height: 40, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  freqRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  freqLabel: { width: 110 },
  freqBar: { flex: 1 },
  wrapRow: { flexWrap: 'wrap' },
  moodPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    paddingVertical: 8,
    borderRadius: radius.pill,
  },
});
