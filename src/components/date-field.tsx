import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useState } from 'react';
import { Platform, Pressable, StyleSheet, View } from 'react-native';

import { AppText } from '@/components/ui';
import { formatMedium, fromISO, toISO, type ISODate } from '@/lib/dates';
import { radius, spacing, useTheme } from '@/theme';

export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
  maximumDate,
  minimumDate,
}: {
  label?: string;
  value: ISODate | null;
  onChange: (value: ISODate) => void;
  placeholder?: string;
  maximumDate?: Date;
  minimumDate?: Date;
}) {
  const { colors } = useTheme();
  const [open, setOpen] = useState(false);

  const handleChange = (event: DateTimePickerEvent, date?: Date) => {
    if (Platform.OS !== 'ios') setOpen(false);
    if (event.type === 'set' && date) onChange(toISO(date));
  };

  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" muted>
          {label}
        </AppText>
      ) : null}
      <Pressable
        onPress={() => setOpen((current) => !current)}
        style={[styles.field, { backgroundColor: colors.surface, borderColor: colors.border }]}>
        <MaterialCommunityIcons name="calendar-heart" size={18} color={colors.primary} />
        <AppText variant="bodyStrong" muted={!value}>
          {value ? formatMedium(value) : placeholder}
        </AppText>
      </Pressable>
      {open ? (
        <DateTimePicker
          value={value ? fromISO(value) : new Date()}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          maximumDate={maximumDate}
          minimumDate={minimumDate}
          onChange={handleChange}
        />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
  },
});
