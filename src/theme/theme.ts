import { lightColors, darkColors, ThemeColors } from './colors';
import { typography, ThemeTypography } from './typography';
import { spacing, borderRadius, layout, shadows, opacity } from './spacing';

export interface AppTheme {
  colors: ThemeColors;
  typography: ThemeTypography;
  spacing: typeof spacing;
  borderRadius: typeof borderRadius;
  layout: typeof layout;
  shadows: typeof shadows;
  opacity: typeof opacity;
  isDark: boolean;
}

export const lightTheme: AppTheme = {
  colors: lightColors,
  typography,
  spacing,
  borderRadius,
  layout,
  shadows,
  opacity,
  isDark: false,
};

export const darkTheme: AppTheme = {
  colors: darkColors,
  typography,
  spacing,
  borderRadius,
  layout,
  shadows,
  opacity,
  isDark: true,
};

export type { AppTheme as Theme };
