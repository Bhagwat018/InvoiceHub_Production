import { useCallback, useEffect, useState } from 'react';
import { Q } from '@nozbe/watermelondb';
import { productsCollection } from '../database';
import { productRepository } from '../database/repositories/ProductRepository';
import type { PaginationParams, PaginatedResponse } from '../types';
import Product from '../database/models/Product';

export function useProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await productRepository.getAll();
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    const subscription = productsCollection
      .query(Q.where('is_deleted', false), Q.where('is_active', true))
      .observe()
      .subscribe({
        next: (data) => {
          setProducts(data);
          setIsLoading(false);
        },
        error: (err) => setError(err.message),
      });

    return () => subscription.unsubscribe();
  }, []);

  const createProduct = useCallback(async (data: Parameters<typeof productRepository.create>[0]) => {
    try {
      const product = await productRepository.create(data);
      return product;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create product');
      throw err;
    }
  }, []);

  const updateProduct = useCallback(
    async (id: string, data: Parameters<typeof productRepository.update>[1]) => {
      try {
        const product = await productRepository.update(id, data);
        return product;
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to update product');
        throw err;
      }
    },
    [],
  );

  const deleteProduct = useCallback(async (id: string) => {
    try {
      await productRepository.softDelete(id);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete product');
      throw err;
    }
  }, []);

  const searchProducts = useCallback(async (query: string): Promise<Product[]> => {
    try {
      return await productRepository.search(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to search products');
      return [];
    }
  }, []);

  const getProduct = useCallback(async (id: string): Promise<Product> => {
    return productRepository.getById(id);
  }, []);

  const getByCategory = useCallback(async (category: string): Promise<Product[]> => {
    return productRepository.getByCategory(category);
  }, []);

  const getLowStock = useCallback(async (): Promise<Product[]> => {
    return productRepository.getLowStock();
  }, []);

  const getPaginated = useCallback(
    async (params: PaginationParams): Promise<PaginatedResponse<Product>> => {
      return productRepository.getPaginated(params);
    },
    [],
  );

  const getProductCount = useCallback(async (): Promise<number> => {
    return productRepository.getCount();
  }, []);

  const reduceStock = useCallback(async (id: string, quantity: number) => {
    try {
      return await productRepository.reduceStock(id, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reduce stock');
      throw err;
    }
  }, []);

  const increaseStock = useCallback(async (id: string, quantity: number) => {
    try {
      return await productRepository.increaseStock(id, quantity);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to increase stock');
      throw err;
    }
  }, []);

  return {
    products,
    isLoading,
    error,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    searchProducts,
    getProduct,
    getByCategory,
    getLowStock,
    getPaginated,
    getProductCount,
    reduceStock,
    increaseStock,
  };
}
