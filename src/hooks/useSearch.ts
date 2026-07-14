import { useCallback, useEffect, useRef, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import {
  customersCollection,
  productsCollection,
  invoicesCollection,
  expensesCollection,
  paymentsCollection,
} from '../database';
import { storage } from '../storage';
import type Customer from '../database/models/Customer';
import type Product from '../database/models/Product';
import type Invoice from '../database/models/Invoice';
import type Expense from '../database/models/Expense';
import type Payment from '../database/models/Payment';

export interface SearchResult {
  customers: Customer[];
  products: Product[];
  invoices: Invoice[];
  expenses: Expense[];
  payments: Payment[];
  total: number;
}

export function useSearch() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult>({
    customers: [],
    products: [],
    invoices: [],
    expenses: [],
    payments: [],
    total: 0,
  });
  const [isSearching, setIsSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const search = useCallback(async (searchQuery: string): Promise<SearchResult> => {
    if (!searchQuery.trim()) {
      return { customers: [], products: [], invoices: [], expenses: [], payments: [], total: 0 };
    }

    const q = searchQuery.toLowerCase();
    const likeQuery = `%${q}%`;

    try {
      const [customers, products, invoices, expenses, payments] = await Promise.all([
        customersCollection
          .query(
            Q.where('is_deleted', false),
            Q.or(
              Q.where('name', Q.like(likeQuery)),
              Q.where('email', Q.like(likeQuery)),
              Q.where('phone', Q.like(likeQuery)),
              Q.where('gst_number', Q.like(likeQuery)),
            ),
          )
          .fetch(),
        productsCollection
          .query(
            Q.where('is_deleted', false),
            Q.or(
              Q.where('name', Q.like(likeQuery)),
              Q.where('sku', Q.like(likeQuery)),
              Q.where('barcode', Q.like(likeQuery)),
              Q.where('category', Q.like(likeQuery)),
            ),
          )
          .fetch(),
        invoicesCollection
          .query(
            Q.where('is_deleted', false),
            Q.or(
              Q.where('invoice_number', Q.like(likeQuery)),
              Q.where('notes', Q.like(likeQuery)),
            ),
          )
          .fetch(),
        expensesCollection
          .query(
            Q.where('is_deleted', false),
            Q.or(
              Q.where('description', Q.like(likeQuery)),
              Q.where('vendor_name', Q.like(likeQuery)),
              Q.where('expense_number', Q.like(likeQuery)),
            ),
          )
          .fetch(),
        paymentsCollection
          .query(
            Q.where('is_deleted', false),
            Q.or(
              Q.where('payment_number', Q.like(likeQuery)),
              Q.where('reference_number', Q.like(likeQuery)),
            ),
          )
          .fetch(),
      ]);

      return {
        customers,
        products,
        invoices,
        expenses,
        payments,
        total: customers.length + products.length + invoices.length + expenses.length + payments.length,
      };
    } catch (err) {
      console.error('[useSearch] Search failed:', err);
      return { customers: [], products: [], invoices: [], expenses: [], payments: [], total: 0 };
    }
  }, []);

  const executeSearch = useCallback(
    async (searchQuery: string) => {
      setIsSearching(true);
      setQuery(searchQuery);

      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }

      debounceRef.current = setTimeout(async () => {
        try {
          const result = await search(searchQuery);
          setResults(result);
          if (searchQuery.trim()) {
            storage.search.addToHistory(searchQuery.trim());
          }
        } finally {
          setIsSearching(false);
        }
      }, 300);
    },
    [search],
  );

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults({ customers: [], products: [], invoices: [], expenses: [], payments: [], total: 0 });
    setIsSearching(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  const getHistory = useCallback((): string[] => {
    return storage.search.getHistory();
  }, []);

  const clearHistory = useCallback(() => {
    storage.search.clearHistory();
  }, []);

  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return {
    query,
    results,
    isSearching,
    search: executeSearch,
    clearSearch,
    getHistory,
    clearHistory,
  };
}
