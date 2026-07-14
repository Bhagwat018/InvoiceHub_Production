import React from 'react';
import { Text, StyleSheet, TextProps, TextStyle } from 'react-native';
import { useTheme } from 'react-native-paper';
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

export default function AppText({
  variant = 'bodyMedium',
  color = 'textPrimary',
  align,
  children,
  style,
  numberOfLines,
  ...props
}: AppTextProps) {
  const theme = useTheme();

  const colorMap: Record<ColorType, string> = {
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
  };

  return (
    <Text
      style={[
        theme.typography[variant],
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
