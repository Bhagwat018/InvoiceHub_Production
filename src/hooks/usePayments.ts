import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { paymentsCollection } from '../database';
import { paymentRepository } from '../database/repositories/PaymentRepository';
import { invoiceRepository } from '../database/repositories/InvoiceRepository';
import { customerRepository } from '../database/repositories/CustomerRepository';
import type { PaginationParams, PaginatedResponse } from '../types';
import Payment from '../database/models/Payment';

export function usePayments() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchPayments = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await paymentRepository.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setPayments(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch payments');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPayments();
  }, [fetchPayments]);

  useEffect(() => {
    const subscription = paymentsCollection
      .query(Q.where('is_deleted', false), Q.sortBy('created_at', 'desc'))
      .observe()
      .subscribe({
        next: (data) => {
          setPayments(data);
          setIsLoading(false);
        },
        error: (err) => setError(err.message),
      });

    return () => subscription.unsubscribe();
  }, []);

  const createPayment = useCallback(
    async (data: Parameters<typeof paymentRepository.create>[0]) => {
      try {
        const payment = await paymentRepository.create(data);
        await invoiceRepository.recordPayment(data.invoiceId, data.amount);
        await customerRepository.updateOutstanding(data.customerId);
        return payment;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create payment');
        throw err;
      }
    },
    [],
  );

  const updatePayment = useCallback(
    async (id: string, data: Parameters<typeof paymentRepository.update>[1]) => {
      try {
        return await paymentRepository.update(id, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update payment');
        throw err;
      }
    },
    [],
  );

  const deletePayment = useCallback(async (id: string) => {
    try {
      await paymentRepository.softDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete payment');
      throw err;
    }
  }, []);

  const getPayment = useCallback(async (id: string): Promise<Payment> => {
    return paymentRepository.getById(id);
  }, []);

  const getByInvoice = useCallback(async (invoiceId: string): Promise<Payment[]> => {
    return paymentRepository.getByInvoice(invoiceId);
  }, []);

  const getByCustomer = useCallback(async (customerId: string): Promise<Payment[]> => {
    return paymentRepository.getByCustomer(customerId);
  }, []);

  const getByDateRange = useCallback(async (start: Date, end: Date): Promise<Payment[]> => {
    return paymentRepository.getByDateRange(start, end);
  }, []);

  const getNextPaymentNumber = useCallback(async (prefix?: string): Promise<string> => {
    return paymentRepository.getNextPaymentNumber(prefix);
  }, []);

  const getPaginated = useCallback(
    async (params: PaginationParams): Promise<PaginatedResponse<Payment>> => {
      return paymentRepository.getPaginated(params);
    },
    [],
  );

  const getRecent = useCallback(async (limit?: number): Promise<Payment[]> => {
    return paymentRepository.getRecent(limit);
  }, []);

  const getPaymentCount = useCallback(async (): Promise<number> => {
    return paymentRepository.getCount();
  }, []);

  return {
    payments,
    isLoading,
    error,
    fetchPayments,
    createPayment,
    updatePayment,
    deletePayment,
    getPayment,
    getByInvoice,
    getByCustomer,
    getByDateRange,
    getNextPaymentNumber,
    getPaginated,
    getRecent,
    getPaymentCount,
  };
}
