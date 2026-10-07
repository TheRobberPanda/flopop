import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { Alert, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { DateField } from '@/components/date-field';
import { AppText, Button, Card, IconButton, ProgressBar, Row, SectionHeader } from '@/components/ui';
import {
  addContraction,
  addKick,
  clearContractions,
  clearKicks,
  endContraction,
  kicksForSession,
  listContractions,
} from '@/db/repositories/pregnancy';
import { analyzeContractions, gestation, trimesterLabel, weekContent } from '@/domain/pregnancy';
import { humanDuration, today } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { brand, radius, spacing, useTheme } from '@/theme';

export default function PregnancyScreen() {
  const { colors } = useTheme();
  const pregnancy = useAppStore((state) => state.pregnancy);
  const beginPregnancy = useAppStore((state) => state.beginPregnancy);
  const finishPregnancy = useAppStore((state) => state.finishPregnancy);

  const [lmp, setLmp] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());

  const kicks = useMemo(() => {
    void tick;
    return pregnancy ? kicksForSession(today()) : [];
  }, [pregnancy, tick]);
  const contractions = useMemo(() => {
    void tick;
    return pregnancy ? listContractions() : [];
  }, [pregnancy, tick]);
  const bump = () => setTick((value) => value + 1);

  useEffect(() => {
    if (!activeId) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [activeId]);

  if (!pregnancy) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <Row style={styles.header}>
          <IconButton name="arrow-left" onPress={() => router.back()} />
          <AppText variant="heading" style={styles.flex} center>
            Pregnancy mode
          </AppText>
          <View style={styles.spacer} />
        </Row>
        <ScrollView contentContainerStyle={styles.content}>
          <Card style={{ gap: spacing.md, alignItems: 'center' }}>
            <View style={[styles.heroIcon, { backgroundColor: colors.primarySoft }]}>
              <MaterialCommunityIcons name="human-pregnant" size={34} color={colors.primary} />
            </View>
            <AppText variant="heading" center>
              Track your pregnancy
            </AppText>
            <AppText variant="body" muted center>
              Get week-by-week updates, a due date, a kick counter and a contraction timer. You can switch back anytime.
            </AppText>
          </Card>
          <Card style={{ gap: spacing.md }}>
            <DateField
              label="First day of your last period"
              value={lmp}
              onChange={setLmp}
              maximumDate={new Date()}
              placeholder="Tap to choose"
            />
            <Button
              title="Start pregnancy mode"
              icon="heart-plus"
              fullWidth
              disabled={!lmp}
              onPress={() => {
                if (lmp) beginPregnancy(lmp);
              }}
            />
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const g = gestation(pregnancy.lmpDate, today());
  const content = weekContent(g.weeks);
  const stats = analyzeContractions(contractions);
  const activeElapsed = activeId ? (now - (contractions.find((c) => c.id === activeId)?.start ?? now)) / 60000 : 0;

  const confirmEnd = () => {
    Alert.alert('End pregnancy mode?', 'This keeps your data but stops week-by-week tracking.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'End', style: 'destructive', onPress: finishPregnancy },
    ]);
  };

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top']}>
      <Row style={styles.header}>
        <IconButton name="arrow-left" onPress={() => router.back()} />
        <AppText variant="heading" style={styles.flex} center>
          Pregnancy
        </AppText>
        <View style={styles.spacer} />
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={[styles.hero, { backgroundColor: brand.rose }]}>
          <AppText variant="caption" color="#FFFFFFCC">
            {trimesterLabel(g.trimester)}
          </AppText>
          <AppText variant="display" color="#FFFFFF">
            Week {g.weeks}
          </AppText>
          <AppText variant="label" color="#FFFFFFCC">
            {g.weeks}w {g.daysIntoWeek}d · {g.daysRemaining} days to go
          </AppText>
          <ProgressBar value={g.progress} color="#FFFFFF" />
          <Row style={{ justifyContent: 'space-between' }}>
            <AppText variant="caption" color="#FFFFFFCC">
              LMP {pregnancy.lmpDate}
            </AppText>
            <AppText variant="caption" color="#FFFFFFCC">
              Due {pregnancy.dueDate}
            </AppText>
          </Row>
        </View>

        <Card style={{ gap: spacing.sm }}>
          <SectionHeader title={`This week: ${content.size}`} />
          <Row gap={spacing.md}>
            <InfoPill icon="ruler" label="Length" value={content.length} />
            <InfoPill icon="scale-bathroom" label="Weight" value="~" />
          </Row>
          <AppText variant="body" muted>
            {content.body}
          </AppText>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Kick counter" />
          <Row style={{ justifyContent: 'space-between' }}>
            <View>
              <AppText variant="display">{kicks.length}</AppText>
              <AppText variant="caption" muted>
                kicks today
              </AppText>
            </View>
            <Button
              title="Record kick"
              icon="foot-print"
              onPress={() => {
                addKick(pregnancy.id, new Date().toISOString(), today());
                bump();
              }}
            />
          </Row>
          <Row gap={spacing.sm}>
            <AppText variant="caption" muted style={styles.flex}>
              A common approach is counting until you feel 10 movements within a couple of hours. Follow your midwife’s
              guidance.
            </AppText>
            {kicks.length > 0 ? (
              <Button
                title="Reset"
                variant="ghost"
                onPress={() => {
                  clearKicks(today());
                  bump();
                }}
              />
            ) : null}
          </Row>
        </Card>

        <Card style={{ gap: spacing.md }}>
          <SectionHeader title="Contraction timer" />
          {activeId ? (
            <View style={{ gap: spacing.md }}>
              <View style={{ alignItems: 'center' }}>
                <AppText variant="display">{humanDuration(activeElapsed)}</AppText>
                <AppText variant="caption" muted>
                  contraction in progress
                </AppText>
              </View>
              <Button
                title="Stop contraction"
                variant="danger"
                fullWidth
                onPress={() => {
                  endContraction(activeId, Date.now(), 'moderate');
                  setActiveId(null);
                  bump();
                }}
              />
            </View>
          ) : (
            <Button
              title="Start contraction"
              icon="timer-outline"
              fullWidth
              onPress={() => {
                const created = addContraction(pregnancy.id, Date.now());
                setActiveId(created.id);
                bump();
              }}
            />
          )}

          {contractions.length > 0 ? (
            <View style={{ gap: spacing.sm }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <AppText variant="label" muted>
                  {stats.count} recorded
                </AppText>
                {stats.avgFrequencyMinutes ? (
                  <AppText variant="label" muted>
                    ~{humanDuration(stats.avgFrequencyMinutes)} apart
                  </AppText>
                ) : null}
              </Row>
              <AppText variant="caption" color={stats.pattern === 'regular_strong' ? colors.warning : colors.textSecondary}>
                {stats.advice}
              </AppText>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: spacing.sm }}>
                {contractions
                  .slice(-8)
                  .reverse()
                  .map((c) => (
                    <View key={c.id} style={[styles.contraction, { backgroundColor: colors.surfaceAlt }]}>
                      <AppText variant="caption" muted>
                        {new Date(c.start).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </AppText>
                      <AppText variant="label">
                        {c.end ? humanDuration((c.end - c.start) / 60000) : '—'}
                      </AppText>
                    </View>
                  ))}
              </ScrollView>
              <Button
                title="Clear contractions"
                variant="ghost"
                fullWidth
                onPress={() => {
                  clearContractions();
                  setActiveId(null);
                  bump();
                }}
              />
            </View>
          ) : null}
        </Card>

        <Button title="End pregnancy mode" variant="secondary" fullWidth onPress={confirmEnd} />
        <View style={{ height: spacing.xxxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function InfoPill({ icon, label, value }: { icon: keyof typeof MaterialCommunityIcons.glyphMap; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={[styles.infoPill, { backgroundColor: colors.surfaceAlt }]}>
      <MaterialCommunityIcons name={icon} size={16} color={colors.primary} />
      <AppText variant="caption" muted>
        {label}
      </AppText>
      <AppText variant="label">{value}</AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  flex: { flex: 1 },
  spacer: { width: 40 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  heroIcon: { width: 72, height: 72, borderRadius: radius.pill, alignItems: 'center', justifyContent: 'center' },
  hero: { borderRadius: radius.xl, padding: spacing.lg, gap: spacing.sm },
  infoPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    padding: spacing.sm,
    borderRadius: radius.md,
  },
  contraction: { borderRadius: radius.md, padding: spacing.sm, alignItems: 'center', minWidth: 72 },
});
