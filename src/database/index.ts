import { Database } from '@nozbe/watermelondb';
import SQLiteAdapter from '@nozbe/watermelondb/adapters/sqlite';

import { schema } from './schema';
import { migrations } from './migrations';

import Customer from './models/Customer';
import Product from './models/Product';
import Invoice from './models/Invoice';
import InvoiceItem from './models/InvoiceItem';
import Payment from './models/Payment';
import Expense from './models/Expense';
import ExpenseCategory from './models/ExpenseCategory';
import BusinessProfile from './models/BusinessProfile';
import LedgerEntry from './models/LedgerEntry';
import Notification from './models/Notification';
import BackupMetadata from './models/BackupMetadata';

const adapter = new SQLiteAdapter({
  schema,
  migrations,
  jsi: true,
  onSetUpError: (error) => {
    console.error('[Database] Setup error:', error);
  },
});

export const database = new Database({
  adapter,
  modelClasses: [
    Customer,
    Product,
    Invoice,
    InvoiceItem,
    Payment,
    Expense,
    ExpenseCategory,
    BusinessProfile,
    LedgerEntry,
    Notification,
    BackupMetadata,
  ],
});

export const customersCollection = database.get<Customer>('customers');
export const productsCollection = database.get<Product>('products');
export const invoicesCollection = database.get<Invoice>('invoices');
export const invoiceItemsCollection = database.get<InvoiceItem>('invoice_items');
export const paymentsCollection = database.get<Payment>('payments');
export const expensesCollection = database.get<Expense>('expenses');
export const expenseCategoriesCollection = database.get<ExpenseCategory>('expense_categories');
export const businessProfilesCollection = database.get<BusinessProfile>('business_profiles');
export const ledgerEntriesCollection = database.get<LedgerEntry>('ledger_entries');
export const notificationsCollection = database.get<Notification>('notifications');
export const backupMetadataCollection = database.get<BackupMetadata>('backup_metadata');

export async function initializeDatabase(): Promise<void> {
  try {
    await database.get('customers').fetch();
    console.log('[Database] Initialized successfully');
  } catch (error) {
    console.error('[Database] Initialization failed:', error);
    throw error;
  }
}

export async function getDatabaseSize(): Promise<number> {
  return adapter.getSize();
}
