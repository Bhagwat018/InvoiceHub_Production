import { StorageKeys } from './keys';
import { mmkvStorage } from './MmkvStorage';
import type {
  ThemeColors,
  BusinessProfile,
  TaxSettings,
} from '../types';

export { StorageKeys } from './keys';
export { mmkvStorage } from './MmkvStorage';

export const storage = {
  theme: {
    get: (): 'light' | 'dark' | 'system' => {
      return (mmkvStorage.getString(StorageKeys.THEME) as 'light' | 'dark' | 'system') ?? 'system';
    },
    set: (value: 'light' | 'dark' | 'system'): void => {
      mmkvStorage.setString(StorageKeys.THEME, value);
    },
  },

  language: {
    get: (): string => {
      return mmkvStorage.getString(StorageKeys.LANGUAGE) ?? 'en';
    },
    set: (value: string): void => {
      mmkvStorage.setString(StorageKeys.LANGUAGE, value);
    },
  },

  currency: {
    get: (): string => {
      return mmkvStorage.getString(StorageKeys.CURRENCY) ?? 'INR';
    },
    set: (value: string): void => {
      mmkvStorage.setString(StorageKeys.CURRENCY, value);
    },
  },

  dateFormat: {
    get: (): string => {
      return mmkvStorage.getString(StorageKeys.DATE_FORMAT) ?? 'DD/MM/YYYY';
    },
    set: (value: string): void => {
      mmkvStorage.setString(StorageKeys.DATE_FORMAT, value);
    },
  },

  auth: {
    getToken: (): string | undefined => {
      return mmkvStorage.getString(StorageKeys.AUTH_TOKEN);
    },
    setToken: (token: string): void => {
      mmkvStorage.setString(StorageKeys.AUTH_TOKEN, token);
    },
    getRefreshToken: (): string | undefined => {
      return mmkvStorage.getString(StorageKeys.REFRESH_TOKEN);
    },
    setRefreshToken: (token: string): void => {
      mmkvStorage.setString(StorageKeys.REFRESH_TOKEN, token);
    },
    getUserId: (): string | undefined => {
      return mmkvStorage.getString(StorageKeys.USER_ID);
    },
    setUserId: (id: string): void => {
      mmkvStorage.setString(StorageKeys.USER_ID, id);
    },
    clear: (): void => {
      mmkvStorage.remove(StorageKeys.AUTH_TOKEN);
      mmkvStorage.remove(StorageKeys.REFRESH_TOKEN);
      mmkvStorage.remove(StorageKeys.USER_ID);
      mmkvStorage.remove(StorageKeys.USER_EMAIL);
    },
  },

  businessProfile: {
    get: (): BusinessProfile | undefined => {
      return mmkvStorage.getObject<BusinessProfile>(StorageKeys.BUSINESS_PROFILE_CACHE);
    },
    set: (profile: BusinessProfile): void => {
      mmkvStorage.setObject(StorageKeys.BUSINESS_PROFILE_CACHE, profile);
    },
    clear: (): void => {
      mmkvStorage.remove(StorageKeys.BUSINESS_PROFILE_CACHE);
    },
  },

  taxSettings: {
    get: (): TaxSettings | undefined => {
      return mmkvStorage.getObject<TaxSettings>(StorageKeys.TAX_SETTINGS_CACHE);
    },
    set: (settings: TaxSettings): void => {
      mmkvStorage.setObject(StorageKeys.TAX_SETTINGS_CACHE, settings);
    },
    clear: (): void => {
      mmkvStorage.remove(StorageKeys.TAX_SETTINGS_CACHE);
    },
  },

  invoice: {
    getPrefix: (): string => {
      return mmkvStorage.getString(StorageKeys.INVOICE_PREFIX) ?? 'INV';
    },
    setPrefix: (prefix: string): void => {
      mmkvStorage.setString(StorageKeys.INVOICE_PREFIX, prefix);
    },
  },

  expense: {
    getPrefix: (): string => {
      return mmkvStorage.getString(StorageKeys.EXPENSE_PREFIX) ?? 'EXP';
    },
    setPrefix: (prefix: string): void => {
      mmkvStorage.setString(StorageKeys.EXPENSE_PREFIX, prefix);
    },
  },

  payment: {
    getPrefix: (): string => {
      return mmkvStorage.getString(StorageKeys.PAYMENT_PREFIX) ?? 'PAY';
    },
    setPrefix: (prefix: string): void => {
      mmkvStorage.setString(StorageKeys.PAYMENT_PREFIX, prefix);
    },
  },

  onboarding: {
    isComplete: (): boolean => {
      return mmkvStorage.getBoolean(StorageKeys.ONBOARDING_COMPLETE) ?? false;
    },
    setComplete: (): void => {
      mmkvStorage.setBoolean(StorageKeys.ONBOARDING_COMPLETE, true);
    },
  },

  sortPreferences: {
    get: (entity: 'customer' | 'invoice' | 'product'): string | undefined => {
      const keyMap = {
        customer: StorageKeys.CUSTOMER_SORT_PREFERENCE,
        invoice: StorageKeys.INVOICE_SORT_PREFERENCE,
        product: StorageKeys.PRODUCT_SORT_PREFERENCE,
      };
      return mmkvStorage.getString(keyMap[entity]);
    },
    set: (entity: 'customer' | 'invoice' | 'product', value: string): void => {
      const keyMap = {
        customer: StorageKeys.CUSTOMER_SORT_PREFERENCE,
        invoice: StorageKeys.INVOICE_SORT_PREFERENCE,
        product: StorageKeys.PRODUCT_SORT_PREFERENCE,
      };
      mmkvStorage.setString(keyMap[entity], value);
    },
  },

  search: {
    getHistory: (): string[] => {
      return mmkvStorage.getObject<string[]>(StorageKeys.SEARCH_HISTORY) ?? [];
    },
    addToHistory: (query: string): void => {
      const history = storage.search.getHistory().filter((q) => q !== query);
      history.unshift(query);
      mmkvStorage.setObject(StorageKeys.SEARCH_HISTORY, history.slice(0, 20));
    },
    clearHistory: (): void => {
      mmkvStorage.setObject(StorageKeys.SEARCH_HISTORY, []);
    },
  },

  financial: {
    getYearStart: (): string | undefined => {
      return mmkvStorage.getString(StorageKeys.FINANCIAL_YEAR_START);
    },
    setYearStart: (date: string): void => {
      mmkvStorage.setString(StorageKeys.FINANCIAL_YEAR_START, date);
    },
  },

  clearAll: (): void => {
    mmkvStorage.clear();
  },

  clearAuthData: (): void => {
    storage.auth.clear();
  },

  export: (): Record<string, unknown> => {
    const keys = mmkvStorage.getAllKeys();
    const data: Record<string, unknown> = {};
    for (const key of keys) {
      const val = mmkvStorage.getString(key as any);
      if (val !== undefined) {
        try {
          data[key] = JSON.parse(val);
        } catch {
          data[key] = val;
        }
      }
    }
    return data;
  },
};
