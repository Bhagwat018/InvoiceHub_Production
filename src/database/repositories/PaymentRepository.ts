import { Q } from '@nozbe/watermelondb';
import { paymentsCollection, database } from '../index';
import Payment from '../models/Payment';
import { PaginationParams, PaginatedResponse } from '../../types';

export class PaymentRepository {
  private collection = paymentsCollection;

  async create(data: {
    paymentNumber: string;
    invoiceId: string;
    customerId: string;
    amount: number;
    paymentMode: string;
    referenceNumber?: string;
    notes?: string;
    paymentDate?: Date;
    status?: string;
    receiptNumber?: string;
  }): Promise<Payment> {
    return database.write(async () => {
      return this.collection.create((payment) => {
        payment.paymentNumber = data.paymentNumber;
        payment.invoice.id = data.invoiceId;
        payment.customer.id = data.customerId;
        payment.amount = data.amount;
        payment.paymentMode = data.paymentMode;
        payment.referenceNumber = data.referenceNumber ?? null;
        payment.notes = data.notes ?? null;
        payment.paymentDate = data.paymentDate ?? new Date();
        payment.status = data.status ?? 'completed';
        payment.receiptNumber = data.receiptNumber ?? null;
        payment.isDeleted = false;
      });
    });
  }

  async update(id: string, data: Partial<{
    amount: number;
    paymentMode: string;
    referenceNumber: string | null;
    notes: string | null;
    paymentDate: Date;
    status: string;
    receiptNumber: string | null;
  }>): Promise<Payment> {
    const payment = await this.collection.find(id);
    return database.write(async () => {
      return payment.update((p) => {
        if (data.amount !== undefined) p.amount = data.amount;
        if (data.paymentMode !== undefined) p.paymentMode = data.paymentMode;
        if (data.referenceNumber !== undefined) p.referenceNumber = data.referenceNumber;
        if (data.notes !== undefined) p.notes = data.notes;
        if (data.paymentDate !== undefined) p.paymentDate = data.paymentDate;
        if (data.status !== undefined) p.status = data.status;
        if (data.receiptNumber !== undefined) p.receiptNumber = data.receiptNumber;
      });
    });
  }

  async softDelete(id: string): Promise<void> {
    const payment = await this.collection.find(id);
    await database.write(async () => {
      await payment.update((p) => {
        p.isDeleted = true;
      });
    });
  }

  async getById(id: string): Promise<Payment> {
    return this.collection.find(id);
  }

  async getByInvoice(invoiceId: string): Promise<Payment[]> {
    return this.collection
      .query(
        Q.where('invoice_id', invoiceId),
        Q.where('is_deleted', false)
      )
      .fetch();
  }

  async getByCustomer(customerId: string): Promise<Payment[]> {
    return this.collection
      .query(
        Q.where('customer_id', customerId),
        Q.where('is_deleted', false)
      )
      .fetch();
  }

  async getByDateRange(startDate: Date, endDate: Date): Promise<Payment[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('payment_date', Q.gte(startDate.getTime())),
        Q.where('payment_date', Q.lte(endDate.getTime()))
      )
      .fetch();
  }

  async getByMode(mode: string): Promise<Payment[]> {
    return this.collection
      .query(
        Q.where('payment_mode', mode),
        Q.where('is_deleted', false)
      )
      .fetch();
  }

  async getTotalByCustomer(customerId: string): Promise<number> {
    const payments = await this.getByCustomer(customerId);
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  async getTotalByInvoice(invoiceId: string): Promise<number> {
    const payments = await this.getByInvoice(invoiceId);
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  async getNextPaymentNumber(prefix: string = 'PAY'): Promise<string> {
    const allPayments = await this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('payment_number', Q.like(`${prefix}%`))
      )
      .fetch();

    let maxNumber = 0;
    for (const pay of allPayments) {
      const numPart = pay.paymentNumber.replace(prefix, '').replace(/[^0-9]/g, '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }

    return `${prefix}${String(maxNumber + 1).padStart(4, '0')}`;
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Payment>> {
    const { page, limit, search, sortBy = 'created_at', sortOrder = 'desc', filters } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [Q.where('is_deleted', false)];

    if (filters?.invoiceId) {
      conditions.push(Q.where('invoice_id', filters.invoiceId as string));
    }
    if (filters?.customerId) {
      conditions.push(Q.where('customer_id', filters.customerId as string));
    }
    if (filters?.paymentMode) {
      conditions.push(Q.where('payment_mode', filters.paymentMode as string));
    }
    if (filters?.status) {
      conditions.push(Q.where('status', filters.status as string));
    }
    if (filters?.dateFrom) {
      conditions.push(Q.where('payment_date', Q.gte(filters.dateFrom as number)));
    }
    if (filters?.dateTo) {
      conditions.push(Q.where('payment_date', Q.lte(filters.dateTo as number)));
    }
    if (search) {
      conditions.push(
        Q.or(
          Q.where('payment_number', Q.like(`%${search}%`)),
          Q.where('reference_number', Q.like(`%${search}%`)),
          Q.where('notes', Q.like(`%${search}%`))
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
    const payments = await this.collection
      .query(Q.where('is_deleted', false))
      .fetch();
    return payments.reduce((sum, p) => sum + p.amount, 0);
  }

  async getRecent(limit: number = 10): Promise<Payment[]> {
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
      paymentNumber: 'payment_number',
      amount: 'amount',
      paymentMode: 'payment_mode',
      status: 'status',
      paymentDate: 'payment_date',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    return columnMap[sortBy] || 'created_at';
  }
}

export const paymentRepository = new PaymentRepository();
