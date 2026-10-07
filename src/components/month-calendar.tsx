import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatMonthYear, monthGrid, today as todayISO, type ISODate } from '@/lib/dates';
import type { DayState } from '@/domain/types';
import { cycle as cycleColors, radius, spacing, useTheme } from '@/theme';

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

function dayPaint(state: DayState | undefined): { bg?: string; border?: string; text?: string } {
  if (!state) return {};
  if (state.isPeriod) return { bg: cycleColors.period, text: '#FFFFFF' };
  if (state.isOvulation) return { bg: cycleColors.ovulation, text: '#FFFFFF' };
  if (state.isFertile) return { bg: cycleColors.fertile, text: '#FFFFFF' };
  if (state.isPms) return { bg: cycleColors.pms + '55' };
  if (state.isPredictedPeriod) return { border: cycleColors.predictedPeriod, bg: cycleColors.predictedPeriod + '22' };
  return {};
}

export function MonthCalendar({
  anchor,
  dayStates,
  selected,
  loggedDates,
  onSelect,
  onPrev,
  onNext,
}: {
  anchor: ISODate;
  dayStates: Map<ISODate, DayState>;
  selected: ISODate | null;
  loggedDates: Set<ISODate>;
  onSelect: (date: ISODate) => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const { colors } = useTheme();
  const grid = monthGrid(anchor);
  const month = anchor.slice(0, 7);
  const today = todayISO();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.surface, borderColor: colors.border }]}>
      <View style={styles.header}>
        <Pressable onPress={onPrev} hitSlop={10} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-left" size={24} color={colors.text} />
        </Pressable>
        <AppText variant="heading">{formatMonthYear(anchor)}</AppText>
        <Pressable onPress={onNext} hitSlop={10} style={styles.navButton}>
          <MaterialCommunityIcons name="chevron-right" size={24} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.weekRow}>
        {WEEKDAYS.map((day, index) => (
          <View key={`${day}-${index}`} style={styles.cell}>
            <AppText variant="tiny" muted>
              {day}
            </AppText>
          </View>
        ))}
      </View>

      <View style={styles.grid}>
        {grid.map((date) => {
          const inMonth = date.slice(0, 7) === month;
          const state = dayStates.get(date);
          const paint = dayPaint(state);
          const isSelected = selected === date;
          const isToday = date === today;
          const isLogged = loggedDates.has(date);
          return (
            <Pressable key={date} onPress={() => onSelect(date)} style={styles.cell}>
              <View
                style={[
                  styles.day,
                  paint.bg ? { backgroundColor: paint.bg } : null,
                  paint.border ? { borderColor: paint.border, borderWidth: 1.5 } : null,
                  isToday && !paint.bg ? { borderColor: colors.primary, borderWidth: 1.5 } : null,
                  isSelected ? { borderColor: colors.text, borderWidth: 2 } : null,
                ]}>
                <AppText
                  variant="label"
                  color={paint.text ?? (inMonth ? colors.text : colors.textMuted)}
                  style={!inMonth ? styles.outMonth : undefined}>
                  {Number(date.slice(8, 10))}
                </AppText>
              </View>
              {isLogged ? (
                <View
                  style={[
                    styles.dot,
                    { backgroundColor: paint.bg ?? colors.primary },
                  ]}
                />
              ) : null}
            </Pressable>
          );
        })}
      </View>

      <View style={styles.legend}>
        <Legend color={cycleColors.period} label="Period" />
        <Legend color={cycleColors.predictedPeriod} label="Predicted" />
        <Legend color={cycleColors.fertile} label="Fertile" />
        <Legend color={cycleColors.ovulation} label="Ovulation" />
        <Legend color={cycleColors.pms} label="PMS" />
      </View>
    </View>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <View style={styles.legendItem}>
      <View style={[styles.legendDot, { backgroundColor: color }]} />
      <AppText variant="caption" muted>
        {label}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: radius.lg, borderWidth: 1, padding: spacing.md },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: spacing.sm },
  navButton: { width: 36, height: 36, alignItems: 'center', justifyContent: 'center' },
  weekRow: { flexDirection: 'row' },
  grid: { flexDirection: 'row', flexWrap: 'wrap' },
  cell: {
    width: `${100 / 7}%`,
    aspectRatio: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  day: {
    width: 36,
    height: 36,
    borderRadius: radius.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  outMonth: { opacity: 0.45 },
  dot: { position: 'absolute', bottom: 4, width: 4, height: 4, borderRadius: 2 },
  legend: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.md,
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
  },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  legendDot: { width: 10, height: 10, borderRadius: 5 },
});
