import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, type Href } from 'expo-router';
import { useState } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { MonthCalendar } from '@/components/month-calendar';
import { AppText, Button, Card, Chip, Row } from '@/components/ui';
import { catalogLabel } from '@/content/catalogs';
import { phaseLabel } from '@/domain/cycle';
import { addMonthsISO, formatMedium, relativeDayLabel, today } from '@/lib/dates';
import { useCurrentCycle, useCycleData, useLog, useLoggedDates, useCycleStats, phaseColor } from '@/hooks/use-cycle';
import { useFocusRefresh } from '@/hooks/use-focus-refresh';
import { cycle as cycleColors, spacing, useTheme } from '@/theme';

export default function CalendarScreen() {
  const { colors } = useTheme();
  const todayISO = today();
  const [anchor, setAnchor] = useState(todayISO);
  const [selected, setSelected] = useState(todayISO);
  useFocusRefresh();
  const stats = useCycleStats();

  const from = addMonthsISO(anchor, -1);
  const to = addMonthsISO(anchor, 1);
  const dayStates = useCycleData(from, to);
  const logged = useLoggedDates(from, to);
  const log = useLog(selected);
  const state = dayStates.get(selected);
  const current = useCurrentCycle();

  const badges: { label: string; color: string }[] = [];
  if (state?.isPeriod) badges.push({ label: 'Period', color: cycleColors.period });
  else if (state?.isPredictedPeriod) badges.push({ label: 'Predicted period', color: cycleColors.predictedPeriod });
  if (state?.isOvulation) badges.push({ label: 'Ovulation', color: cycleColors.ovulation });
  else if (state?.isFertile) badges.push({ label: 'Fertile day', color: cycleColors.fertile });
  if (state?.isPms) badges.push({ label: 'PMS', color: cycleColors.pms });

  const summary = log
    ? [
        ...log.symptoms.map(catalogLabel),
        ...log.moods.map(catalogLabel),
        ...(log.flow !== 'none' ? [`Flow: ${log.flow}`] : []),
      ].slice(0, 8)
    : [];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <AppText variant="title">Calendar</AppText>
        <AppText variant="body" muted>
          Tap any day to see its prediction or add a log.
        </AppText>

        <MonthCalendar
          anchor={anchor}
          dayStates={dayStates}
          selected={selected}
          loggedDates={logged}
          onSelect={setSelected}
          onPrev={() => setAnchor((current) => addMonthsISO(current, -1))}
          onNext={() => setAnchor((current) => addMonthsISO(current, 1))}
        />

        <Card>
          <Row style={{ justifyContent: 'space-between' }}>
            <View style={styles.flex}>
              <AppText variant="heading">{relativeDayLabel(selected, todayISO)}</AppText>
              <AppText variant="caption" muted>
                {formatMedium(selected)}
                {state?.cycleDay ? ` · Cycle day ${state.cycleDay}` : ''}
              </AppText>
            </View>
            <View
              style={[
                styles.phaseDot,
                { backgroundColor: state ? phaseColor(state.phase) : colors.textMuted },
              ]}
            />
          </Row>

          {state ? (
            <AppText variant="label" color={phaseColor(state.phase)}>
              {phaseLabel(state.phase)}
            </AppText>
          ) : null}

          {badges.length > 0 ? (
            <Row gap={spacing.xs} style={styles.badges}>
              {badges.map((badge) => (
                <Chip key={badge.label} label={badge.label} color={badge.color} compact />
              ))}
            </Row>
          ) : null}

          {summary.length > 0 ? (
            <View style={styles.summary}>
              <AppText variant="label" muted>
                Logged
              </AppText>
              <Row gap={spacing.xs} style={styles.badges}>
                {summary.map((item) => (
                  <Chip key={item} label={item} compact />
                ))}
              </Row>
            </View>
          ) : (
            <AppText variant="body" muted>
              Nothing logged for this day yet.
            </AppText>
          )}

          <Button
            title={log ? 'Edit this day' : 'Log this day'}
            icon="pencil-outline"
            onPress={() => router.push(`/log/${selected}` as Href)}
            style={styles.button}
          />
        </Card>

        <Card>
          <Row style={{ gap: spacing.md }}>
            <MaterialCommunityIcons name="information-outline" size={20} color={colors.textSecondary} />
            <AppText variant="caption" muted style={styles.flex}>
              Predictions use your average cycle of {stats.avgCycleLength} days
              {stats.sampleSize >= 2
                ? `, based on ${stats.sampleSize} logged cycles.`
                : '. They get more accurate as you log.'}
            </AppText>
          </Row>
          <AppText variant="caption" muted style={{ marginTop: spacing.sm }}>
            Current cycle day {current.cycleDay} · Next period {formatMedium(current.nextPeriodStart)}
          </AppText>
        </Card>

        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingTop: spacing.sm, paddingBottom: spacing.xxxl, gap: spacing.lg },
  flex: { flex: 1, gap: 2 },
  phaseDot: { width: 14, height: 14, borderRadius: 7 },
  badges: { flexWrap: 'wrap', marginTop: spacing.sm },
  summary: { marginTop: spacing.md, gap: spacing.xs },
  button: { marginTop: spacing.lg },
});
