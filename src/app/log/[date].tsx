import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router, useLocalSearchParams, type Href } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { TextField } from '@/components/field';
import { ToggleChips } from '@/components/toggle-chips';
import { AppText, Button, Card, Chip, IconButton, Row } from '@/components/ui';
import {
  activityItems,
  cravingOptions,
  dischargeOptions,
  flowLevels,
  moodGroups,
  sexOptions,
  symptomGroups,
} from '@/content/catalogs';
import { getDayLog, type DayLogInput } from '@/db/repositories/logs';
import type { FlowLevel } from '@/domain/types';
import { formatMedium, relativeDayLabel, today, type ISODate } from '@/lib/dates';
import { useAppStore } from '@/store/useAppStore';
import { cycle as cycleColors, radius, spacing, useTheme } from '@/theme';

export default function LogScreen() {
  const { colors } = useTheme();
  const params = useLocalSearchParams<{ date: string }>();
  const date = (params.date ?? today()) as ISODate;
  const saveLog = useAppStore((state) => state.saveLog);
  const deleteLogAction = useAppStore((state) => state.deleteLog);
  const [log, setLog] = useState(() => getDayLog(date));

  const update = (patch: DayLogInput) => {
    saveLog(date, patch);
    setLog(getDayLog(date));
  };

  const toggleList = (
    key: 'symptoms' | 'moods' | 'activities' | 'cravings',
    id: string,
  ) => {
    const current = log?.[key] ?? [];
    const next = current.includes(id) ? current.filter((item) => item !== id) : [...current, id];
    update({ [key]: next } as DayLogInput);
  };

  const selectSingle = (key: 'discharge' | 'sex', id: string) => {
    const current = log?.[key] ?? null;
    update({ [key]: current === id ? null : id } as DayLogInput);
  };

  const setFlow = (flow: FlowLevel) => {
    update({ flow: log?.flow === flow ? 'none' : flow });
  };

  const water = log?.waterMl ?? 0;
  const hasLog =
    !!log &&
    (log.flow !== 'none' ||
      log.symptoms.length + log.moods.length + log.activities.length + log.cravings.length > 0 ||
      log.discharge ||
      log.sex ||
      log.notes ||
      log.waterMl ||
      log.sleepHours ||
      log.weightKg ||
      log.bbt);

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Row style={styles.header}>
        <IconButton name="close" onPress={() => router.back()} />
        <View style={styles.flex}>
          <AppText variant="heading" center>
            {relativeDayLabel(date)}
          </AppText>
          <AppText variant="caption" muted center>
            {formatMedium(date)}
          </AppText>
        </View>
        <View style={styles.headerSpacer}>
          {hasLog ? (
            <Pressable
              onPress={() => {
                deleteLogAction(date);
                setLog(null);
              }}
              hitSlop={8}>
              <MaterialCommunityIcons name="trash-can-outline" size={22} color={colors.textMuted} />
            </Pressable>
          ) : null}
        </View>
      </Row>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Section title="Flow" subtitle="How heavy is your bleeding?">
          <Row gap={spacing.sm} style={styles.wrapRow}>
            {flowLevels.map((level) => (
              <Chip
                key={level.id}
                label={level.label}
                icon={level.icon as never}
                color={cycleColors.period}
                selected={log?.flow === level.id}
                onPress={() => setFlow(level.id as FlowLevel)}
              />
            ))}
          </Row>
        </Section>

        <Section title="Water" subtitle="Tap to track glasses through the day.">
          <Row gap={spacing.md}>
            <IconButton name="minus" background={colors.surfaceAlt} onPress={() => update({ waterMl: Math.max(0, water - 250) })} />
            <View style={styles.waterValue}>
              <AppText variant="title">{water}</AppText>
              <AppText variant="caption" muted>
                ml
              </AppText>
            </View>
            <IconButton name="plus" background={colors.surfaceAlt} onPress={() => update({ waterMl: water + 250 })} />
          </Row>
        </Section>

        {symptomGroups.map((group) => (
          <Section key={group.id} title={group.label} subtitle={group.id === 'pain' ? 'Tap everything that applies.' : undefined}>
            <ToggleChips
              items={group.items}
              values={log?.symptoms ?? []}
              onToggle={(id) => toggleList('symptoms', id)}
              color={cycleColors.period}
            />
          </Section>
        ))}

        {moodGroups.map((group) => (
          <Section key={group.id} title={group.label}>
            <ToggleChips
              items={group.items}
              values={log?.moods ?? []}
              onToggle={(id) => toggleList('moods', id)}
              color={cycleColors.luteal}
            />
          </Section>
        ))}

        <Section title="Discharge">
          <ToggleChips
            items={dischargeOptions}
            values={log?.discharge ? [log.discharge] : []}
            onToggle={(id) => selectSingle('discharge', id)}
            color={cycleColors.fertile}
          />
        </Section>

        <Section title="Sex & intimacy">
          <ToggleChips
            items={sexOptions}
            values={log?.sex ? [log.sex] : []}
            onToggle={(id) => selectSingle('sex', id)}
            color={cycleColors.ovulation}
          />
        </Section>

        <Section title="Cravings">
          <ToggleChips
            items={cravingOptions}
            values={log?.cravings ?? []}
            onToggle={(id) => toggleList('cravings', id)}
            color={cycleColors.pms}
          />
        </Section>

        <Section title="Activities">
          <ToggleChips
            items={activityItems}
            values={log?.activities ?? []}
            onToggle={(id) => toggleList('activities', id)}
          />
        </Section>

        <Section title="Body data" subtitle="Optional — great for spotting patterns.">
          <Row gap={spacing.sm}>
            <View style={styles.flex}>
              <TextField
                label="Weight (kg)"
                value={log?.weightKg != null ? String(log.weightKg) : ''}
                keyboardType="decimal-pad"
                onChangeText={(value) => update({ weightKg: value ? Number(value) : null })}
                placeholder="—"
              />
            </View>
            <View style={styles.flex}>
              <TextField
                label="Basal temp (°C)"
                value={log?.bbt != null ? String(log.bbt) : ''}
                keyboardType="decimal-pad"
                onChangeText={(value) => update({ bbt: value ? Number(value) : null })}
                placeholder="—"
              />
            </View>
          </Row>
          <Row gap={spacing.sm} style={{ marginTop: spacing.sm }}>
            <View style={styles.flex}>
              <TextField
                label="Sleep (hours)"
                value={log?.sleepHours != null ? String(log.sleepHours) : ''}
                keyboardType="decimal-pad"
                onChangeText={(value) => update({ sleepHours: value ? Number(value) : null })}
                placeholder="—"
              />
            </View>
            <View style={styles.flex}>
              <Pressable
                onPress={() => update({ pillTaken: !(log?.pillTaken === 1) })}
                style={[
                  styles.pillToggle,
                  {
                    backgroundColor: log?.pillTaken === 1 ? colors.primarySoft : colors.surface,
                    borderColor: log?.pillTaken === 1 ? colors.primary : colors.border,
                  },
                ]}>
                <MaterialCommunityIcons
                  name={log?.pillTaken === 1 ? 'checkbox-marked-circle' : 'checkbox-blank-circle-outline'}
                  size={22}
                  color={log?.pillTaken === 1 ? colors.primary : colors.textMuted}
                />
                <AppText variant="label">Contraceptive taken</AppText>
              </Pressable>
            </View>
          </Row>
        </Section>

        <Section title="Notes">
          <TextField
            value={log?.notes ?? ''}
            onChangeText={(notes) => update({ notes })}
            placeholder="Anything you want to remember about today…"
            multiline
          />
        </Section>

        <Button title="Done" fullWidth onPress={() => router.back()} />
        <Button
          title="View insights"
          variant="ghost"
          fullWidth
          onPress={() => router.replace('/(tabs)/insights' as Href)}
        />
        <View style={{ height: spacing.xxl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: ReactNode }) {
  return (
    <Card style={styles.section}>
      <AppText variant="heading">{title}</AppText>
      {subtitle ? (
        <AppText variant="caption" muted>
          {subtitle}
        </AppText>
      ) : null}
      <View style={styles.sectionBody}>{children}</View>
    </Card>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  header: { paddingHorizontal: spacing.md, paddingVertical: spacing.sm, gap: spacing.sm },
  headerSpacer: { width: 40, alignItems: 'flex-end' },
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing.lg, paddingBottom: spacing.xxxl, gap: spacing.lg },
  section: { gap: spacing.xs },
  sectionBody: { marginTop: spacing.sm },
  wrapRow: { flexWrap: 'wrap' },
  waterValue: { alignItems: 'center', minWidth: 80 },
  pillToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
});
