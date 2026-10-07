import { useColorScheme } from 'react-native';

import { useAppStore } from '@/store/useAppStore';

export const brand = {
  rose: '#FF5C8A',
  roseDeep: '#E8417A',
  roseSoft: '#FFB3CC',
  blush: '#FFE3EC',
  peach: '#FFB59E',
  peachDeep: '#FF9A7B',
  petal: '#FFF5F7',
  plum: '#3A2430',
} as const;

export const cycle = {
  period: '#FF5C8A',
  predictedPeriod: '#FFB3CC',
  fertile: '#3FC7B4',
  ovulation: '#7B6CF6',
  pms: '#F2A65A',
  follicular: '#7EC8E3',
  luteal: '#C9A7EB',
} as const;

export interface AppColors {
  background: string;
  surface: string;
  surfaceAlt: string;
  surfaceSunken: string;
  text: string;
  textSecondary: string;
  textMuted: string;
  border: string;
  primary: string;
  primaryDeep: string;
  primarySoft: string;
  onPrimary: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

export const lightColors: AppColors = {
  background: '#FFF7F9',
  surface: '#FFFFFF',
  surfaceAlt: '#FCEFF3',
  surfaceSunken: '#F7E6EB',
  text: '#2E1B23',
  textSecondary: '#8A6B76',
  textMuted: '#B49BA4',
  border: '#F0DDE4',
  primary: brand.rose,
  primaryDeep: brand.roseDeep,
  primarySoft: brand.blush,
  onPrimary: '#FFFFFF',
  success: '#2FA98C',
  warning: '#E0902F',
  danger: '#E05252',
  overlay: 'rgba(46, 27, 35, 0.45)',
};

export const darkColors: AppColors = {
  background: '#171014',
  surface: '#221820',
  surfaceAlt: '#2C1F28',
  surfaceSunken: '#1E151B',
  text: '#FCEFF3',
  textSecondary: '#C4A6B2',
  textMuted: '#8E7280',
  border: '#35242E',
  primary: '#FF7AA2',
  primaryDeep: '#FF5C8A',
  primarySoft: '#3A2430',
  onPrimary: '#2E1B23',
  success: '#4CC9A8',
  warning: '#F0A860',
  danger: '#FF7B7B',
  overlay: 'rgba(0, 0, 0, 0.6)',
};

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 28,
  xxxl: 40,
} as const;

export const radius = {
  sm: 10,
  md: 16,
  lg: 22,
  xl: 30,
  pill: 999,
} as const;

export const fonts = {
  regular: 'Nunito_400Regular',
  medium: 'Nunito_500Medium',
  semiBold: 'Nunito_600SemiBold',
  bold: 'Nunito_700Bold',
  extraBold: 'Nunito_800ExtraBold',
} as const;

export const shadow = {
  soft: {
    shadowColor: '#B4466E',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 3,
  },
  lifted: {
    shadowColor: '#B4466E',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 6,
  },
} as const;

export const themes = { light: lightColors, dark: darkColors };

export type Theme = {
  colors: AppColors;
  scheme: 'light' | 'dark';
  isDark: boolean;
};

export function useTheme(): Theme {
  const preference = useAppStore((state) => state.settings.theme);
  const systemScheme = useColorScheme();
  const isDark = preference === 'system' ? systemScheme === 'dark' : preference === 'dark';
  return { colors: isDark ? darkColors : lightColors, scheme: isDark ? 'dark' : 'light', isDark };
}
