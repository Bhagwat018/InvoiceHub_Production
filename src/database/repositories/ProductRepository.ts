import { Q } from '@nozbe/watermelondb';
import { productsCollection, database } from '../index';
import Product from '../models/Product';
import { PaginationParams, PaginatedResponse } from '../../types';

export class ProductRepository {
  private collection = productsCollection;

  async create(data: {
    name: string;
    description?: string;
    sku?: string;
    barcode?: string;
    category?: string;
    unit?: string;
    purchasePrice: number;
    sellingPrice: number;
    taxRate?: number;
    taxType?: string;
    discount?: number;
    stockQuantity?: number;
    lowStockThreshold?: number;
    hsnCode?: string;
    imageUri?: string;
    isService?: boolean;
  }): Promise<Product> {
    return database.write(async () => {
      return this.collection.create((product) => {
        product.name = data.name;
        product.description = data.description ?? null;
        product.sku = data.sku ?? null;
        product.barcode = data.barcode ?? null;
        product.category = data.category ?? null;
        product.unit = data.unit ?? 'piece';
        product.purchasePrice = data.purchasePrice;
        product.sellingPrice = data.sellingPrice;
        product.taxRate = data.taxRate ?? 0;
        product.taxType = data.taxType ?? 'exclusive';
        product.discount = data.discount ?? 0;
        product.stockQuantity = data.stockQuantity ?? null;
        product.lowStockThreshold = data.lowStockThreshold ?? null;
        product.hsnCode = data.hsnCode ?? null;
        product.imageUri = data.imageUri ?? null;
        product.isService = data.isService ?? false;
        product.isActive = true;
        product.isDeleted = false;
      });
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    description: string | null;
    sku: string | null;
    barcode: string | null;
    category: string | null;
    unit: string;
    purchasePrice: number;
    sellingPrice: number;
    taxRate: number;
    taxType: string;
    discount: number;
    stockQuantity: number | null;
    lowStockThreshold: number | null;
    hsnCode: string | null;
    imageUri: string | null;
    isService: boolean;
    isActive: boolean;
  }>): Promise<Product> {
    const product = await this.collection.find(id);
    return database.write(async () => {
      return product.update((p) => {
        if (data.name !== undefined) p.name = data.name;
        if (data.description !== undefined) p.description = data.description;
        if (data.sku !== undefined) p.sku = data.sku;
        if (data.barcode !== undefined) p.barcode = data.barcode;
        if (data.category !== undefined) p.category = data.category;
        if (data.unit !== undefined) p.unit = data.unit;
        if (data.purchasePrice !== undefined) p.purchasePrice = data.purchasePrice;
        if (data.sellingPrice !== undefined) p.sellingPrice = data.sellingPrice;
        if (data.taxRate !== undefined) p.taxRate = data.taxRate;
        if (data.taxType !== undefined) p.taxType = data.taxType;
        if (data.discount !== undefined) p.discount = data.discount;
        if (data.stockQuantity !== undefined) p.stockQuantity = data.stockQuantity;
        if (data.lowStockThreshold !== undefined) p.lowStockThreshold = data.lowStockThreshold;
        if (data.hsnCode !== undefined) p.hsnCode = data.hsnCode;
        if (data.imageUri !== undefined) p.imageUri = data.imageUri;
        if (data.isService !== undefined) p.isService = data.isService;
        if (data.isActive !== undefined) p.isActive = data.isActive;
      });
    });
  }

  async softDelete(id: string): Promise<void> {
    const product = await this.collection.find(id);
    await database.write(async () => {
      await product.update((p) => {
        p.isDeleted = true;
      });
    });
  }

  async getById(id: string): Promise<Product> {
    return this.collection.find(id);
  }

  async getAll(): Promise<Product[]> {
    return this.collection.query(Q.where('is_deleted', false), Q.where('is_active', true)).fetch();
  }

  async search(query: string): Promise<Product[]> {
    const lowerQuery = query.toLowerCase();
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.or(
          Q.where('name', Q.like(`%${lowerQuery}%`)),
          Q.where('sku', Q.like(`%${lowerQuery}%`)),
          Q.where('barcode', Q.like(`%${lowerQuery}%`)),
          Q.where('category', Q.like(`%${lowerQuery}%`)),
          Q.where('hsn_code', Q.like(`%${lowerQuery}%`))
        )
      )
      .fetch();
  }

  async getByCategory(category: string): Promise<Product[]> {
    return this.collection
      .query(Q.where('is_deleted', false), Q.where('category', category))
      .fetch();
  }

  async getLowStock(): Promise<Product[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('is_service', false),
        Q.on('products', 'stock_quantity', Q.notEq(null))
      )
      .fetch();
  }

  async reduceStock(id: string, quantity: number): Promise<Product> {
    const product = await this.collection.find(id);
    if (product.isService || product.stockQuantity === null) {
      return product;
    }
    if (product.stockQuantity < quantity) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.stockQuantity}`);
    }
    return database.write(async () => {
      return product.update((p) => {
        p.stockQuantity = (p.stockQuantity ?? 0) - quantity;
      });
    });
  }

  async increaseStock(id: string, quantity: number): Promise<Product> {
    const product = await this.collection.find(id);
    if (product.isService || product.stockQuantity === null) {
      return product;
    }
    return database.write(async () => {
      return product.update((p) => {
        p.stockQuantity = (p.stockQuantity ?? 0) + quantity;
      });
    });
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Product>> {
    const { page, limit, search, sortBy = 'name', sortOrder = 'asc', filters } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [Q.where('is_deleted', false)];

    if (filters?.category) {
      conditions.push(Q.where('category', filters.category as string));
    }
    if (filters?.isActive !== undefined) {
      conditions.push(Q.where('is_active', filters.isActive as boolean));
    }
    if (filters?.isService !== undefined) {
      conditions.push(Q.where('is_service', filters.isService as boolean));
    }
    if (search) {
      const lowerSearch = search.toLowerCase();
      conditions.push(
        Q.or(
          Q.where('name', Q.like(`%${lowerSearch}%`)),
          Q.where('sku', Q.like(`%${lowerSearch}%`)),
          Q.where('barcode', Q.like(`%${lowerSearch}%`)),
          Q.where('category', Q.like(`%${lowerSearch}%`))
        )
      );
    }

    const sortColumn = this.mapSortColumn(sortBy);
    conditions.push(Q.sortBy(sortColumn, sortOrder === 'asc' ? 'asc' : 'desc'));

    const allResults = await this.collection.query(...conditions).fetch();
    const total = allResults.length;
    const data = allResults.slice(offset, offset + limit);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrevious: page > 1,
    };
  }

  async getCount(): Promise<number> {
    const results = await this.collection.query(Q.where('is_deleted', false)).fetch();
    return results.length;
  }

  async getBySku(sku: string): Promise<Product | null> {
    const results = await this.collection
      .query(Q.where('sku', sku), Q.where('is_deleted', false))
      .fetch();
    return results[0] ?? null;
  }

  async getByBarcode(barcode: string): Promise<Product | null> {
    const results = await this.collection
      .query(Q.where('barcode', barcode), Q.where('is_deleted', false))
      .fetch();
    return results[0] ?? null;
  }

  private mapSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      name: 'name',
      sku: 'sku',
      sellingPrice: 'selling_price',
      purchasePrice: 'purchase_price',
      stockQuantity: 'stock_quantity',
      category: 'category',
      taxRate: 'tax_rate',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    return columnMap[sortBy] || 'name';
  }
}

export const productRepository = new ProductRepository();
