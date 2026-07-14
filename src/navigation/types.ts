import type { NavigatorScreenParams } from '@react-navigation/native';

export type DashboardStackParamList = {
  DashboardMain: undefined;
  Reports: undefined;
  ReportDetail: { reportType: string; title: string };
};

export type CustomerStackParamList = {
  CustomerList: undefined;
  CustomerDetail: { customerId: string };
  CustomerForm: { customerId?: string };
};

export type InvoiceStackParamList = {
  InvoiceList: undefined;
  InvoiceDetail: { invoiceId: string };
  InvoiceForm: { customerId?: string; invoiceId?: string };
  InvoicePreview: { invoiceId: string };
};

export type MoreStackParamList = {
  Settings: undefined;
  Expenses: undefined;
  Payments: undefined;
  Ledger: undefined;
  Backup: undefined;
  BusinessProfile: undefined;
  TaxSettings: undefined;
  About: undefined;
};

export type MainTabParamList = {
  Dashboard: NavigatorScreenParams<DashboardStackParamList>;
  Customers: NavigatorScreenParams<CustomerStackParamList>;
  CreateInvoice: undefined;
  Invoices: NavigatorScreenParams<InvoiceStackParamList>;
  More: NavigatorScreenParams<MoreStackParamList>;
};

export type RootStackParamList = {
  Auth: undefined;
  Main: NavigatorScreenParams<MainTabParamList>;
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

declare global {
  namespace ReactNavigation {
    interface RootParamList extends RootStackParamList {}
  }
}
