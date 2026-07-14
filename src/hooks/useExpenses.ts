import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { expensesCollection } from '../database';
import { expenseRepository } from '../database/repositories/ExpenseRepository';
import type { PaginationParams, PaginatedResponse } from '../types';
import Expense from '../database/models/Expense';

export function useExpenses() {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const result = await expenseRepository.getPaginated({
        page: 1,
        limit: 100,
        sortBy: 'created_at',
        sortOrder: 'desc',
      });
      setExpenses(result.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch expenses');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchExpenses();
  }, [fetchExpenses]);

  useEffect(() => {
    const subscription = expensesCollection
      .query(Q.where('is_deleted', false), Q.sortBy('created_at', 'desc'))
      .observe()
      .subscribe({
        next: (data) => {
          setExpenses(data);
          setIsLoading(false);
        },
        error: (err) => setError(err.message),
      });

    return () => subscription.unsubscribe();
  }, []);

  const createExpense = useCallback(
    async (data: Parameters<typeof expenseRepository.createExpense>[0]) => {
      try {
        const expense = await expenseRepository.createExpense(data);
        return expense;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to create expense');
        throw err;
      }
    },
    [],
  );

  const updateExpense = useCallback(
    async (id: string, data: Parameters<typeof expenseRepository.updateExpense>[1]) => {
      try {
        return await expenseRepository.updateExpense(id, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update expense');
        throw err;
      }
    },
    [],
  );

  const deleteExpense = useCallback(async (id: string) => {
    try {
      await expenseRepository.softDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete expense');
      throw err;
    }
  }, []);

  const getExpense = useCallback(async (id: string): Promise<Expense> => {
    return expenseRepository.getById(id);
  }, []);

  const getByDateRange = useCallback(async (start: Date, end: Date): Promise<Expense[]> => {
    return expenseRepository.getByDateRange(start, end);
  }, []);

  const getByCategory = useCallback(async (categoryId: string): Promise<Expense[]> => {
    return expenseRepository.getByCategory(categoryId);
  }, []);

  const getRecurring = useCallback(async (): Promise<Expense[]> => {
    return expenseRepository.getRecurring();
  }, []);

  const getNextExpenseNumber = useCallback(async (prefix?: string): Promise<string> => {
    return expenseRepository.getNextExpenseNumber(prefix);
  }, []);

  const getTotalByDateRange = useCallback(async (start: Date, end: Date): Promise<number> => {
    return expenseRepository.getTotalByDateRange(start, end);
  }, []);

  const getPaginated = useCallback(
    async (params: PaginationParams): Promise<PaginatedResponse<Expense>> => {
      return expenseRepository.getPaginated(params);
    },
    [],
  );

  const getRecent = useCallback(async (limit?: number): Promise<Expense[]> => {
    return expenseRepository.getRecent(limit);
  }, []);

  const getExpenseCount = useCallback(async (): Promise<number> => {
    return expenseRepository.getCount();
  }, []);

  const createCategory = useCallback(async (data: Parameters<typeof expenseRepository.createCategory>[0]) => {
    try {
      return await expenseRepository.createCategory(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create category');
      throw err;
    }
  }, []);

  const getAllCategories = useCallback(async () => {
    return expenseRepository.getAllCategories();
  }, []);

  return {
    expenses,
    isLoading,
    error,
    fetchExpenses,
    createExpense,
    updateExpense,
    deleteExpense,
    getExpense,
    getByDateRange,
    getByCategory,
    getRecurring,
    getNextExpenseNumber,
    getTotalByDateRange,
    getPaginated,
    getRecent,
    getExpenseCount,
    createCategory,
    getAllCategories,
  };
}
