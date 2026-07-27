import { useColorScheme, type ColorSchemeName } from 'react-native';

export interface ThemeColors {
  background: string;
  surface: string;
  surfaceMuted: string;
  primary: string;
  primaryDark: string;
  primarySoft: string;
  accent: string;
  info: string;
  text: string;
  textMuted: string;
  border: string;
  success: string;
  successSoft: string;
  warning: string;
  danger: string;
  dangerSoft: string;
  overlay: string;
  onPrimary: string;
  transparent: string;
}

export const brandColors = {
  charcoal: '#414040',
  magenta: '#C03456',
  green: '#63A94B',
  turquoise: '#009CA8',
  gray: '#706F6F',
  purple: '#8F1874',
  yellow: '#FEC700',
} as const;

export const lightColors: ThemeColors = {
  background: '#F7F7F8',
  surface: '#FFFFFF',
  surfaceMuted: '#F0F1F3',
  primary: brandColors.magenta,
  primaryDark: '#8F2740',
  primarySoft: '#F8E7EC',
  accent: brandColors.purple,
  info: brandColors.turquoise,
  text: brandColors.charcoal,
  textMuted: brandColors.gray,
  border: '#D9D8D8',
  success: brandColors.green,
  successSoft: '#EAF5E7',
  warning: brandColors.yellow,
  danger: '#A52644',
  dangerSoft: '#F9E4E9',
  overlay: 'rgba(34, 32, 33, 0.52)',
  onPrimary: '#FFFFFF',
  transparent: 'transparent',
};

export const darkColors: ThemeColors = {
  background: '#171717',
  surface: '#242424',
  surfaceMuted: '#303030',
  primary: '#E05B7B',
  primaryDark: '#F28CA5',
  primarySoft: '#4A2430',
  accent: '#C35AAC',
  info: '#35C4CF',
  text: '#F7F7F7',
  textMuted: '#C1BFC0',
  border: '#494747',
  success: '#7CCB68',
  successSoft: '#263C28',
  warning: '#FFD54A',
  danger: '#FF6B86',
  dangerSoft: '#4B252E',
  overlay: 'rgba(0, 0, 0, 0.68)',
  onPrimary: '#FFFFFF',
  transparent: 'transparent',
};

export function getThemeColors(colorScheme: ColorSchemeName): ThemeColors {
  return colorScheme === 'dark' ? darkColors : lightColors;
}

export function useAppTheme() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return {
    colors: getThemeColors(colorScheme),
    isDark,
  } as const;
}

export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  xxl: 48,
} as const;

export const radius = {
  sm: 8,
  md: 14,
  lg: 22,
  pill: 999,
} as const;

export const typography = {
  hero: { fontSize: 30, lineHeight: 36, fontWeight: '700' as const },
  title: { fontSize: 20, lineHeight: 26, fontWeight: '700' as const },
  body: { fontSize: 16, lineHeight: 23, fontWeight: '400' as const },
  label: { fontSize: 14, lineHeight: 20, fontWeight: '600' as const },
  caption: { fontSize: 13, lineHeight: 18, fontWeight: '400' as const },
} as const;
