import { Q } from '@nozbe/watermelondb';
import { customersCollection, database } from '../index';
import Customer from '../models/Customer';
import { PaginationParams, PaginatedResponse } from '../../types';

export class CustomerRepository {
  private collection = customersCollection;

  async create(data: {
    name: string;
    email?: string;
    phone?: string;
    gstNumber?: string;
    panNumber?: string;
    address?: string;
    city?: string;
    state?: string;
    stateCode?: string;
    pincode?: string;
    country?: string;
    contactPerson?: string;
    notes?: string;
    isFavorite?: boolean;
    avatarColor?: string;
  }): Promise<Customer> {
    return database.write(async () => {
      return this.collection.create((customer) => {
        customer.name = data.name;
        customer.email = data.email ?? null;
        customer.phone = data.phone ?? null;
        customer.gstNumber = data.gstNumber ?? null;
        customer.panNumber = data.panNumber ?? null;
        customer.address = data.address ?? null;
        customer.city = data.city ?? null;
        customer.state = data.state ?? null;
        customer.stateCode = data.stateCode ?? null;
        customer.pincode = data.pincode ?? null;
        customer.country = data.country ?? 'India';
        customer.contactPerson = data.contactPerson ?? null;
        customer.notes = data.notes ?? null;
        customer.outstandingAmount = 0;
        customer.isFavorite = data.isFavorite ?? false;
        customer.avatarColor = data.avatarColor ?? null;
        customer.isDeleted = false;
      });
    });
  }

  async update(id: string, data: Partial<{
    name: string;
    email: string | null;
    phone: string | null;
    gstNumber: string | null;
    panNumber: string | null;
    address: string | null;
    city: string | null;
    state: string | null;
    stateCode: string | null;
    pincode: string | null;
    country: string;
    contactPerson: string | null;
    notes: string | null;
    isFavorite: boolean;
    avatarColor: string | null;
    outstandingAmount: number;
  }>): Promise<Customer> {
    const customer = await this.collection.find(id);
    return database.write(async () => {
      return customer.update((c) => {
        if (data.name !== undefined) c.name = data.name;
        if (data.email !== undefined) c.email = data.email;
        if (data.phone !== undefined) c.phone = data.phone;
        if (data.gstNumber !== undefined) c.gstNumber = data.gstNumber;
        if (data.panNumber !== undefined) c.panNumber = data.panNumber;
        if (data.address !== undefined) c.address = data.address;
        if (data.city !== undefined) c.city = data.city;
        if (data.state !== undefined) c.state = data.state;
        if (data.stateCode !== undefined) c.stateCode = data.stateCode;
        if (data.pincode !== undefined) c.pincode = data.pincode;
        if (data.country !== undefined) c.country = data.country;
        if (data.contactPerson !== undefined) c.contactPerson = data.contactPerson;
        if (data.notes !== undefined) c.notes = data.notes;
        if (data.isFavorite !== undefined) c.isFavorite = data.isFavorite;
        if (data.avatarColor !== undefined) c.avatarColor = data.avatarColor;
        if (data.outstandingAmount !== undefined) c.outstandingAmount = data.outstandingAmount;
      });
    });
  }

  async softDelete(id: string): Promise<void> {
    const customer = await this.collection.find(id);
    await database.write(async () => {
      await customer.update((c) => {
        c.isDeleted = true;
      });
    });
  }

  async getById(id: string): Promise<Customer> {
    return this.collection.find(id);
  }

  async getAll(): Promise<Customer[]> {
    return this.collection.query(Q.where('is_deleted', false)).fetch();
  }

  async search(query: string): Promise<Customer[]> {
    const lowerQuery = query.toLowerCase();
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.or(
          Q.where('name', Q.like(`%${lowerQuery}%`)),
          Q.where('email', Q.like(`%${lowerQuery}%`)),
          Q.where('phone', Q.like(`%${lowerQuery}%`)),
          Q.where('gst_number', Q.like(`%${lowerQuery}%`))
        )
      )
      .fetch();
  }

  async getFavorites(): Promise<Customer[]> {
    return this.collection
      .query(Q.where('is_deleted', false), Q.where('is_favorite', true))
      .fetch();
  }

  async getWithOutstanding(): Promise<Customer[]> {
    return this.collection
      .query(
        Q.where('is_deleted', false),
        Q.where('outstanding_amount', Q.gt(0))
      )
      .fetch();
  }

  async getPaginated(params: PaginationParams): Promise<PaginatedResponse<Customer>> {
    const { page, limit, search, sortBy = 'name', sortOrder = 'asc', filters } = params;
    const offset = (page - 1) * limit;

    const conditions: any[] = [Q.where('is_deleted', false)];

    if (filters?.isFavorite) {
      conditions.push(Q.where('is_favorite', true));
    }
    if (filters?.city) {
      conditions.push(Q.where('city', filters.city as string));
    }
    if (filters?.state) {
      conditions.push(Q.where('state', filters.state as string));
    }
    if (filters?.hasOutstanding) {
      conditions.push(Q.where('outstanding_amount', Q.gt(0)));
    }

    if (search) {
      const lowerSearch = search.toLowerCase();
      conditions.push(
        Q.or(
          Q.where('name', Q.like(`%${lowerSearch}%`)),
          Q.where('email', Q.like(`%${lowerSearch}%`)),
          Q.where('phone', Q.like(`%${lowerSearch}%`)),
          Q.where('gst_number', Q.like(`%${lowerSearch}%`))
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

  async updateOutstanding(customerId: string): Promise<void> {
    const customer = await this.collection.find(customerId);
    const { invoicesCollection } = require('../index');
    const invoices = await invoicesCollection
      .query(
        Q.where('customer_id', customerId),
        Q.where('is_deleted', false),
        Q.where('status', Q.oneOf(['pending', 'partially_paid', 'overdue']))
      )
      .fetch();

    let outstanding = 0;
    for (const invoice of invoices) {
      outstanding += invoice.totalAmount - invoice.amountPaid;
    }

    await database.write(async () => {
      await customer.update((c) => {
        c.outstandingAmount = outstanding;
      });
    });
  }

  private mapSortColumn(sortBy: string): string {
    const columnMap: Record<string, string> = {
      name: 'name',
      email: 'email',
      phone: 'phone',
      city: 'city',
      state: 'state',
      outstanding: 'outstanding_amount',
      createdAt: 'created_at',
      updatedAt: 'updated_at',
    };
    return columnMap[sortBy] || 'name';
  }
}

export const customerRepository = new CustomerRepository();
