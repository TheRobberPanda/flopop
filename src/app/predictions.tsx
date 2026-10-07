import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AppText, Card, Chip, IconButton, Row } from '@/components/ui';
import { upcomingPredictions } from '@/domain/cycle';
import { formatMedium, today } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { cycle as cycleColors, radius, spacing, useTheme } from '@/theme';

const CONFIDENCE_COPY: Record<string, string> = {
  high: 'High confidence',
  medium: 'Medium confidence',
  low: 'Low confidence',
};

export default function PredictionsScreen() {
  const { colors } = useTheme();
  const cycles = useAppStore((state) => state.cycles);
  const stats = useAppStore((state) => state.stats);
  const predictions = upcomingPredictions(cycles, stats, today(), 6);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Upcoming cycles
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="body" muted>
          Predictions use your average {stats.avgCycleLength}-day cycle and a {stats.lutealLength}-day luteal phase.
        </AppText>

        {predictions.map((prediction, index) => (
          <Card key={prediction.cycleStart} style={{ gap: spacing.sm }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <AppText variant="heading">Cycle {index + 1}</AppText>
              <Chip
                label={CONFIDENCE_COPY[prediction.confidence]}
                color={prediction.confidence === 'high' ? colors.success : prediction.confidence === 'medium' ? colors.warning : colors.danger}
                compact
              />
            </Row>

            <View style={styles.timeline}>
              <TimelineRow
                color={cycleColors.period}
                icon="water"
                label="Period"
                value={`${formatMedium(prediction.cycleStart)} → ${formatMedium(prediction.periodEnd)}`}
              />
              <TimelineRow
                color={cycleColors.fertile}
                icon="sprout"
                label="Fertile window"
                value={`${formatMedium(prediction.fertileStart)} → ${formatMedium(prediction.fertileEnd)}`}
              />
              <TimelineRow
                color={cycleColors.ovulation}
                icon="egg-easter"
                label="Ovulation"
                value={formatMedium(prediction.ovulationDate)}
              />
              <TimelineRow
                color={cycleColors.pms}
                icon="weather-cloudy"
                label="PMS"
                value={`${formatMedium(prediction.pmsStart)} → ${formatMedium(prediction.pmsEnd)}`}
              />
            </View>
          </Card>
        ))}

        <Card>
          <Row gap={spacing.md}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.textSecondary} />
            <AppText variant="caption" muted style={styles.flex}>
              Predictions are estimates based on past cycles. Stress, travel, illness and sleep can all shift when your
              next period starts.
            </AppText>
          </Row>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function TimelineRow({
  color,
  icon,
  label,
  value,
}: {
  color: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  label: string;
  value: string;
}) {
  return (
    <Row gap={spacing.md}>
      <View style={[styles.timelineIcon, { backgroundColor: color + '22' }]}>
        <MaterialCommunityIcons name={icon} size={16} color={color} />
      </View>
      <AppText variant="label" style={styles.timelineLabel}>
        {label}
      </AppText>
      <AppText variant="caption" muted style={styles.flex}>
        {value}
      </AppText>
    </Row>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.md },
  timeline: { gap: spacing.sm },
  timelineIcon: { width: 30, height: 30, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  timelineLabel: { width: 92 },
});
