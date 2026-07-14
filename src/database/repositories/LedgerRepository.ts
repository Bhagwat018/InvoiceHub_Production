import { Q } from '@nozbe/watermelondb';
import { ledgerEntriesCollection, database } from '../index';
import LedgerEntry from '../models/LedgerEntry';
import { PaginationParams, PaginatedResponse } from '../../types';

export class LedgerRepository {
  private collection = ledgerEntriesCollection;

  async create(data: {
    customerId: string;
    type: 'debit' | 'credit';
    amount: number;
    balance: number;
    description: string;
    referenceId?: string;
    referenceType?: string;
    date: Date;
  }): Promise<LedgerEntry> {
    return database.write(async () => {
      return this.collection.create((entry) => {
        entry.customer.id = data.customerId;
        entry.type = data.type;
        entry.amount = data.amount;
        entry.balance = data.balance;
        entry.description = data.description;
        entry.referenceId = data.referenceId ?? null;
        entry.referenceType = data.referenceType ?? null;
        entry.entryDate = data.date;
      });
    });
  }

  async getByCustomer(customerId: string): Promise<LedgerEntry[]> {
    return this.collection
      .query(
        Q.where('customer_id', customerId),
        Q.sortBy('date', 'asc')
      )
      .fetch();
  }

  async getByCustomerAndDateRange(
    customerId: string,
    startDate: Date,
    endDate: Date
  ): Promise<LedgerEntry[]> {
    return this.collection
      .query(
        Q.where('customer_id', customerId),
        Q.where('date', Q.gte(startDate.getTime())),
        Q.where('date', Q.lte(endDate.getTime())),
        Q.sortBy('date', 'asc')
      )
      .fetch();
  }

  async getCustomerBalance(customerId: string): Promise<number> {
    const entries = await this.collection
      .query(
        Q.where('customer_id', customerId),
        Q.sortBy('created_at', 'desc'),
        Q.take(1)
      )
      .fetch();
    return entries[0]?.balance ?? 0;
  }

  async getDayBook(date: Date): Promise<LedgerEntry[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.collection
      .query(
        Q.where('date', Q.gte(startOfDay.getTime())),
        Q.where('date', Q.lte(endOfDay.getTime())),
        Q.sortBy('date', 'asc')
      )
      .fetch();
  }

  async getDateRangeSummary(startDate: Date, endDate: Date): Promise<{
    totalDebit: number;
    totalCredit: number;
    netAmount: number;
    entryCount: number;
  }> {
    const entries = await this.collection
      .query(
        Q.where('date', Q.gte(startDate.getTime())),
        Q.where('date', Q.lte(endDate.getTime()))
      )
      .fetch();

    const totalDebit = entries
      .filter((e) => e.type === 'debit')
      .reduce((sum, e) => sum + e.amount, 0);
    const totalCredit = entries
      .filter((e) => e.type === 'credit')
      .reduce((sum, e) => sum + e.amount, 0);

    return {
      totalDebit,
      totalCredit,
      netAmount: totalDebit - totalCredit,
      entryCount: entries.length,
    };
  }

  async getTrialBalance(): Promise<Array<{
    customerId: string;
    customerName: string;
    totalDebit: number;
    totalCredit: number;
    balance: number;
  }>> {
    const allEntries = await this.collection.query().fetch();

    const customerMap = new Map<
      string,
      { totalDebit: number; totalCredit: number; balance: number; customerName: string }
    >();

    for (const entry of allEntries) {
      const customerId = entry.customer.id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          totalDebit: 0,
          totalCredit: 0,
          balance: 0,
          customerName: '',
        });
      }
      const record = customerMap.get(customerId)!;
      if (entry.type === 'debit') {
        record.totalDebit += entry.amount;
      } else {
        record.totalCredit += entry.amount;
      }
      record.balance = entry.balance;
    }

    const result: Array<{
      customerId: string;
      customerName: string;
      totalDebit: number;
      totalCredit: number;
      balance: number;
    }> = [];

    for (const [customerId, record] of customerMap) {
      try {
        const { customersCollection } = require('../index');
        const customer = await customersCollection.find(customerId);
        result.push({
          customerId,
          customerName: customer.name,
          totalDebit: record.totalDebit,
          totalCredit: record.totalCredit,
          balance: record.balance,
        });
      } catch {
        result.push({
          customerId,
          customerName: 'Unknown',
          totalDebit: record.totalDebit,
          totalCredit: record.totalCredit,
          balance: record.balance,
        });
      }
    }

    return result;
  }

  async getMonthlySummary(year: number): Promise<Array<{
    month: string;
    debit: number;
    credit: number;
    net: number;
  }>> {
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999).getTime();

    const entries = await this.collection
      .query(
        Q.where('date', Q.gte(startOfYear)),
        Q.where('date', Q.lte(endOfYear))
      )
      .fetch();

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyData = months.map((month) => ({ month, debit: 0, credit: 0, net: 0 }));

    for (const entry of entries) {
      const date = new Date(entry.entryDate);
      const monthIndex = date.getMonth();
      if (entry.type === 'debit') {
        monthlyData[monthIndex].debit += entry.amount;
      } else {
        monthlyData[monthIndex].credit += entry.amount;
      }
    }

    for (const month of monthlyData) {
      month.net = month.debit - month.credit;
    }

    return monthlyData;
  }

  async search(query: string): Promise<LedgerEntry[]> {
    const lowerQuery = query.toLowerCase();
    return this.collection
      .query(
        Q.or(
          Q.where('description', Q.like(`%${lowerQuery}%`)),
          Q.where('reference_id', Q.like(`%${lowerQuery}%`))
        ),
        Q.sortBy('date', 'desc')
      )
      .fetch();
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<LedgerEntry>> {
    const { page, limit, search, sortBy = 'date', sortOrder = 'desc', filters } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [];

    if (filters?.customerId) {
      conditions.push(Q.where('customer_id', filters.customerId as string));
    }
    if (filters?.type) {
      conditions.push(Q.where('type', filters.type as string));
    }
    if (filters?.referenceType) {
      conditions.push(Q.where('reference_type', filters.referenceType as string));
    }
    if (filters?.dateFrom) {
      conditions.push(Q.where('date', Q.gte(filters.dateFrom as number)));
    }
    if (filters?.dateTo) {
      conditions.push(Q.where('date', Q.lte(filters.dateTo as number)));
    }
    if (search) {
      conditions.push(
        Q.or(
          Q.where('description', Q.like(`%${search}%`)),
          Q.where('reference_id', Q.like(`%${search}%`))
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

  private mapSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      amount: 'amount',
      balance: 'balance',
      type: 'type',
      date: 'date',
      createdAt: 'created_at',
    };
    return columnMap[sortBy] || 'date';
  }
}

export const ledgerRepository = new LedgerRepository();
