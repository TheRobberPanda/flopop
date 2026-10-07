import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, Share, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Button, Card, Chip, Divider, IconButton, Row, SectionHeader } from '@/components/ui';
import { catalogLabel } from '@/content/catalogs';
import { cycleLengths } from '@/domain/cycle';
import { getLogsInRange } from '@/db/repositories/logs';
import { addDaysISO, daysBetween, formatMedium, today } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { cycle as cycleColors, spacing, useTheme } from '@/theme';

function topCounts(values: string[], limit: number) {
  const counts = new Map<string, number>();
  for (const value of values) counts.set(value, (counts.get(value) ?? 0) + 1);
  return [...counts.entries()]
    .map(([id, count]) => ({ id, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, limit);
}

export default function ReportScreen() {
  const { colors } = useTheme();
  const profile = useAppStore((state) => state.profile);
  const cycles = useAppStore((state) => state.cycles);
  const stats = useAppStore((state) => state.stats);
  const pregnancy = useAppStore((state) => state.pregnancy);

  const date = today();
  const recentLogs = getLogsInRange(addDaysISO(date, -29), date).slice().reverse();
  const lengths = cycleLengths(cycles);
  const symptomCounts = topCounts(recentLogs.flatMap((log) => log.symptoms), 8);
  const moodCounts = topCounts(recentLogs.flatMap((log) => log.moods), 5);

  const buildText = () => {
    const lines: string[] = [];
    lines.push('FLOPOP HEALTH SUMMARY');
    lines.push(`Generated ${formatMedium(date)}`);
    lines.push('');
    lines.push(`Name: ${profile?.name ?? '—'}`);
    lines.push(`Average cycle: ${stats.avgCycleLength} days`);
    lines.push(`Average period: ${stats.avgPeriodLength} days`);
    lines.push(`Cycles logged: ${stats.sampleSize}`);
    lines.push(`Regularity: ${stats.isRegular ? 'Regular' : 'Variable'} (±${stats.cycleLengthStdDev.toFixed(1)} days)`);
    if (pregnancy) lines.push(`Pregnancy: due ${pregnancy.dueDate}`);
    lines.push('');
    lines.push('RECENT CYCLES');
    cycles.slice(-6).forEach((cycle) => {
      const end = cycle.endDate ? formatMedium(cycle.endDate) : 'ongoing';
      const length = cycle.endDate ? `${daysBetween(cycle.startDate, cycle.endDate) + 1} day period` : '';
      lines.push(`- ${formatMedium(cycle.startDate)} → ${end} ${length}`);
    });
    lines.push('');
    lines.push('MOST LOGGED SYMPTOMS (30 days)');
    symptomCounts.forEach((item) => lines.push(`- ${catalogLabel(item.id)}: ${item.count}`));
    lines.push('');
    lines.push('MOST LOGGED MOODS (30 days)');
    moodCounts.forEach((item) => lines.push(`- ${catalogLabel(item.id)}: ${item.count}`));
    lines.push('');
    lines.push('This summary is not a medical diagnosis.');
    return lines.join('\n');
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Health report
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="body" muted>
          A readable summary of everything you’ve logged, generated on this phone. Nothing is uploaded anywhere.
        </AppText>

        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title="Summary" />
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={styles.flex}>
              <AppText variant="heading">{profile?.name?.trim() || 'Flopop user'}</AppText>
              <AppText variant="caption" muted>
                {profile?.goal === 'pregnancy' ? 'Pregnancy mode' : 'Cycle tracking'} · {formatMedium(date)}
              </AppText>
            </View>
            <View style={[styles.badge, { backgroundColor: colors.primarySoft }]}>
              <AppText variant="caption" color={colors.primary}>
                {formatMedium(date)}
              </AppText>
            </View>
          </Row>
          <Divider />
          <Row gap={spacing.sm} style={styles.wrap}>
            <Chip label={`Avg cycle ${stats.avgCycleLength}d`} compact />
            <Chip label={`Avg period ${stats.avgPeriodLength}d`} compact />
            <Chip label={`${stats.sampleSize} cycles`} compact />
            <Chip
              label={stats.isRegular ? 'Regular' : 'Variable'}
              color={stats.isRegular ? colors.success : colors.warning}
              compact
            />
            {pregnancy ? <Chip label={`Due ${pregnancy.dueDate}`} color={cycleColors.period} compact /> : null}
          </Row>
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title="Recent cycles" />
          {cycles.length === 0 ? (
            <AppText variant="body" muted>
              No cycles logged yet.
            </AppText>
          ) : (
            cycles
              .slice(-6)
              .reverse()
              .map((cycle) => (
                <Row key={cycle.id} style={styles.logRow}>
                  <View style={[styles.dot, { backgroundColor: cycleColors.period }]} />
                  <AppText variant="label" style={styles.flex}>
                    {formatMedium(cycle.startDate)}
                  </AppText>
                  <AppText variant="caption" muted>
                    {cycle.endDate
                      ? `${formatMedium(cycle.endDate)} · ${daysBetween(cycle.startDate, cycle.endDate) + 1}d`
                      : 'ongoing'}
                  </AppText>
                </Row>
              ))
          )}
          {lengths.length >= 2 ? (
            <AppText variant="caption" muted>
              Cycle lengths: {lengths.slice(-8).join(', ')} days
            </AppText>
          ) : null}
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title="Symptoms (last 30 days)" />
          {symptomCounts.length === 0 ? (
            <AppText variant="body" muted>
              Nothing logged yet.
            </AppText>
          ) : (
            symptomCounts.map((item) => (
              <Row key={item.id} style={styles.logRow}>
                <View style={[styles.dot, { backgroundColor: cycleColors.pms }]} />
                <AppText variant="label" style={styles.flex}>
                  {catalogLabel(item.id)}
                </AppText>
                <AppText variant="caption" muted>
                  {item.count}×
                </AppText>
              </Row>
            ))
          )}
        </Card>

        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title="Recent daily logs" />
          {recentLogs.length === 0 ? (
            <AppText variant="body" muted>
              No logs in the last 30 days.
            </AppText>
          ) : (
            recentLogs.slice(0, 12).map((log) => (
              <Row key={log.date} style={styles.logRow}>
                <AppText variant="label" style={styles.dateCol}>
                  {formatMedium(log.date).replace(/ \d{4}$/, '')}
                </AppText>
                <AppText variant="caption" muted style={styles.flex}>
                  {[
                    log.flow !== 'none' ? `flow: ${log.flow}` : null,
                    log.symptoms.length ? `${log.symptoms.length} symptoms` : null,
                    log.moods.length ? `${log.moods.length} moods` : null,
                    log.waterMl ? `${log.waterMl}ml` : null,
                    log.sleepHours ? `${log.sleepHours}h sleep` : null,
                  ]
                    .filter(Boolean)
                    .join(' · ') || '—'}
                </AppText>
              </Row>
            ))
          )}
        </Card>

        <Button
          title="Share summary as text"
          icon="share-variant-outline"
          fullWidth
          onPress={() => Share.share({ message: buildText() })}
        />

        <Card>
          <Row gap={spacing.md}>
            <MaterialCommunityIcons name="shield-alert-outline" size={20} color={colors.warning} />
            <AppText variant="caption" muted style={styles.flex}>
              This report is for your own reference. It is not a diagnosis and can’t replace a clinician’s assessment.
            </AppText>
          </Row>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  badge: { paddingHorizontal: spacing.md, paddingVertical: 6, borderRadius: 999 },
  wrap: { flexWrap: 'wrap' },
  logRow: { gap: spacing.sm, paddingVertical: 4 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  dateCol: { width: 74 },
});
