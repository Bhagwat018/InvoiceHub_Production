import {
  InvoiceStatus,
  PaymentMode,
  PaymentStatus,
  TaxType,
  ExpenseType,
  ExpenseCategory,
  Unit,
} from '../constants';

export interface Customer {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  contactPerson: string | null;
  notes: string | null;
  isFavourite: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  description: string | null;
  hsnCode: string | null;
  unit: Unit;
  price: number;
  costPrice: number | null;
  taxRate: number;
  taxType: TaxType;
  stock: number | null;
  lowStockThreshold: number | null;
  category: string | null;
  sku: string | null;
  barcode: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  productId: string | null;
  name: string;
  description: string | null;
  hsnCode: string | null;
  unit: Unit;
  quantity: number;
  rate: number;
  discount: number;
  discountType: 'percentage' | 'fixed';
  taxRate: number;
  taxType: TaxType;
  taxAmount: number;
  amount: number;
  total: number;
  createdAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customer: Customer;
  items: InvoiceItem[];
  status: InvoiceStatus;
  invoiceDate: string;
  dueDate: string;
  referenceNumber: string | null;
  notes: string | null;
  termsAndConditions: string | null;

  subtotal: number;
  discountAmount: number;
  discountType: 'percentage' | 'fixed';
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  igstAmount: number;
  totalTax: number;
  roundOff: number;
  totalAmount: number;
  amountPaid: number;
  balanceAmount: number;

  shippingAddress: string | null;
  shippingCharges: number;

  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  customerId: string;
  amount: number;
  paymentDate: string;
  paymentMode: PaymentMode;
  referenceNumber: string | null;
  notes: string | null;
  status: PaymentStatus;
  receiptNumber: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Expense {
  id: string;
  expenseNumber: string;
  description: string;
  amount: number;
  expenseDate: string;
  expenseType: ExpenseType;
  category: ExpenseCategory;
  vendor: string | null;
  paymentMode: PaymentMode;
  referenceNumber: string | null;
  notes: string | null;
  isRecurring: boolean;
  recurringFrequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly' | null;
  taxAmount: number | null;
  isDeductible: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BusinessProfile {
  id: string;
  name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  pincode: string | null;
  country: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  gstNumber: string | null;
  panNumber: string | null;
  logo: string | null;
  signature: string | null;
  bankName: string | null;
  bankAccountNumber: string | null;
  bankIfsc: string | null;
  bankBranch: string | null;
  upiId: string | null;
  defaultPaymentTerms: string | null;
  defaultNotes: string | null;
  invoicePrefix: string;
  invoiceStartNumber: number;
  financialYearStart: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface TaxSettings {
  id: string;
  businessId: string;
  gstRegistered: boolean;
  gstNumber: string | null;
  gstType: 'regular' | 'composition';
  gstRate: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  isIgstApplicable: boolean;
  hsnCode: string | null;
  sacCode: string | null;
  stateCode: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceSequence {
  id: string;
  prefix: string;
  currentNumber: number;
  suffix: string | null;
  format: string;
  createdAt: string;
  updatedAt: string;
}

export interface LedgerEntry {
  id: string;
  customerId: string;
  invoiceId: string | null;
  paymentId: string | null;
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
  description: string;
  referenceNumber: string | null;
  date: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'payment_received' | 'payment_made' | 'adjustment';
  category: string;
  amount: number;
  date: string;
  description: string;
  referenceType: 'invoice' | 'expense' | 'payment' | null;
  referenceId: string | null;
  paymentMode: PaymentMode | null;
  balance: number;
  createdAt: string;
}

export interface ReportCache {
  id: string;
  reportType: string;
  parameters: string;
  data: string;
  generatedAt: string;
  expiresAt: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  actionScreen: string | null;
  actionParams: string | null;
  createdAt: string;
}

export interface BackupMetadata {
  id: string;
  filename: string;
  filepath: string;
  size: number;
  version: string;
  isAutomatic: boolean;
  description: string | null;
  createdAt: string;
}

export interface ActivityLog {
  id: string;
  action: string;
  entityType: 'invoice' | 'customer' | 'product' | 'expense' | 'payment' | 'business';
  entityId: string;
  entityName: string;
  details: string | null;
  createdAt: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalExpenses: number;
  netProfit: number;
  totalReceivable: number;
  totalPaid: number;
  totalPending: number;
  totalOverdue: number;
  totalCustomers: number;
  totalInvoices: number;
  recentInvoices: Invoice[];
  recentPayments: Payment[];
  monthlyRevenue: { month: string; amount: number }[];
  topCustomers: { customer: Customer; amount: number }[];
  expenseBreakdown: { category: ExpenseType; amount: number }[];
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface PaginationParams {
  page: number;
  limit: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Record<string, unknown>;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface AppState {
  isInitialized: boolean;
  isAuthenticated: boolean;
  isDarkMode: boolean;
  currency: string;
  dateFormat: string;
  language: string;
}

export type RootStackParamList = {
  Main: undefined;
  InvoiceDetail: { invoiceId: string };
  InvoiceCreate: { customerId?: string } | undefined;
  InvoiceEdit: { invoiceId: string };
  CustomerDetail: { customerId: string };
  CustomerCreate: undefined;
  CustomerEdit: { customerId: string };
  ProductDetail: { productId: string };
  ProductCreate: undefined;
  ProductEdit: { productId: string };
  PaymentCreate: { invoiceId: string };
  ExpenseDetail: { expenseId: string };
  ExpenseCreate: undefined;
  ExpenseEdit: { expenseId: string };
  Reports: undefined;
  Settings: undefined;
  BusinessProfile: undefined;
  TaxSettings: undefined;
  Backup: undefined;
  About: undefined;
};

export type TabParamList = {
  Dashboard: undefined;
  Invoices: undefined;
  Customers: undefined;
  Products: undefined;
  More: undefined;
};
