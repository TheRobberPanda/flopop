import { StyleSheet, View } from 'react-native';

import { Chip, type IconName } from '@/components/ui';
import type { CatalogItem } from '@/content/catalogs';
import { spacing } from '@/theme';

export function ToggleChips({
  items,
  values,
  onToggle,
  color,
  compact,
}: {
  items: (CatalogItem | { id: string; label: string; icon: IconName })[];
  values: string[];
  onToggle: (id: string) => void;
  color?: string;
  compact?: boolean;
}) {
  return (
    <View style={styles.wrap}>
      {items.map((item) => (
        <Chip
          key={item.id}
          label={item.label}
          icon={item.icon as IconName}
          selected={values.includes(item.id)}
          onPress={() => onToggle(item.id)}
          color={color}
          compact={compact}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
});
