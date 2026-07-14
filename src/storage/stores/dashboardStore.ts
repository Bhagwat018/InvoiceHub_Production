import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { createMmkvStorage } from './mmkvAdapter';
import { StorageKeys } from '../keys';

interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalReceivable: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalCustomers: number;
  totalInvoices: number;
  monthlyRevenue: { month: string; amount: number }[];
  topCustomers: { customerId: string; customerName: string; amount: number }[];
  expenseBreakdown: { category: string; amount: number }[];
  invoiceStatusCounts: Record<string, number>;
  recentInvoices: any[];
  recentPayments: any[];
}

interface DashboardState {
  stats: DashboardStats;
  isLoading: boolean;
  error: string | null;
  lastFetched: number | null;
  selectedPeriod: 'week' | 'month' | 'quarter' | 'year';
  selectedYear: number;

  setStats: (stats: DashboardStats) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setLastFetched: (ts: number) => void;
  setSelectedPeriod: (period: 'week' | 'month' | 'quarter' | 'year') => void;
  setSelectedYear: (year: number) => void;
  updateRevenue: (revenue: number) => void;
  updateExpenses: (expenses: number) => void;
  incrementInvoiceCount: () => void;
  decrementInvoiceCount: () => void;
  incrementCustomerCount: () => void;
  refreshNeeded: () => boolean;
  reset: () => void;
}

const initialStats: DashboardStats = {
  totalRevenue: 0,
  totalExpenses: 0,
  netProfit: 0,
  totalReceivable: 0,
  totalPaid: 0,
  totalPending: 0,
  totalOverdue: 0,
  totalCustomers: 0,
  totalInvoices: 0,
  monthlyRevenue: [],
  topCustomers: [],
  expenseBreakdown: [],
  invoiceStatusCounts: {},
  recentInvoices: [],
  recentPayments: [],
};

export const useDashboardStore = create<DashboardState>()(
  persist(
    (set, get) => ({
      stats: initialStats,
      isLoading: false,
      error: null,
      lastFetched: null,
      selectedPeriod: 'month',
      selectedYear: new Date().getFullYear(),

      setStats: (stats) => set({ stats, lastFetched: Date.now(), error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error, isLoading: false }),
      setLastFetched: (ts) => set({ lastFetched: ts }),
      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setSelectedYear: (year) => set({ selectedYear: year }),

      updateRevenue: (revenue) =>
        set((state) => ({
          stats: { ...state.stats, totalRevenue: revenue, netProfit: revenue - state.stats.totalExpenses },
        })),

      updateExpenses: (expenses) =>
        set((state) => ({
          stats: { ...state.stats, totalExpenses: expenses, netProfit: state.stats.totalRevenue - expenses },
        })),

      incrementInvoiceCount: () =>
        set((state) => ({
          stats: { ...state.stats, totalInvoices: state.stats.totalInvoices + 1 },
        })),

      decrementInvoiceCount: () =>
        set((state) => ({
          stats: { ...state.stats, totalInvoices: Math.max(0, state.stats.totalInvoices - 1) },
        })),

      incrementCustomerCount: () =>
        set((state) => ({
          stats: { ...state.stats, totalCustomers: state.stats.totalCustomers + 1 },
        })),

      refreshNeeded: () => {
        const { lastFetched } = get();
        if (!lastFetched) return true;
        return Date.now() - lastFetched > 5 * 60 * 1000;
      },

      reset: () => set({ stats: initialStats, lastFetched: null, error: null }),
    }),
    {
      name: 'invoicehub-dashboard',
      storage: createJSONStorage(() => createMmkvStorage(StorageKeys.DASHBOARD_STATE as any)),
      partialize: (state) => ({
        stats: state.stats,
        selectedPeriod: state.selectedPeriod,
        selectedYear: state.selectedYear,
        lastFetched: state.lastFetched,
      }),
    }
  )
);
