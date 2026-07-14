import { Q } from '@nozbe/watermelondb';
import { expensesCollection, expenseCategoriesCollection, database } from '../index';
import Expense from '../models/Expense';
import ExpenseCategory from '../models/ExpenseCategory';
import { PaginationParams, PaginatedResponse } from '../../types';

export class ExpenseRepository {
  private collection = expensesCollection;
  private categoriesCollection = expenseCategoriesCollection;

  async createExpense(data: {
    expenseNumber: string;
    categoryId?: string;
    amount: number;
    description: string;
    date: Date;
    receiptUri?: string;
    isRecurring?: boolean;
    recurringInterval?: string;
    paymentMode: string;
    vendorName?: string;
    invoiceNumber?: string;
    taxAmount?: number;
    isDeductible?: boolean;
  }): Promise<Expense> {
    return database.write(async () => {
      return this.collection.create((expense) => {
        expense.expenseNumber = data.expenseNumber;
        if (data.categoryId) {
          expense.category.id = data.categoryId;
        }
        expense.amount = data.amount;
        expense.description = data.description;
        expense.expenseDate = data.date;
        expense.receiptUri = data.receiptUri ?? null;
        expense.isRecurring = data.isRecurring ?? false;
        expense.recurringInterval = data.recurringInterval ?? null;
        expense.paymentMode = data.paymentMode;
        expense.vendorName = data.vendorName ?? null;
        expense.invoiceNumber = data.invoiceNumber ?? null;
        expense.taxAmount = data.taxAmount ?? null;
        expense.isDeductible = data.isDeductible ?? false;
        expense.isDeleted = false;
      });
    });
  }

  async updateExpense(id: string, data: Partial<{
    categoryId: string;
    amount: number;
    description: string;
    date: Date;
    receiptUri: string | null;
    isRecurring: boolean;
    recurringInterval: string | null;
    paymentMode: string;
    vendorName: string | null;
    invoiceNumber: string | null;
    taxAmount: number | null;
    isDeductible: boolean;
  }>): Promise<Expense> {
    const expense = await this.collection.find(id);
    return database.write(async () => {
      return expense.update((e) => {
        if (data.categoryId !== undefined) e.category.id = data.categoryId;
        if (data.amount !== undefined) e.amount = data.amount;
        if (data.description !== undefined) e.description = data.description;
        if (data.date !== undefined) e.expenseDate = data.date;
        if (data.receiptUri !== undefined) e.receiptUri = data.receiptUri;
        if (data.isRecurring !== undefined) e.isRecurring = data.isRecurring;
        if (data.recurringInterval !== undefined) e.recurringInterval = data.recurringInterval;
        if (data.paymentMode !== undefined) e.paymentMode = data.paymentMode;
        if (data.vendorName !== undefined) e.vendorName = data.vendorName;
        if (data.invoiceNumber !== undefined) e.invoiceNumber = data.invoiceNumber;
        if (data.taxAmount !== undefined) e.taxAmount = data.taxAmount;
        if (data.isDeductible !== undefined) e.isDeductible = data.isDeductible;
      });
    });
  }

  async softDelete(id: string): Promise<void> {
    const expense = await this.collection.find(id);
    await database.write(async () => {
      await expense.update((e) => {
        e.isDeleted = true;
      });
    });
  }

  async getById(id: string): Promise<Expense> {
    return this.collection.find(id);
  }

  async getAll(): Promise<Expense[]> {
    return this.collection
      .query(Q.where('is_deleted', false))
      .fetch();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Expense[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('date', Q.gte(startDate.getTime())),
        Q.where('date', Q.lte(endDate.getTime()))
      )
      .fetch();
  }

  async getByCategory(categoryId: string): Promise<Expense[]> {
    return this.collection
      .query(
        Q.where('category_id', categoryId),
        Q.where('is_deleted', false)
      )
      .fetch();
  }

  async getByPaymentMode(mode: string): Promise<Expense[]> {
    return this.collection
      .query(
        Q.where('payment_mode', mode),
        Q.where('is_deleted', false)
      )
      .fetch();
  }

  async getRecurring(): Promise<Expense[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('is_recurring', true)
      )
      .fetch();
  }

  async getTotalByDateRange(startDate: Date, endDate: Date): Promise<number> {
    const expenses = await this.getByDateRange(startDate, endDate);
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  async getTotalDeductible(): Promise<number> {
    const expenses = await this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('is_deductible', true)
      )
      .fetch();
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  async getNextExpenseNumber(prefix: string = 'EXP'): Promise<string> {
    const allExpenses = await this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('expense_number', Q.like(`${prefix}%`))
      )
      .fetch();

    let maxNumber = 0;
    for (const exp of allExpenses) {
      const numPart = exp.expenseNumber.replace(prefix, '').replace(/[^0-9]/g, '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }

    return `${prefix}${String(maxNumber + 1).padStart(4, '0')}`;
  }

  // Category operations
  async createCategory(data: {
    name: string;
    icon?: string;
    color?: string;
    isDefault?: boolean;
  }): Promise<ExpenseCategory> {
    return database.write(async () => {
      return this.categoriesCollection.create((cat) => {
        cat.name = data.name;
        cat.icon = data.icon ?? null;
        cat.color = data.color ?? null;
        cat.isDefault = data.isDefault ?? false;
      });
    });
  }

  async updateCategory(id: string, data: Partial<{
    name: string;
    icon: string | null;
    color: string | null;
  }>): Promise<ExpenseCategory> {
    const category = await this.categoriesCollection.find(id);
    return database.write(async () => {
      return category.update((c) => {
        if (data.name !== undefined) c.name = data.name;
        if (data.icon !== undefined) c.icon = data.icon;
        if (data.color !== undefined) c.color = data.color;
      });
    });
  }

  async deleteCategory(id: string): Promise<void> {
    const category = await this.categoriesCollection.find(id);
    await database.write(async () => {
      await category.destroyPermanently();
    });
  }

  async getAllCategories(): Promise<ExpenseCategory[]> {
    return this.categoriesCollection.query().fetch();
  }

  async getCategoryById(id: string): Promise<ExpenseCategory> {
    return this.categoriesCollection.find(id);
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Expense>> {
    const { page, limit, search, sortBy = 'created_at', sortOrder = 'desc', filters } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [Q.where('is_deleted', false)];

    if (filters?.categoryId) {
      conditions.push(Q.where('category_id', filters.categoryId as string));
    }
    if (filters?.paymentMode) {
      conditions.push(Q.where('payment_mode', filters.paymentMode as string));
    }
    if (filters?.isRecurring !== undefined) {
      conditions.push(Q.where('is_recurring', filters.isRecurring as boolean));
    }
    if (filters?.isDeductible !== undefined) {
      conditions.push(Q.where('is_deductible', filters.isDeductible as boolean));
    }
    if (filters?.dateFrom) {
      conditions.push(Q.where('date', Q.gte(filters.dateFrom as number)));
    }
    if (filters?.dateTo) {
      conditions.push(Q.where('date', Q.lte(filters.dateTo as number)));
    }
    if (filters?.minAmount) {
      conditions.push(Q.where('amount', Q.gte(filters.minAmount as number)));
    }
    if (filters?.maxAmount) {
      conditions.push(Q.where('amount', Q.lte(filters.maxAmount as number)));
    }
    if (search) {
      conditions.push(
        Q.or(
          Q.where('description', Q.like(`%${search}%`)),
          Q.where('vendor_name', Q.like(`%${search}%`)),
          Q.where('expense_number', Q.like(`%${search}%`))
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

  async getTotalAmount(): Promise<number> {
    const expenses = await this.collection
      .query(Q.where('is_deleted', false))
      .fetch();
    return expenses.reduce((sum, e) => sum + e.amount, 0);
  }

  async getRecent(limit: number = 10): Promise<Expense[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.sortBy('created_at', 'desc'),
        Q.take(limit)
      )
      .fetch();
  }

  private mapSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      amount: 'amount',
      description: 'description',
      date: 'date',
      vendorName: 'vendor_name',
      paymentMode: 'payment_mode',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    return columnMap[sortBy] || 'created_at';
  }
}

export const expenseRepository = new ExpenseRepository();
