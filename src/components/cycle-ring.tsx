import { StyleSheet, View } from 'react-native';
import Svg, { Circle, Defs, LinearGradient as SvgGradient, Stop } from 'react-native-svg';

import { AppText } from '@/components/ui';
import { cycle as cycleColors, spacing, useTheme } from '@/theme';

export function CycleRing({
  cycleDay,
  cycleLength,
  caption,
  subcaption,
  size = 224,
  strokeWidth = 16,
  color,
}: {
  cycleDay: number;
  cycleLength: number;
  caption: string;
  subcaption?: string;
  size?: number;
  strokeWidth?: number;
  color?: string;
}) {
  const { colors } = useTheme();
  const radiusValue = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radiusValue;
  const progress = Math.max(0.02, Math.min(1, cycleDay / Math.max(1, cycleLength)));
  const stroke = color ?? cycleColors.period;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Svg width={size} height={size}>
        <Defs>
          <SvgGradient id="ringGradient" x1="0" y1="0" x2="1" y2="1">
            <Stop offset="0" stopColor={stroke} />
            <Stop offset="1" stopColor={cycleColors.pms} />
          </SvgGradient>
        </Defs>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke={colors.surfaceSunken}
          strokeWidth={strokeWidth}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={radiusValue}
          stroke="url(#ringGradient)"
          strokeWidth={strokeWidth}
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - progress)}
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={[StyleSheet.absoluteFill, styles.center]}>
        <AppText variant="display">{caption}</AppText>
        {subcaption ? (
          <AppText variant="label" muted center style={styles.sub}>
            {subcaption}
          </AppText>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', justifyContent: 'center', gap: spacing.xs },
  sub: { paddingHorizontal: spacing.xl },
});
