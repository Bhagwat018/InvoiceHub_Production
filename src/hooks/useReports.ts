import { useCallback, useEffect, useState } from 'react';
import { reportsRepository } from '../database/repositories/ReportsRepository';
import { useDashboardStore } from '../storage/stores/dashboardStore';
import type {
  RevenueSummary,
  MonthlyRevenue,
  CustomerReceivable,
  CategoryWiseExpense,
  TopProduct,
} from '../database/repositories/ReportsRepository';

export function useReports() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setStats = useDashboardStore((s) => s.setStats);

  const getRevenueSummary = useCallback(async (): Promise<RevenueSummary> => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await reportsRepository.getRevenueSummary();
      return data;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to get revenue summary';
      setError(msg);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getMonthlyRevenue = useCallback(async (year: number): Promise<MonthlyRevenue[]> => {
    try {
      return await reportsRepository.getMonthlyRevenue(year);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get monthly revenue');
      throw err;
    }
  }, []);

  const getCustomerReceivables = useCallback(async (): Promise<CustomerReceivable[]> => {
    try {
      return await reportsRepository.getCustomerReceivables();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get customer receivables');
      throw err;
    }
  }, []);

  const getCategoryWiseExpenses = useCallback(
    async (start?: Date, end?: Date): Promise<CategoryWiseExpense[]> => {
      try {
        return await reportsRepository.getCategoryWiseExpenses(start, end);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get expense breakdown');
        throw err;
      }
    },
    [],
  );

  const getTopProducts = useCallback(async (limit?: number): Promise<TopProduct[]> => {
    try {
      return await reportsRepository.getTopProducts(limit);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get top products');
      throw err;
    }
  }, []);

  const getGstSummary = useCallback(
    async (start?: Date, end?: Date) => {
      try {
        return await reportsRepository.getGstSummary(start, end);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to get GST summary');
        throw err;
      }
    },
    [],
  );

  const getInvoiceStatusCounts = useCallback(async (): Promise<Record<string, number>> => {
    try {
      return await reportsRepository.getInvoiceStatusWiseCount();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get status counts');
      throw err;
    }
  }, []);

  const getOverdueInvoices = useCallback(async () => {
    try {
      return await reportsRepository.getOverdueInvoices();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get overdue invoices');
      throw err;
    }
  }, []);

  const refreshDashboard = useCallback(async () => {
    try {
      setIsLoading(true);
      const [summary, monthly, customers, expenses, statusCounts, overdue] = await Promise.all([
        reportsRepository.getRevenueSummary(),
        reportsRepository.getMonthlyRevenue(new Date().getFullYear()),
        reportsRepository.getCustomerReceivables(),
        reportsRepository.getCategoryWiseExpenses(),
        reportsRepository.getInvoiceStatusWiseCount(),
        reportsRepository.getOverdueInvoices(),
      ]);

      setStats({
        totalRevenue: summary.totalRevenue,
        totalExpenses: summary.totalExpenses,
        netProfit: summary.netProfit,
        totalReceivable: summary.totalReceivable,
        totalPaid: summary.totalPaid,
        totalPending: summary.totalPending,
        totalOverdue: summary.totalOverdue,
        totalCustomers: summary.totalCustomers,
        totalInvoices: summary.totalInvoices,
        monthlyRevenue: monthly.map((m) => ({ month: m.month, amount: m.revenue })),
        topCustomers: customers.slice(0, 10).map((c) => ({
          customerId: c.customerId,
          customerName: c.customerName,
          amount: c.totalInvoiced,
        })),
        expenseBreakdown: expenses.map((e) => ({
          category: e.category,
          amount: e.total,
        })),
        invoiceStatusCounts: statusCounts,
        recentInvoices: [],
        recentPayments: [],
      });

      return summary;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to refresh dashboard');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [setStats]);

  return {
    isLoading,
    error,
    getRevenueSummary,
    getMonthlyRevenue,
    getCustomerReceivables,
    getCategoryWiseExpenses,
    getTopProducts,
    getGstSummary,
    getInvoiceStatusCounts,
    getOverdueInvoices,
    refreshDashboard,
  };
}
