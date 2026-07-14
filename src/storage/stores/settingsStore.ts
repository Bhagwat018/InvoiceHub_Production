import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMmkvStorage } from './mmkvAdapter';
import { StorageKeys } from '../keys';

interface PrintSettings {
  showLogo: boolean;
  showSignature: boolean;
  showBankDetails: boolean;
  showTermsAndConditions: boolean;
  showCustomerGstin: boolean;
  showHsnCode: boolean;
  paperSize: 'A4' | 'A5' | 'Letter';
  orientation: 'portrait' | 'landscape';
}

interface NotificationSettings {
  invoiceReminders: boolean;
  paymentReminders: boolean;
  overdueAlerts: boolean;
  backupReminders: boolean;
  reminderDaysBefore: number;
}

interface BusinessInfo {
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  website: string;
  gstNumber: string;
  panNumber: string;
  logo: string | null;
  signature: string | null;
  bankName: string;
  bankAccountNumber: string;
  bankIfsc: string;
  bankBranch: string;
  upiId: string;
  invoicePrefix: string;
  invoiceStartNumber: number;
  defaultPaymentTerms: string;
  defaultNotes: string;
}

interface TaxInfo {
  gstRegistered: boolean;
  gstNumber: string;
  gstType: 'regular' | 'composition';
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  isIgstApplicable: boolean;
  hsnCode: string;
  sacCode: string;
  stateCode: string;
}

interface SettingsState {
  business: BusinessInfo;
  tax: TaxInfo;
  print: PrintSettings;
  notifications: NotificationSettings;
  currency: string;
  language: string;
  dateFormat: string;
  themeMode: 'light' | 'dark' | 'system';
  isIgstApplicable: boolean;

  setBusiness: (info: Partial<BusinessInfo>) => void;
  setTax: (info: Partial<TaxInfo>) => void;
  setPrint: (settings: Partial<PrintSettings>) => void;
  setNotifications: (settings: Partial<NotificationSettings>) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (lang: string) => void;
  setDateFormat: (format: string) => void;
  setThemeMode: (mode: 'light' | 'dark' | 'system') => void;
  setIgstApplicable: (applicable: boolean) => void;
  reset: () => void;
}

const defaultBusiness: BusinessInfo = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  website: '',
  gstNumber: '',
  panNumber: '',
  logo: null,
  signature: null,
  bankName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  bankBranch: '',
  upiId: '',
  invoicePrefix: 'INV',
  invoiceStartNumber: 1,
  defaultPaymentTerms: 'Net 30',
  defaultNotes: '',
};

const defaultTax: TaxInfo = {
  gstRegistered: true,
  gstNumber: '',
  gstType: 'regular',
  gstRate: 18,
  cgstRate: 9,
  sgstRate: 9,
  igstRate: 18,
  isIgstApplicable: false,
  hsnCode: '',
  sacCode: '',
  stateCode: '',
};

const defaultPrint: PrintSettings = {
  showLogo: true,
  showSignature: true,
  showBankDetails: true,
  showTermsAndConditions: true,
  showCustomerGstin: true,
  showHsnCode: true,
  paperSize: 'A4',
  orientation: 'portrait',
};

const defaultNotifications: NotificationSettings = {
  invoiceReminders: true,
  paymentReminders: true,
  overdueAlerts: true,
  backupReminders: true,
  reminderDaysBefore: 3,
};

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      business: defaultBusiness,
      tax: defaultTax,
      print: defaultPrint,
      notifications: defaultNotifications,
      currency: 'INR',
      language: 'en',
      dateFormat: 'DD/MM/YYYY',
      themeMode: 'system',
      isIgstApplicable: false,

      setBusiness: (info) =>
        set((state) => ({ business: { ...state.business, ...info } })),

      setTax: (info) =>
        set((state) => ({ tax: { ...state.tax, ...info } })),

      setPrint: (settings) =>
        set((state) => ({ print: { ...state.print, ...settings } })),

      setNotifications: (settings) =>
        set((state) => ({ notifications: { ...state.notifications, ...settings } })),

      setCurrency: (currency) => set({ currency }),
      setLanguage: (lang) => set({ language: lang }),
      setDateFormat: (format) => set({ dateFormat: format }),
      setThemeMode: (mode) => set({ themeMode: mode }),
      setIgstApplicable: (applicable) => set({ isIgstApplicable: applicable }),

      reset: () =>
        set({
          business: defaultBusiness,
          tax: defaultTax,
          print: defaultPrint,
          notifications: defaultNotifications,
          currency: 'INR',
          language: 'en',
          dateFormat: 'DD/MM/YYYY',
          themeMode: 'system',
          isIgstApplicable: false,
        }),
    }),
    {
      name: 'invoicehub-settings',
      storage: createJSONStorage(() => createMmkvStorage(StorageKeys.SETTINGS_STATE as any)),
    }
  )
);
