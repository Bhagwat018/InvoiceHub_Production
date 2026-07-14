export const APP_NAME = 'InvoiceHub';
export const APP_VERSION = '1.0.0';
export const DATABASE_NAME = 'invoicehub.db';
export const DATABASE_VERSION = 1;

export const DEFAULT_CURRENCY = 'INR';
export const CURRENCY_SYMBOL = '₹';

export const GST_RATES = [0, 5, 12, 18, 28] as const;
export type GSTRate = (typeof GST_RATES)[number];

export const GST_TYPES = ['CGST_SGST', 'IGST'] as const;
export type GSTType = (typeof GST_TYPES)[number];

export const GST_PERCENTAGES = {
  CGST_SGST: [2.5, 6, 9, 14],
  IGST: [5, 12, 18, 28],
} as const;

export const INVOICE_STATUSES = [
  'draft',
  'pending',
  'sent',
  'paid',
  'partially_paid',
  'overdue',
  'cancelled',
  'refunded',
] as const;
export type InvoiceStatus = (typeof INVOICE_STATUSES)[number];

export const INVOICE_STATUS_LABELS: Record<InvoiceStatus, string> = {
  draft: 'Draft',
  pending: 'Pending',
  sent: 'Sent',
  paid: 'Paid',
  partially_paid: 'Partially Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
};

export const INVOICE_STATUS_COLORS: Record<InvoiceStatus, string> = {
  draft: 'textTertiary',
  pending: 'warning',
  sent: 'info',
  paid: 'success',
  partially_paid: 'accent',
  overdue: 'error',
  cancelled: 'textDisabled',
  refunded: 'secondary',
};

export const PAYMENT_MODES = [
  'cash',
  'upi',
  'bank_transfer',
  'cheque',
  'card',
  'net_banking',
  'demand_draft',
  'credit',
  'other',
] as const;
export type PaymentMode = (typeof PAYMENT_MODES)[number];

export const PAYMENT_MODE_LABELS: Record<PaymentMode, string> = {
  cash: 'Cash',
  upi: 'UPI',
  bank_transfer: 'Bank Transfer',
  cheque: 'Cheque',
  card: 'Card',
  net_banking: 'Net Banking',
  demand_draft: 'Demand Draft',
  credit: 'Credit',
  other: 'Other',
};

export const PAYMENT_STATUSES = ['pending', 'completed', 'failed', 'refunded'] as const;
export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: 'Pending',
  completed: 'Completed',
  failed: 'Failed',
  refunded: 'Refunded',
};

export const TAX_TYPES = ['inclusive', 'exclusive', 'exempt'] as const;
export type TaxType = (typeof TAX_TYPES)[number];

export const TAX_TYPE_LABELS: Record<TaxType, string> = {
  inclusive: 'Tax Inclusive',
  exclusive: 'Tax Exclusive',
  exempt: 'Exempt',
};

export const EXPENSE_TYPES = [
  'office_rent',
  'utilities',
  'salaries',
  'office_supplies',
  'travel',
  'marketing',
  'professional_services',
  'equipment',
  'software',
  'maintenance',
  'insurance',
  'taxes',
  'miscellaneous',
  'other',
] as const;
export type ExpenseType = (typeof EXPENSE_TYPES)[number];

export const EXPENSE_TYPE_LABELS: Record<ExpenseType, string> = {
  office_rent: 'Office Rent',
  utilities: 'Utilities',
  salaries: 'Salaries',
  office_supplies: 'Office Supplies',
  travel: 'Travel',
  marketing: 'Marketing',
  professional_services: 'Professional Services',
  equipment: 'Equipment',
  software: 'Software',
  maintenance: 'Maintenance',
  insurance: 'Insurance',
  taxes: 'Taxes',
  miscellaneous: 'Miscellaneous',
  other: 'Other',
};

export const EXPENSE_CATEGORIES = [
  'operational',
  'capital',
  'recurring',
  'one_time',
  'tax_deductible',
  'non_deductible',
] as const;
export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const EXPENSE_CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  operational: 'Operational',
  capital: 'Capital',
  recurring: 'Recurring',
  one_time: 'One Time',
  tax_deductible: 'Tax Deductible',
  non_deductible: 'Non Deductible',
};

export const UNITS = [
  'piece',
  'kg',
  'g',
  'mg',
  'litre',
  'ml',
  'metre',
  'cm',
  'mm',
  'sq_metre',
  'sq_cm',
  'sq_ft',
  'sq_yd',
  'hour',
  'day',
  'month',
  'year',
  'dozen',
  'box',
  'pack',
  'pair',
  'set',
  'roll',
  'bundle',
  'unit',
  'other',
] as const;
export type Unit = (typeof UNITS)[number];

export const UNIT_LABELS: Record<Unit, string> = {
  piece: 'Pcs',
  kg: 'Kg',
  g: 'G',
  mg: 'Mg',
  litre: 'L',
  ml: 'Ml',
  metre: 'M',
  cm: 'Cm',
  mm: 'Mm',
  sq_metre: 'Sq M',
  sq_cm: 'Sq Cm',
  sq_ft: 'Sq Ft',
  sq_yd: 'Sq Yd',
  hour: 'Hr',
  day: 'Day',
  month: 'Mo',
  year: 'Yr',
  dozen: 'Doz',
  box: 'Box',
  pack: 'Pack',
  pair: 'Pair',
  set: 'Set',
  roll: 'Roll',
  bundle: 'Bundle',
  unit: 'Unit',
  other: 'Other',
};

export const DATE_FORMATS = {
  dd_mm_yyyy: 'DD/MM/YYYY',
  mm_dd_yyyy: 'MM/DD/YYYY',
  yyyy_mm_dd: 'YYYY-MM-DD',
  dd_mmm_yyyy: 'DD MMM YYYY',
  dd_mmmm_yyyy: 'DD MMMM YYYY',
  mmm_dd_yyyy: 'MMM DD, YYYY',
  mmmm_dd_yyyy: 'MMMM DD, YYYY',
  short: 'DD/MM/YY',
  iso: 'YYYY-MM-DD',
  time_12: 'hh:mm A',
  time_24: 'HH:mm',
  datetime_12: 'DD/MM/YYYY hh:mm A',
  datetime_24: 'DD/MM/YYYY HH:mm',
} as const;

export const DEFAULT_DATE_FORMAT = DATE_FORMATS.dd_mm_yyyy;
export const DEFAULT_TIME_FORMAT = DATE_FORMATS.time_12;

export const INVOICE_PREFIX_DEFAULT = 'INV';
export const EXPENSE_PREFIX_DEFAULT = 'EXP';
export const PAYMENT_PREFIX_DEFAULT = 'PAY';

export const MAX_FILE_SIZE_MB = 10;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const;

export const DEFAULT_PAGINATION_LIMIT = 20;
export const MAX_PAGINATION_LIMIT = 100;

export const GST_NUMBER_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
export const PAN_NUMBER_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
export const PHONE_REGEX = /^[+]?[0-9]{10,15}$/;
export const EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const PINCODE_REGEX = /^[1-9][0-9]{5}$/;

export const DEFAULT_BUSINESS_INFO = {
  name: '',
  address: '',
  city: '',
  state: '',
  pincode: '',
  phone: '',
  email: '',
  gstNumber: '',
  panNumber: '',
  bankName: '',
  bankAccountNumber: '',
  bankIfsc: '',
  bankBranch: '',
  logo: null,
} as const;

export const INDIAN_STATES = [
  'Andhra Pradesh',
  'Arunachal Pradesh',
  'Assam',
  'Bihar',
  'Chhattisgarh',
  'Goa',
  'Gujarat',
  'Haryana',
  'Himachal Pradesh',
  'Jharkhand',
  'Karnataka',
  'Kerala',
  'Madhya Pradesh',
  'Maharashtra',
  'Manipur',
  'Meghalaya',
  'Mizoram',
  'Nagaland',
  'Odisha',
  'Punjab',
  'Rajasthan',
  'Sikkim',
  'Tamil Nadu',
  'Telangana',
  'Tripura',
  'Uttar Pradesh',
  'Uttarakhand',
  'West Bengal',
  'Andaman and Nicobar Islands',
  'Chandigarh',
  'Dadra and Nagar Haveli and Daman and Diu',
  'Delhi',
  'Jammu and Kashmir',
  'Ladakh',
  'Lakshadweep',
  'Puducherry',
] as const;

export const INDIAN_STATES_CODES: Record<string, string> = {
  'Andhra Pradesh': '37',
  'Arunachal Pradesh': '12',
  'Assam': '18',
  'Bihar': '10',
  'Chhattisgarh': '22',
  'Goa': '30',
  'Gujarat': '24',
  'Haryana': '06',
  'Himachal Pradesh': '02',
  'Jharkhand': '20',
  'Karnataka': '29',
  'Kerala': '32',
  'Madhya Pradesh': '23',
  'Maharashtra': '27',
  'Manipur': '14',
  'Meghalaya': '17',
  'Mizoram': '15',
  'Nagaland': '13',
  'Odisha': '21',
  'Punjab': '03',
  'Rajasthan': '08',
  'Sikkim': '11',
  'Tamil Nadu': '33',
  'Telangana': '36',
  'Tripura': '16',
  'Uttar Pradesh': '09',
  'Uttarakhand': '05',
  'West Bengal': '19',
  'Andaman and Nicobar Islands': '35',
  'Chandigarh': '04',
  'Dadra and Nagar Haveli and Daman and Diu': '26',
  'Delhi': '07',
  'Jammu and Kashmir': '01',
  'Ladakh': '38',
  'Lakshadweep': '31',
  'Puducherry': '34',
};

export const COLORS_FOR_EXPORT = {
  paid: '#43A047',
  pending: '#FB8C00',
  overdue: '#E53935',
  draft: '#9E9E9E',
  draftBg: '#F5F5F5',
  paidBg: '#E8F5E9',
  pendingBg: '#FFF3E0',
  overdueBg: '#FFEBEE',
  cancelled: '#757575',
  cancelledBg: '#F5F5F5',
  refunded: '#00897B',
  refundedBg: '#E0F2F1',
  partially_paid: '#1E88E5',
  partially_paidBg: '#E3F2FD',
  sent: '#1E88E5',
  sentBg: '#E3F2FD',
};
