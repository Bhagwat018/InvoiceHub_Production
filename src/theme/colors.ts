export const palette = {
  // Primary Blue
  primary50: '#E3F2FD',
  primary100: '#BBDEFB',
  primary200: '#90CAF9',
  primary300: '#64B5F6',
  primary400: '#42A5F5',
  primary500: '#1E88E5',
  primary600: '#1976D2',
  primary700: '#1565C0',
  primary800: '#0D47A1',
  primary900: '#0A3175',

  // Secondary Teal
  secondary50: '#E0F2F1',
  secondary100: '#B2DFDB',
  secondary200: '#80CBC4',
  secondary300: '#4DB6AC',
  secondary400: '#26A69A',
  secondary500: '#00897B',
  secondary600: '#00796B',
  secondary700: '#00695C',
  secondary800: '#004D40',
  secondary900: '#00332B',

  // Accent Amber
  accent50: '#FFF8E1',
  accent100: '#FFECB3',
  accent200: '#FFE082',
  accent300: '#FFD54F',
  accent400: '#FFCA28',
  accent500: '#FFB300',
  accent600: '#FFA000',
  accent700: '#FF8F00',
  accent800: '#FF6F00',
  accent900: '#E65100',

  // Success Green
  success50: '#E8F5E9',
  success100: '#C8E6C9',
  success200: '#A5D6A7',
  success300: '#81C784',
  success400: '#66BB6A',
  success500: '#43A047',
  success600: '#388E3C',
  success700: '#2E7D32',
  success800: '#1B5E20',
  success900: '#0D3B0F',

  // Error Red
  error50: '#FFEBEE',
  error100: '#FFCDD2',
  error200: '#EF9A9A',
  error300: '#E57373',
  error400: '#EF5350',
  error500: '#E53935',
  error600: '#D32F2F',
  error700: '#C62828',
  error800: '#B71C1C',
  error900: '#7F0000',

  // Warning Orange
  warning50: '#FFF3E0',
  warning100: '#FFE0B2',
  warning200: '#FFCC80',
  warning300: '#FFB74D',
  warning400: '#FFA726',
  warning500: '#FB8C00',
  warning600: '#F57C00',
  warning700: '#EF6C00',
  warning800: '#E65100',
  warning900: '#BF360C',

  // Neutrals
  white: '#FFFFFF',
  grey50: '#FAFAFA',
  grey100: '#F5F5F5',
  grey150: '#EEEEEE',
  grey200: '#E0E0E0',
  grey300: '#BDBDBD',
  grey400: '#9E9E9E',
  grey500: '#757575',
  grey600: '#616161',
  grey700: '#424242',
  grey800: '#303030',
  grey850: '#252525',
  grey900: '#1E1E1E',
  grey950: '#121212',
  black: '#000000',

  // Semantic
  info: '#1E88E5',
  success: '#43A047',
  error: '#E53935',
  warning: '#FB8C00',
} as const;

export type ColorToken = keyof typeof palette;

export interface ThemeColors {
  // Background
  background: string;
  surface: string;
  surfaceVariant: string;
  surfaceElevated: string;

  // Primary
  primary: string;
  primaryLight: string;
  primaryDark: string;
  onPrimary: string;
  onPrimaryContainer: string;
  primaryContainer: string;

  // Secondary
  secondary: string;
  secondaryLight: string;
  secondaryDark: string;
  onSecondary: string;
  onSecondaryContainer: string;
  secondaryContainer: string;

  // Accent
  accent: string;
  accentLight: string;
  accentDark: string;
  onAccent: string;
  accentContainer: string;

  // Status
  success: string;
  successLight: string;
  onSuccess: string;
  successContainer: string;

  error: string;
  errorLight: string;
  onError: string;
  errorContainer: string;

  warning: string;
  warningLight: string;
  onWarning: string;
  warningContainer: string;

  info: string;
  infoLight: string;
  onInfo: string;
  infoContainer: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  textDisabled: string;
  textInverse: string;

  // Border
  border: string;
  borderLight: string;
  borderFocused: string;
  divider: string;

  // Input
  inputBackground: string;
  inputBorder: string;
  inputBorderFocused: string;
  inputPlaceholder: string;

  // Overlay
  overlay: string;
  backdrop: string;

  // Shadow
  shadow: string;
}

export const lightColors: ThemeColors = {
  background: palette.grey50,
  surface: palette.white,
  surfaceVariant: palette.grey100,
  surfaceElevated: palette.white,

  primary: palette.primary500,
  primaryLight: palette.primary200,
  primaryDark: palette.primary700,
  onPrimary: palette.white,
  onPrimaryContainer: palette.primary800,
  primaryContainer: palette.primary50,

  secondary: palette.secondary500,
  secondaryLight: palette.secondary200,
  secondaryDark: palette.secondary700,
  onSecondary: palette.white,
  onSecondaryContainer: palette.secondary800,
  secondaryContainer: palette.secondary50,

  accent: palette.accent500,
  accentLight: palette.accent200,
  accentDark: palette.accent700,
  onAccent: palette.black,
  accentContainer: palette.accent50,

  success: palette.success500,
  successLight: palette.success200,
  onSuccess: palette.white,
  successContainer: palette.success50,

  error: palette.error500,
  errorLight: palette.error200,
  onError: palette.white,
  errorContainer: palette.error50,

  warning: palette.warning500,
  warningLight: palette.warning200,
  onWarning: palette.white,
  warningContainer: palette.warning50,

  info: palette.info,
  infoLight: palette.primary200,
  onInfo: palette.white,
  infoContainer: palette.primary50,

  textPrimary: palette.grey900,
  textSecondary: palette.grey600,
  textTertiary: palette.grey400,
  textDisabled: palette.grey300,
  textInverse: palette.white,

  border: palette.grey200,
  borderLight: palette.grey150,
  borderFocused: palette.primary500,
  divider: palette.grey150,

  inputBackground: palette.white,
  inputBorder: palette.grey300,
  inputBorderFocused: palette.primary500,
  inputPlaceholder: palette.grey400,

  overlay: 'rgba(0, 0, 0, 0.5)',
  backdrop: 'rgba(0, 0, 0, 0.3)',

  shadow: 'rgba(0, 0, 0, 0.1)',
};

export const darkColors: ThemeColors = {
  background: palette.grey950,
  surface: palette.grey900,
  surfaceVariant: palette.grey850,
  surfaceElevated: palette.grey800,

  primary: palette.primary400,
  primaryLight: palette.primary200,
  primaryDark: palette.primary600,
  onPrimary: palette.grey950,
  onPrimaryContainer: palette.primary100,
  primaryContainer: palette.primary800,

  secondary: palette.secondary400,
  secondaryLight: palette.secondary200,
  secondaryDark: palette.secondary600,
  onSecondary: palette.grey950,
  onSecondaryContainer: palette.secondary100,
  secondaryContainer: palette.secondary800,

  accent: palette.accent400,
  accentLight: palette.accent200,
  accentDark: palette.accent600,
  onAccent: palette.black,
  accentContainer: palette.accent800,

  success: palette.success400,
  successLight: palette.success200,
  onSuccess: palette.grey950,
  successContainer: palette.success800,

  error: palette.error400,
  errorLight: palette.error200,
  onError: palette.grey950,
  errorContainer: palette.error800,

  warning: palette.warning400,
  warningLight: palette.warning200,
  onWarning: palette.black,
  warningContainer: palette.warning800,

  info: palette.primary400,
  infoLight: palette.primary200,
  onInfo: palette.grey950,
  infoContainer: palette.primary800,

  textPrimary: palette.grey100,
  textSecondary: palette.grey400,
  textTertiary: palette.grey500,
  textDisabled: palette.grey600,
  textInverse: palette.grey900,

  border: palette.grey700,
  borderLight: palette.grey800,
  borderFocused: palette.primary400,
  divider: palette.grey800,

  inputBackground: palette.grey850,
  inputBorder: palette.grey700,
  inputBorderFocused: palette.primary400,
  inputPlaceholder: palette.grey500,

  overlay: 'rgba(0, 0, 0, 0.7)',
  backdrop: 'rgba(0, 0, 0, 0.5)',

  shadow: 'rgba(0, 0, 0, 0.3)',
};
