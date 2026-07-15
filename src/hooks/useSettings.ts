import { useCallback } from 'react';
import { useSettingsStore } from '../storage/stores/settingsStore';
import { useAppStore } from '../storage/stores/appStore';
import { storage } from '../storage';

export function useSettings() {
  const business = useSettingsStore((s) => s.business);
  const tax = useSettingsStore((s) => s.tax);
  const print = useSettingsStore((s) => s.print);
  const notifications = useSettingsStore((s) => s.notifications);
  const currency = useSettingsStore((s) => s.currency);
  const language = useSettingsStore((s) => s.language);
  const dateFormat = useSettingsStore((s) => s.dateFormat);
  const themeMode = useSettingsStore((s) => s.themeMode);
  const isIgstApplicable = useSettingsStore((s) => s.isIgstApplicable);
  const setBusiness = useSettingsStore((s) => s.setBusiness);
  const setTax = useSettingsStore((s) => s.setTax);
  const setPrint = useSettingsStore((s) => s.setPrint);
  const setNotifications = useSettingsStore((s) => s.setNotifications);
  const setCurrency = useSettingsStore((s) => s.setCurrency);
  const setLanguage = useSettingsStore((s) => s.setLanguage);
  const setDateFormat = useSettingsStore((s) => s.setDateFormat);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setIgstApplicable = useSettingsStore((s) => s.setIgstApplicable);
  const resetSettings = useSettingsStore((s) => s.reset);

  const appStoreCurrency = useAppStore((s) => s.currency);
  const appStoreSetCurrency = useAppStore((s) => s.setCurrency);
  const appStoreLanguage = useAppStore((s) => s.language);
  const appStoreSetLanguage = useAppStore((s) => s.setLanguage);

  const updateCurrency = useCallback(
    (curr: string) => {
      setCurrency(curr);
      appStoreSetCurrency(curr);
      storage.currency.set(curr);
    },
    [setCurrency, appStoreSetCurrency],
  );

  const updateLanguage = useCallback(
    (lang: string) => {
      setLanguage(lang);
      appStoreSetLanguage(lang);
      storage.language.set(lang);
    },
    [setLanguage, appStoreSetLanguage],
  );

  const updateDateFormat = useCallback(
    (format: string) => {
      setDateFormat(format);
      storage.dateFormat.set(format);
    },
    [setDateFormat],
  );

  const updateThemeMode = useCallback(
    (mode: 'light' | 'dark' | 'system') => {
      setThemeMode(mode);
      storage.theme.set(mode);
    },
    [setThemeMode],
  );

  const updateBusinessProfile = useCallback(
    (data: Parameters<typeof setBusiness>[0]) => {
      setBusiness(data);
    },
    [setBusiness],
  );

  const updateTaxSettings = useCallback(
    (data: Parameters<typeof setTax>[0]) => {
      setTax(data);
      if (data.isIgstApplicable !== undefined) {
        setIgstApplicable(data.isIgstApplicable);
      }
    },
    [setTax, setIgstApplicable],
  );

  const resetAll = useCallback(() => {
    resetSettings();
    storage.clearAll();
  }, [resetSettings]);

  return {
    business,
    tax,
    print,
    notifications,
    currency,
    language,
    dateFormat,
    themeMode,
    isIgstApplicable,
    setBusiness: updateBusinessProfile,
    setTax: updateTaxSettings,
    setPrint,
    setNotifications,
    setCurrency: updateCurrency,
    setLanguage: updateLanguage,
    setDateFormat: updateDateFormat,
    setThemeMode: updateThemeMode,
    setIgstApplicable,
    resetAll,
  };
}
