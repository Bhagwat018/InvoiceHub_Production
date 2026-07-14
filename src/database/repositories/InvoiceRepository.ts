import { Q } from '@nozbe/watermelondb';
import { invoicesCollection, invoiceItemsCollection, database } from '../index';
import Invoice from '../models/Invoice';
import InvoiceItem from '../models/InvoiceItem';
import { PaginationParams, PaginatedResponse } from '../../types';

export class InvoiceRepository {
  private collection = invoicesCollection;
  private itemsCollection = invoiceItemsCollection;

  async create(data: {
    invoiceNumber: string;
    customerId: string;
    subtotal: number;
    discountAmount?: number;
    discountPercent?: number;
    taxAmount: number;
    taxType: string;
    cgstAmount?: number;
    sgstAmount?: number;
    igstAmount?: number;
    roundOff?: number;
    totalAmount: number;
    status?: string;
    dueDate: Date;
    invoiceDate?: Date;
    notes?: string;
    termsConditions?: string;
    shippingAddress?: string;
    shippingCharges?: number;
    referenceNumber?: string;
    isRecurring?: boolean;
    recurringInterval?: string;
    type?: string;
    items: Array<{
      productId?: string;
      name: string;
      description?: string;
      hsnCode?: string;
      unit?: string;
      quantity: number;
      unitPrice: number;
      discountPercent?: number;
      discountAmount?: number;
      taxRate: number;
      taxAmount: number;
      total: number;
    }>;
  }): Promise<Invoice> {
    return database.write(async () => {
      const invoice = await this.collection.create((inv) => {
        inv.invoiceNumber = data.invoiceNumber;
        inv.customer.id = data.customerId;
        inv.subtotal = data.subtotal;
        inv.discountAmount = data.discountAmount ?? 0;
        inv.discountPercent = data.discountPercent ?? 0;
        inv.taxAmount = data.taxAmount;
        inv.taxType = data.taxType;
        inv.cgstAmount = data.cgstAmount ?? 0;
        inv.sgstAmount = data.sgstAmount ?? 0;
        inv.igstAmount = data.igstAmount ?? 0;
        inv.roundOff = data.roundOff ?? 0;
        inv.totalAmount = data.totalAmount;
        inv.amountPaid = 0;
        inv.status = data.status ?? 'draft';
        inv.dueDate = data.dueDate;
        inv.invoiceDate = data.invoiceDate ?? new Date();
        inv.notes = data.notes ?? null;
        inv.termsConditions = data.termsConditions ?? null;
        inv.shippingAddress = data.shippingAddress ?? null;
        inv.shippingCharges = data.shippingCharges ?? 0;
        inv.referenceNumber = data.referenceNumber ?? null;
        inv.isRecurring = data.isRecurring ?? false;
        inv.recurringInterval = data.recurringInterval ?? null;
        inv.type = data.type ?? 'invoice';
        inv.isDeleted = false;
      });

      for (const item of data.items) {
        await this.itemsCollection.create((ii) => {
          ii.invoice.id = invoice.id;
          if (item.productId) {
            ii.product.id = item.productId;
          }
          ii.name = item.name;
          ii.description = item.description ?? null;
          ii.hsnCode = item.hsnCode ?? null;
          ii.unit = item.unit ?? 'piece';
          ii.quantity = item.quantity;
          ii.unitPrice = item.unitPrice;
          ii.discountPercent = item.discountPercent ?? 0;
          ii.discountAmount = item.discountAmount ?? 0;
          ii.taxRate = item.taxRate;
          ii.taxAmount = item.taxAmount;
          ii.total = item.total;
        });
      }

      return invoice;
    });
  }

  async update(id: string, data: Partial<{
    invoiceNumber: string;
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    taxAmount: number;
    taxType: string;
    cgstAmount: number;
    sgstAmount: number;
    igstAmount: number;
    roundOff: number;
    totalAmount: number;
    amountPaid: number;
    status: string;
    dueDate: Date;
    invoiceDate: Date;
    notes: string | null;
    termsConditions: string | null;
    shippingAddress: string | null;
    shippingCharges: number;
    referenceNumber: string | null;
    isRecurring: boolean;
    recurringInterval: string | null;
  }>): Promise<Invoice> {
    const invoice = await this.collection.find(id);
    return database.write(async () => {
      return invoice.update((inv) => {
        if (data.invoiceNumber !== undefined) inv.invoiceNumber = data.invoiceNumber;
        if (data.subtotal !== undefined) inv.subtotal = data.subtotal;
        if (data.discountAmount !== undefined) inv.discountAmount = data.discountAmount;
        if (data.discountPercent !== undefined) inv.discountPercent = data.discountPercent;
        if (data.taxAmount !== undefined) inv.taxAmount = data.taxAmount;
        if (data.taxType !== undefined) inv.taxType = data.taxType;
        if (data.cgstAmount !== undefined) inv.cgstAmount = data.cgstAmount;
        if (data.sgstAmount !== undefined) inv.sgstAmount = data.sgstAmount;
        if (data.igstAmount !== undefined) inv.igstAmount = data.igstAmount;
        if (data.roundOff !== undefined) inv.roundOff = data.roundOff;
        if (data.totalAmount !== undefined) inv.totalAmount = data.totalAmount;
        if (data.amountPaid !== undefined) inv.amountPaid = data.amountPaid;
        if (data.status !== undefined) inv.status = data.status;
        if (data.dueDate !== undefined) inv.dueDate = data.dueDate;
        if (data.invoiceDate !== undefined) inv.invoiceDate = data.invoiceDate;
        if (data.notes !== undefined) inv.notes = data.notes;
        if (data.termsConditions !== undefined) inv.termsConditions = data.termsConditions;
        if (data.shippingAddress !== undefined) inv.shippingAddress = data.shippingAddress;
        if (data.shippingCharges !== undefined) inv.shippingCharges = data.shippingCharges;
        if (data.referenceNumber !== undefined) inv.referenceNumber = data.referenceNumber;
        if (data.isRecurring !== undefined) inv.isRecurring = data.isRecurring;
        if (data.recurringInterval !== undefined) inv.recurringInterval = data.recurringInterval;
      });
    });
  }

  async updateItems(invoiceId: string, items: Array<{
    id?: string;
    productId?: string;
    name: string;
    description?: string;
    hsnCode?: string;
    unit?: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    discountAmount?: number;
    taxRate: number;
    taxAmount: number;
    total: number;
  }>): Promise<void> {
    await database.write(async () => {
      const existingItems = await this.itemsCollection
        .query(Q.where('invoice_id', invoiceId))
        .fetch();

      for (const item of existingItems) {
        await item.destroyPermanently();
      }

      for (const item of items) {
        await this.itemsCollection.create((ii) => {
          ii.invoice.id = invoiceId;
          if (item.productId) {
            ii.product.id = item.productId;
          }
          ii.name = item.name;
          ii.description = item.description ?? null;
          ii.hsnCode = item.hsnCode ?? null;
          ii.unit = item.unit ?? 'piece';
          ii.quantity = item.quantity;
          ii.unitPrice = item.unitPrice;
          ii.discountPercent = item.discountPercent ?? 0;
          ii.discountAmount = item.discountAmount ?? 0;
          ii.taxRate = item.taxRate;
          ii.taxAmount = item.taxAmount;
          ii.total = item.total;
        });
      }
    });
  }

  async softDelete(id: string): Promise<void> {
    const invoice = await this.collection.find(id);
    await database.write(async () => {
      await invoice.update((inv) => {
        inv.isDeleted = true;
      });
    });
  }

  async getById(id: string): Promise<Invoice> {
    return this.collection.find(id);
  }

  async getItems(invoiceId: string): Promise<InvoiceItem[]> {
    return this.itemsCollection
      .query(Q.where('invoice_id', invoiceId))
      .fetch();
  }

  async getByStatus(status: string): Promise<Invoice[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('status', status)
      )
      .fetch();
  }

  async getByCustomer(customerId: string): Promise<Invoice[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('customer_id', customerId)
      )
      .fetch();
  }

  async getOverdue(): Promise<Invoice[]> {
    const now = Date.now();
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('due_date', Q.lt(now)),
        Q.where('status', Q.notEq('paid')),
        Q.where('status', Q.notEq('cancelled'))
      )
      .fetch();
  }

  async updateStatus(id: string, status: string): Promise<Invoice> {
    return this.update(id, { status });
  }

  async recordPayment(id: string, amount: number): Promise<Invoice> {
    const invoice = await this.collection.find(id);
    const newAmountPaid = invoice.amountPaid + amount;
    let newStatus = invoice.status;

    if (newAmountPaid >= invoice.totalAmount) {
      newStatus = 'paid';
    } else if (newAmountPaid > 0) {
      newStatus = 'partially_paid';
    }

    return database.write(async () => {
      return invoice.update((inv) => {
        inv.amountPaid = newAmountPaid;
        inv.status = newStatus;
      });
    });
  }

  async getNextInvoiceNumber(prefix: string = 'INV'): Promise<string> {
    const allInvoices = await this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('invoice_number', Q.like(`${prefix}%`))
      )
      .fetch();

    let maxNumber = 0;
    for (const inv of allInvoices) {
      const numPart = inv.invoiceNumber.replace(prefix, '').replace(/[^0-9]/g, '');
      const num = parseInt(numPart, 10);
      if (!isNaN(num) && num > maxNumber) {
        maxNumber = num;
      }
    }

    return `${prefix}${String(maxNumber + 1).padStart(4, '0')}`;
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Invoice>> {
    const { page, limit, search, sortBy = 'created_at', sortOrder = 'desc', filters } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [Q.where('is_deleted', false)];

    if (filters?.status) {
      conditions.push(Q.where('status', filters.status as string));
    }
    if (filters?.customerId) {
      conditions.push(Q.where('customer_id', filters.customerId as string));
    }
    if (filters?.type) {
      conditions.push(Q.where('type', filters.type as string));
    }
    if (filters?.dateFrom) {
      conditions.push(Q.where('invoice_date', Q.gte(filters.dateFrom as number)));
    }
    if (filters?.dateTo) {
      conditions.push(Q.where('invoice_date', Q.lte(filters.dateTo as number)));
    }
    if (filters?.minAmount) {
      conditions.push(Q.where('total_amount', Q.gte(filters.minAmount as number)));
    }
    if (filters?.maxAmount) {
      conditions.push(Q.where('total_amount', Q.lte(filters.maxAmount as number)));
    }
    if (search) {
      conditions.push(
        Q.or(
          Q.where('invoice_number', Q.like(`%${search}%`)),
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
    const invoices = await this.collection
      .query(Q.where('is_deleted', false))
      .fetch();
    return invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);
  }

  async getTotalPaid(): Promise<number> {
    const invoices = await this.collection
      .query(Q.where('is_deleted', false))
      .fetch();
    return invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
  }

  private mapSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      invoiceNumber: 'invoice_number',
      totalAmount: 'total_amount',
      amountPaid: 'amount_paid',
      status: 'status',
      dueDate: 'due_date',
      invoiceDate: 'invoice_date',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    return columnMap[sortBy] || 'created_at';
  }
}

export const invoiceRepository = new InvoiceRepository();
