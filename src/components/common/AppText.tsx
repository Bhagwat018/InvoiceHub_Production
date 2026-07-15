import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { useTheme } from '../../hooks/useTheme';
import type { ThemeTypography } from '../../theme/typography';

type TextVariant = keyof Pick<
  ThemeTypography,
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'h5'
  | 'h6'
  | 'bodyLarge'
  | 'bodyMedium'
  | 'bodySmall'
  | 'labelLarge'
  | 'labelMedium'
  | 'labelSmall'
  | 'caption'
  | 'overline'
  | 'price'
  | 'priceLarge'
  | 'invoiceNumber'
>;

type ColorType =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'textPrimary'
  | 'textSecondary'
  | 'textTertiary'
  | 'textDisabled'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

interface AppTextProps extends TextProps {
  variant?: TextVariant;
  color?: ColorType;
  align?: TextStyle['textAlign'];
  children: React.ReactNode;
  numberOfLines?: number;
}

const FALLBACK_COLORS: Record<ColorType, string> = {
  primary: '#1E88E5',
  secondary: '#00897B',
  accent: '#FFB300',
  textPrimary: '#212121',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textDisabled: '#BDBDBD',
  success: '#43A047',
  error: '#E53935',
  warning: '#FB8C00',
  info: '#1E88E5',
};

export default function AppText({
  variant = 'bodyMedium',
  color = 'textPrimary',
  align,
  children,
  style,
  numberOfLines,
  ...props
}: AppTextProps) {
  const hookResult = useTheme();
  const theme = hookResult?.theme;

  const colorMap = theme?.colors
    ? {
        primary: theme.colors.primary,
        secondary: theme.colors.secondary,
        accent: theme.colors.accent,
        textPrimary: theme.colors.textPrimary,
        textSecondary: theme.colors.textSecondary,
        textTertiary: theme.colors.textTertiary,
        textDisabled: theme.colors.textDisabled,
        success: theme.colors.success,
        error: theme.colors.error,
        warning: theme.colors.warning,
        info: theme.colors.info,
      }
    : FALLBACK_COLORS;

  const typographyStyle = theme?.typography?.[variant] ?? {};

  return (
    <Text
      style={[
        typographyStyle,
        { color: colorMap[color] },
        align ? { textAlign: align } : undefined,
        style,
      ]}
      numberOfLines={numberOfLines}
      {...props}
    >
      {children}
    </Text>
  );
}
