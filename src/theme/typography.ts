import { Platform, TextStyle } from 'react-native';

const fontFamily = Platform.select({
  ios: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
  android: {
    regular: 'Roboto',
    medium: 'Roboto',
    semiBold: 'Roboto',
    bold: 'Roboto',
  },
  default: {
    regular: 'System',
    medium: 'System',
    semiBold: 'System',
    bold: 'System',
  },
});

export const fontSizes = {
  xs: 10,
  sm: 12,
  md: 14,
  base: 16,
  lg: 18,
  xl: 20,
  '2xl': 24,
  '3xl': 30,
  '4xl': 36,
  '5xl': 48,
} as const;

export const fontWeights = {
  regular: '400' as TextStyle['fontWeight'],
  medium: '500' as TextStyle['fontWeight'],
  semiBold: '600' as TextStyle['fontWeight'],
  bold: '700' as TextStyle['fontWeight'],
  extraBold: '800' as TextStyle['fontWeight'],
} as const;

export const lineHeights = {
  tight: 1.2,
  snug: 1.3,
  normal: 1.5,
  relaxed: 1.65,
  loose: 1.8,
} as const;

export const letterSpacings = {
  tighter: -0.5,
  tight: -0.25,
  normal: 0,
  wide: 0.25,
  wider: 0.5,
  widest: 1,
} as const;

export interface TypographyStyle extends TextStyle {
  fontSize: number;
  fontWeight: TextStyle['fontWeight'];
  lineHeight: number;
  fontFamily?: string;
  letterSpacing?: number;
}

export interface ThemeTypography {
  // Display
  displayLarge: TypographyStyle;
  displayMedium: TypographyStyle;
  displaySmall: TypographyStyle;

  // Headings
  h1: TypographyStyle;
  h2: TypographyStyle;
  h3: TypographyStyle;
  h4: TypographyStyle;
  h5: TypographyStyle;
  h6: TypographyStyle;

  // Body
  bodyLarge: TypographyStyle;
  bodyMedium: TypographyStyle;
  bodySmall: TypographyStyle;

  // Label
  labelLarge: TypographyStyle;
  labelMedium: TypographyStyle;
  labelSmall: TypographyStyle;

  // Caption
  caption: TypographyStyle;
  overline: TypographyStyle;

  // Specific use
  button: TypographyStyle;
  price: TypographyStyle;
  priceLarge: TypographyStyle;
  invoiceNumber: TypographyStyle;
}

const base: ThemeTypography = {
  displayLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes['5xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['5xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  displayMedium: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes['4xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['4xl'] * lineHeights.tight,
    letterSpacing: letterSpacings.tight,
  },
  displaySmall: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes['3xl'] * lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },

  h1: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes['3xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['3xl'] * lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },
  h2: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
    letterSpacing: letterSpacings.tight,
  },
  h3: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.xl,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.xl * lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h4: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.lg * lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  h5: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  h6: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  bodyLarge: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.lg * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  bodyMedium: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.base * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },
  bodySmall: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.sm * lineHeights.normal,
    letterSpacing: letterSpacings.normal,
  },

  labelLarge: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.snug,
    letterSpacing: letterSpacings.wide,
  },
  labelMedium: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.sm,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.sm * lineHeights.snug,
    letterSpacing: letterSpacings.wide,
  },
  labelSmall: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.snug,
    letterSpacing: letterSpacings.wider,
  },

  caption: {
    fontFamily: fontFamily.regular,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.regular,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacings.wide,
  },
  overline: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.xs,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.xs * lineHeights.normal,
    letterSpacing: letterSpacings.widest,
    textTransform: 'uppercase',
  },

  button: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.base,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.base * lineHeights.snug,
    letterSpacing: letterSpacings.wide,
  },
  price: {
    fontFamily: fontFamily.semiBold,
    fontSize: fontSizes.lg,
    fontWeight: fontWeights.semiBold,
    lineHeight: fontSizes.lg * lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  priceLarge: {
    fontFamily: fontFamily.bold,
    fontSize: fontSizes['2xl'],
    fontWeight: fontWeights.bold,
    lineHeight: fontSizes['2xl'] * lineHeights.snug,
    letterSpacing: letterSpacings.normal,
  },
  invoiceNumber: {
    fontFamily: fontFamily.medium,
    fontSize: fontSizes.md,
    fontWeight: fontWeights.medium,
    lineHeight: fontSizes.md * lineHeights.snug,
    letterSpacing: letterSpacings.wider,
  },
};

export const typography = {
  ...base,
  fontFamily,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
} as const;
