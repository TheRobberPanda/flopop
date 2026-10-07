import { StyleSheet, TextInput, View, type KeyboardTypeOptions } from 'react-native';

import { AppText } from '@/components/ui';
import { fonts, radius, spacing, useTheme } from '@/theme';

export function TextField({
  label,
  value,
  onChangeText,
  placeholder,
  keyboardType,
  secureTextEntry,
  maxLength,
  helper,
  multiline,
}: {
  label?: string;
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  keyboardType?: KeyboardTypeOptions;
  secureTextEntry?: boolean;
  maxLength?: number;
  helper?: string;
  multiline?: boolean;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.wrap}>
      {label ? (
        <AppText variant="label" muted>
          {label}
        </AppText>
      ) : null}
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        keyboardType={keyboardType}
        secureTextEntry={secureTextEntry}
        maxLength={maxLength}
        multiline={multiline}
        style={[
          styles.input,
          multiline && styles.multiline,
          { backgroundColor: colors.surface, borderColor: colors.border, color: colors.text },
        ]}
      />
      {helper ? (
        <AppText variant="caption" muted>
          {helper}
        </AppText>
      ) : null}
    </View>
  );
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  const { colors } = useTheme();
  return (
    <View style={[styles.segmented, { backgroundColor: colors.surfaceAlt, borderColor: colors.border }]}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <AppText
            key={option.value}
            onPress={() => onChange(option.value)}
            variant="label"
            color={active ? '#FFFFFF' : colors.textSecondary}
            style={[styles.segment, active ? { backgroundColor: colors.primary } : null]}>
            {option.label}
          </AppText>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { gap: 6 },
  input: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
    paddingVertical: 14,
    fontFamily: fonts.medium,
    fontSize: 16,
  },
  multiline: { minHeight: 96, textAlignVertical: 'top' },
  segmented: { flexDirection: 'row', borderRadius: radius.pill, borderWidth: 1, padding: 4, gap: 4 },
  segment: {
    flex: 1,
    textAlign: 'center',
    paddingVertical: 10,
    borderRadius: radius.pill,
    overflow: 'hidden',
  },
});
