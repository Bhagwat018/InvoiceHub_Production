import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { customersCollection, database } from '../database';
import { customerRepository } from '../database/repositories/CustomerRepository';
import type { PaginationParams, PaginatedResponse } from '../types';
import Customer from '../database/models/Customer';

export function useCustomers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await customerRepository.getAll();
      setCustomers(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customers');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);

  useEffect(() => {
    const subscription = customersCollection
      .query(Q.where('is_deleted', false))
      .observe()
      .subscribe({
        next: (data) => {
          setCustomers(data);
          setIsLoading(false);
        },
        error: (err) => setError(err.message),
      });

    return () => subscription.unsubscribe();
  }, []);

  const createCustomer = useCallback(async (data: Parameters<typeof customerRepository.create>[0]) => {
    try {
      const customer = await customerRepository.create(data);
      return customer;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create customer');
      throw err;
    }
  }, []);

  const updateCustomer = useCallback(
    async (id: string, data: Parameters<typeof customerRepository.update>[1]) => {
      try {
        const customer = await customerRepository.update(id, data);
        return customer;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update customer');
        throw err;
      }
    },
    [],
  );

  const deleteCustomer = useCallback(async (id: string) => {
    try {
      await customerRepository.softDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete customer');
      throw err;
    }
  }, []);

  const searchCustomers = useCallback(async (query: string): Promise<Customer[]> => {
    try {
      return await customerRepository.search(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search customers');
      return [];
    }
  }, []);

  const getCustomer = useCallback(async (id: string): Promise<Customer> => {
    return customerRepository.getById(id);
  }, []);

  const getFavorites = useCallback(async (): Promise<Customer[]> => {
    return customerRepository.getFavorites();
  }, []);

  const getWithOutstanding = useCallback(async (): Promise<Customer[]> => {
    return customerRepository.getWithOutstanding();
  }, []);

  const getPaginated = useCallback(
    async (params: PaginationParams): Promise<PaginatedResponse<Customer>> => {
      return customerRepository.getPaginated(params);
    },
    [],
  );

  const getCustomerCount = useCallback(async (): Promise<number> => {
    return customerRepository.getCount();
  }, []);

  return {
    customers,
    isLoading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    searchCustomers,
    getCustomer,
    getFavorites,
    getWithOutstanding,
    getPaginated,
    getCustomerCount,
  };
}
