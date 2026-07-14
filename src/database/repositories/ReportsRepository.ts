import { Q } from '@nozbe/watermelondb';
import {
  invoicesCollection,
  paymentsCollection,
  expensesCollection,
  customersCollection,
  productsCollection,
} from '../index';

export interface RevenueSummary {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalReceivable: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalCustomers: number;
  totalInvoices: number;
  totalProducts: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

export interface CustomerReceivable {
  customerId: string;
  customerName: string;
  totalInvoiced: number;
  totalPaid: number;
  outstanding: number;
}

export interface CategoryWiseExpense {
  category: string;
  total: number;
  count: number;
}

export interface TopProduct {
  productId: string;
  productName: string;
  totalQuantity: number;
  totalRevenue: number;
}

export class ReportsRepository {
  async getRevenueSummary(): Promise<RevenueSummary> {
    const [invoices, expenses, customers, products] = await Promise.all([
      invoicesCollection.query(Q.where('is_deleted', false)).fetch(),
      expensesCollection.query(Q.where('is_deleted', false)).fetch(),
      customersCollection.query(Q.where('is_deleted', false)).fetch(),
      productsCollection.query(Q.where('is_deleted', false)).fetch(),
    ]);

    const totalRevenue = invoices
      .filter((inv) => inv.status !== 'cancelled' && inv.status !== 'draft')
      .reduce((sum, inv) => sum + inv.totalAmount, 0);

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const totalPaid = invoices.reduce((sum, inv) => sum + inv.amountPaid, 0);
    const totalReceivable = totalRevenue - totalPaid;

    const totalPending = invoices
      .filter((inv) => inv.status === 'pending' || inv.status === 'sent')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

    const totalOverdue = invoices
      .filter((inv) => inv.status === 'overdue' || inv.status === 'partially_paid')
      .reduce((sum, inv) => sum + (inv.totalAmount - inv.amountPaid), 0);

    return {
      totalRevenue,
      totalExpenses,
      netProfit: totalRevenue - totalExpenses,
      totalReceivable,
      totalPaid,
      totalPending,
      totalOverdue,
      totalCustomers: customers.length,
      totalInvoices: invoices.length,
      totalProducts: products.length,
    };
  }

  async getMonthlyRevenue(year: number): Promise<MonthlyRevenue[]> {
    const startOfYear = new Date(year, 0, 1).getTime();
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999).getTime();

    const [invoices, expenses] = await Promise.all([
      invoicesCollection
        .query(
          Q.where('is_deleted', false),
          Q.where('created_at', Q.gte(startOfYear)),
          Q.where('created_at', Q.lte(endOfYear))
        )
        .fetch(),
      expensesCollection
        .query(
          Q.where('is_deleted', false),
          Q.where('date', Q.gte(startOfYear)),
          Q.where('date', Q.lte(endOfYear))
        )
        .fetch(),
    ]);

    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
    ];

    const monthlyData: MonthlyRevenue[] = months.map((month) => ({
      month,
      revenue: 0,
      expenses: 0,
      profit: 0,
    }));

    for (const inv of invoices) {
      if (inv.status !== 'cancelled' && inv.status !== 'draft') {
        const monthIndex = new Date(inv.createdAt).getMonth();
        monthlyData[monthIndex].revenue += inv.totalAmount;
      }
    }

    for (const exp of expenses) {
      const monthIndex = new Date(exp.expenseDate).getMonth();
      monthlyData[monthIndex].expenses += exp.amount;
    }

    for (const month of monthlyData) {
      month.profit = month.revenue - month.expenses;
    }

    return monthlyData;
  }

  async getCustomerReceivables(): Promise<CustomerReceivable[]> {
    const invoices = await invoicesCollection
      .query(Q.where('is_deleted', false))
      .fetch();

    const customerMap = new Map<
      string,
      { totalInvoiced: number; totalPaid: number; customerName: string }
    >();

    for (const inv of invoices) {
      const customerId = inv.customer.id;
      if (!customerMap.has(customerId)) {
        customerMap.set(customerId, {
          totalInvoiced: 0,
          totalPaid: 0,
          customerName: '',
        });
      }
      const record = customerMap.get(customerId)!;
      if (inv.status !== 'cancelled' && inv.status !== 'draft') {
        record.totalInvoiced += inv.totalAmount;
      }
      record.totalPaid += inv.amountPaid;
    }

    const result: CustomerReceivable[] = [];
    for (const [customerId, record] of customerMap) {
      try {
        const customer = await customersCollection.find(customerId);
        result.push({
          customerId,
          customerName: customer.name,
          totalInvoiced: record.totalInvoiced,
          totalPaid: record.totalPaid,
          outstanding: record.totalInvoiced - record.totalPaid,
        });
      } catch {
        result.push({
          customerId,
          customerName: 'Unknown',
          totalInvoiced: record.totalInvoiced,
          totalPaid: record.totalPaid,
          outstanding: record.totalInvoiced - record.totalPaid,
        });
      }
    }

    return result.sort((a, b) => b.outstanding - a.outstanding);
  }

  async getCategoryWiseExpenses(
    startDate?: Date,
    endDate?: Date
  ): Promise<CategoryWiseExpense[]> {
    const conditions: any[] = [Q.where('is_deleted', false)];
    if (startDate) {
      conditions.push(Q.where('date', Q.gte(startDate.getTime())));
    }
    if (endDate) {
      conditions.push(Q.where('date', Q.lte(endDate.getTime())));
    }

    const expenses = await expensesCollection.query(...conditions).fetch();

    const categoryMap = new Map<string, { total: number; count: number }>();

    for (const exp of expenses) {
      const categoryId = exp.category.id || 'uncategorized';
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, { total: 0, count: 0 });
      }
      const record = categoryMap.get(categoryId)!;
      record.total += exp.amount;
      record.count += 1;
    }

    const result: CategoryWiseExpense[] = [];
    for (const [category, record] of categoryMap) {
      let categoryName = category;
      if (category !== 'uncategorized') {
        try {
          const { expenseCategoriesCollection } = require('../index');
          const cat = await expenseCategoriesCollection.find(category);
          categoryName = cat.name;
        } catch {
          // use raw id
        }
      }
      result.push({
        category: categoryName,
        total: record.total,
        count: record.count,
      });
    }

    return result.sort((a, b) => b.total - a.total);
  }

  async getTopProducts(limit: number = 10): Promise<TopProduct[]> {
    const { invoiceItemsCollection } = require('../index');
    const items = await invoiceItemsCollection.query().fetch();

    const productMap = new Map<
      string,
      { totalQuantity: number; totalRevenue: number; productName: string }
    >();

    for (const item of items) {
      const productId = item.product?.id || 'custom';
      if (!productMap.has(productId)) {
        productMap.set(productId, {
          totalQuantity: 0,
          totalRevenue: 0,
          productName: item.name,
        });
      }
      const record = productMap.get(productId)!;
      record.totalQuantity += item.quantity;
      record.totalRevenue += item.total;
    }

    const result: TopProduct[] = [];
    for (const [productId, record] of productMap) {
      result.push({
        productId,
        productName: record.productName,
        totalQuantity: record.totalQuantity,
        totalRevenue: record.totalRevenue,
      });
    }

    return result.sort((a, b) => b.totalRevenue - a.totalRevenue).slice(0, limit);
  }

  async getPaymentModeWiseSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<Array<{ mode: string; total: number; count: number }>> {
    const conditions: any[] = [Q.where('is_deleted', false)];
    if (startDate) {
      conditions.push(Q.where('payment_date', Q.gte(startDate.getTime())));
    }
    if (endDate) {
      conditions.push(Q.where('payment_date', Q.lte(endDate.getTime())));
    }

    const payments = await paymentsCollection.query(...conditions).fetch();

    const modeMap = new Map<string, { total: number; count: number }>();

    for (const pay of payments) {
      if (!modeMap.has(pay.paymentMode)) {
        modeMap.set(pay.paymentMode, { total: 0, count: 0 });
      }
      const record = modeMap.get(pay.paymentMode)!;
      record.total += pay.amount;
      record.count += 1;
    }

    const result: Array<{ mode: string; total: number; count: number }> = [];
    for (const [mode, record] of modeMap) {
      result.push({ mode, ...record });
    }

    return result.sort((a, b) => b.total - a.total);
  }

  async getGstSummary(
    startDate?: Date,
    endDate?: Date
  ): Promise<{
    totalTaxable: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
  }> {
    const conditions: any[] = [
      Q.where('is_deleted', false),
      Q.where('status', Q.notEq('cancelled')),
      Q.where('status', Q.notEq('draft')),
    ];
    if (startDate) {
      conditions.push(Q.where('invoice_date', Q.gte(startDate.getTime())));
    }
    if (endDate) {
      conditions.push(Q.where('invoice_date', Q.lte(endDate.getTime())));
    }

    const invoices = await invoicesCollection.query(...conditions).fetch();

    return invoices.reduce(
      (summary, inv) => ({
        totalTaxable: summary.totalTaxable + inv.subtotal - inv.discountAmount,
        totalCgst: summary.totalCgst + inv.cgstAmount,
        totalSgst: summary.totalSgst + inv.sgstAmount,
        totalIgst: summary.totalIgst + inv.igstAmount,
        totalTax: summary.totalTax + inv.taxAmount,
      }),
      { totalTaxable: 0, totalCgst: 0, totalSgst: 0, totalIgst: 0, totalTax: 0 }
    );
  }

  async getInvoiceStatusWiseCount(): Promise<Record<string, number>> {
    const invoices = await invoicesCollection
      .query(Q.where('is_deleted', false))
      .fetch();

    const statusCount: Record<string, number> = {};
    for (const inv of invoices) {
      statusCount[inv.status] = (statusCount[inv.status] || 0) + 1;
    }
    return statusCount;
  }

  async getOverdueInvoices(): Promise<
    Array<{
      invoiceId: string;
      invoiceNumber: string;
      customerId: string;
      customerName: string;
      totalAmount: number;
      amountPaid: number;
      overdueDays: number;
    }>
  > {
    const now = Date.now();
    const invoices = await invoicesCollection
      .query(
        Q.where('is_deleted', false),
        Q.where('due_date', Q.lt(now)),
        Q.where('status', Q.notEq('paid')),
        Q.where('status', Q.notEq('cancelled'))
      )
      .fetch();

    const result = [];
    for (const inv of invoices) {
      let customerName = 'Unknown';
      try {
        const customer = await customersCollection.find(inv.customer.id);
        customerName = customer.name;
      } catch {
        // fallback
      }
      result.push({
        invoiceId: inv.id,
        invoiceNumber: inv.invoiceNumber,
        customerId: inv.customer.id,
        customerName,
        totalAmount: inv.totalAmount,
        amountPaid: inv.amountPaid,
        overdueDays: Math.floor((now - inv.dueDate.getTime()) / (1000 * 60 * 60 * 24)),
      });
    }

    return result.sort((a, b) => b.overdueDays - a.overdueDays);
  }
}

export const reportsRepository = new ReportsRepository();
