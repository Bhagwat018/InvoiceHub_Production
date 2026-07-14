import { useCallback, useEffect, useMemo } from 'react';
import { useColorScheme } from 'react-native';
import { useAppStore } from '../storage/stores/appStore';
import { useSettingsStore } from '../storage/stores/settingsStore';
import { lightTheme, darkTheme } from '../theme';
import type { AppTheme } from '../theme';

export function useTheme() {
  const systemScheme = useColorScheme();
  const { themeMode, setThemeMode, setDarkMode } = useAppStore();
  const { setThemeMode: persistThemeMode } = useSettingsStore();

  const isDark = useMemo(() => {
    if (themeMode === 'system') {
      return systemScheme === 'dark';
    }
    return themeMode === 'dark';
  }, [themeMode, systemScheme]);

  const theme: AppTheme = isDark ? darkTheme : lightTheme;

  useEffect(() => {
    setDarkMode(isDark);
  }, [isDark, setDarkMode]);

  const setTheme = useCallback(
    (mode: 'light' | 'dark' | 'system') => {
      setThemeMode(mode);
      persistThemeMode(mode);
    },
    [setThemeMode, persistThemeMode],
  );

  const toggleTheme = useCallback(() => {
    const next = isDark ? 'light' : 'dark';
    setTheme(next);
  }, [isDark, setTheme]);

  return {
    theme,
    isDark,
    themeMode,
    setTheme,
    toggleTheme,
    colors: theme.colors,
    typography: theme.typography,
    spacing: theme.spacing,
    borderRadius: theme.borderRadius,
  };
}
