import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { invoicesCollection } from '../database';
import { invoiceRepository } from '../database/repositories/InvoiceRepository';
import { useDashboardStore } from '../storage/stores/dashboardStore';
import type { PaginationParams, PaginatedResponse } from '../types';
import Invoice from '../database/models/Invoice';

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const incrementInvoiceCount = useDashboardStore((s) => s.incrementInvoiceCount);

  const fetchInvoices = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await invoiceRepository.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setInvoices(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch invoices');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInvoices();
  }, [fetchInvoices]);

  useEffect(() => {
    const subscription = invoicesCollection
      .query(Q.where('is_deleted', false), Q.sortBy('created_at', 'desc'))
      .observe()
      .subscribe({
        next: (data) => {
          setInvoices(data);
          setIsLoading(false);
        },
        error: (err) => setError(err.message),
      });

    return () => subscription.unsubscribe();
  }, []);

  const createInvoice = useCallback(
    async (data: Parameters<typeof invoiceRepository.create>[0]) => {
      try {
        const invoice = await invoiceRepository.create(data);
        incrementInvoiceCount();
        return invoice;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create invoice');
        throw err;
      }
    },
    [incrementInvoiceCount],
  );

  const updateInvoice = useCallback(
    async (id: string, data: Parameters<typeof invoiceRepository.update>[1]) => {
      try {
        return await invoiceRepository.update(id, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update invoice');
        throw err;
      }
    },
    [],
  );

  const deleteInvoice = useCallback(async (id: string) => {
    try {
      await invoiceRepository.softDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete invoice');
      throw err;
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: string) => {
    try {
      return await invoiceRepository.updateStatus(id, status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
      throw err;
    }
  }, []);

  const recordPayment = useCallback(async (id: string, amount: number) => {
    try {
      return await invoiceRepository.recordPayment(id, amount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to record payment');
      throw err;
    }
  }, []);

  const getInvoice = useCallback(async (id: string): Promise<Invoice> => {
    return invoiceRepository.getById(id);
  }, []);

  const getItems = useCallback(async (invoiceId: string) => {
    return invoiceRepository.getItems(invoiceId);
  }, []);

  const getByStatus = useCallback(async (status: string): Promise<Invoice[]> => {
    return invoiceRepository.getByStatus(status);
  }, []);

  const getByCustomer = useCallback(async (customerId: string): Promise<Invoice[]> => {
    return invoiceRepository.getByCustomer(customerId);
  }, []);

  const getOverdue = useCallback(async (): Promise<Invoice[]> => {
    return invoiceRepository.getOverdue();
  }, []);

  const getNextInvoiceNumber = useCallback(async (prefix?: string): Promise<string> => {
    return invoiceRepository.getNextInvoiceNumber(prefix);
  }, []);

  const getPaginated = useCallback(
    async (params: PaginationParams): Promise<PaginatedResponse<Invoice>> => {
      return invoiceRepository.getPaginated(params);
    },
    [],
  );

  const getInvoiceCount = useCallback(async (): Promise<number> => {
    return invoiceRepository.getCount();
  }, []);

  return {
    invoices,
    isLoading,
    error,
    fetchInvoices,
    createInvoice,
    updateInvoice,
    deleteInvoice,
    updateStatus,
    recordPayment,
    getInvoice,
    getItems,
    getByStatus,
    getByCustomer,
    getOverdue,
    getNextInvoiceNumber,
    getPaginated,
    getInvoiceCount,
  };
}
