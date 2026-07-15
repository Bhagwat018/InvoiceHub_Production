import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMmkvStorage } from './mmkvAdapter';
import { StorageKeys } from '../keys';

interface AppState {
  isInitialized: boolean;
  isDarkMode: boolean;
  themeMode: 'light' | 'dark' | 'system';
  language: string;
  currency: string;
  dateFormat: string;
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncTimestamp: number | null;
  showSplash: boolean;
  isFirstLaunch: boolean;

  setInitialized: (value: boolean) => void;
  setDarkMode: (value: boolean) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setLanguage: (lang: string) => void;
  setCurrency: (currency: string) => void;
  setDateFormat: (format: string) => void;
  setOnline: (online: boolean) => void;
  setSyncing: (syncing: boolean) => void;
  setLastSyncTimestamp: (ts: number) => void;
  setShowSplash: (show: boolean) => void;
  setFirstLaunch: (first: boolean) => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      isInitialized: false,
      isDarkMode: false,
      themeMode: 'system',
      language: 'en',
      currency: 'INR',
      dateFormat: 'DD/MM/YYYY',
      isOnline: true,
      isSyncing: false,
      lastSyncTimestamp: null,
      showSplash: true,
      isFirstLaunch: true,

      setInitialized: (value) =>
        set((state) => (state.isInitialized === value ? state : { isInitialized: value })),
      setDarkMode: (value) =>
        set((state) => (state.isDarkMode === value ? state : { isDarkMode: value })),
      setThemeMode: (mode) =>
        set((state) => (state.themeMode === mode ? state : { themeMode: mode })),
      setLanguage: (lang) => set({ language: lang }),
      setCurrency: (curr) => set({ currency: curr }),
      setDateFormat: (format) => set({ dateFormat: format }),
      setOnline: (online) => set({ isOnline: online }),
      setSyncing: (syncing) => set({ isSyncing: syncing }),
      setLastSyncTimestamp: (ts) => set({ lastSyncTimestamp: ts }),
      setShowSplash: (show) => set({ showSplash: show }),
      setFirstLaunch: (first) => set({ isFirstLaunch: first }),
    }),
    {
      name: 'invoicehub-app-state',
      storage: createJSONStorage(() => createMmkvStorage(StorageKeys.APP_STATE as any)),
      partialize: (state) => ({
        themeMode: state.themeMode,
        language: state.language,
        currency: state.currency,
        dateFormat: state.dateFormat,
        isFirstLaunch: state.isFirstLaunch,
        isDarkMode: state.isDarkMode,
      }),
    }
  )
);
