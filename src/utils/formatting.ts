import { DEFAULT_DATE_FORMAT, DEFAULT_TIME_FORMAT, CURRENCY_SYMBOL } from '../constants';

const LOCALE = 'en-IN';

export function formatCurrency(
  amount: number,
  options?: {
    currency?: string;
    symbol?: boolean;
    decimalPlaces?: number;
    compact?: boolean;
  }
): string {
  const {
    currency = CURRENCY_SYMBOL,
    symbol = true,
    decimalPlaces = 2,
    compact = false,
  } = options ?? {};

  const absAmount = Math.abs(amount);

  if (compact && absAmount >= 10000000) {
    const formatted = (absAmount / 10000000).toFixed(2);
    return `${amount < 0 ? '-' : ''}${symbol ? currency : ''}${formatted}Cr`;
  }

  if (compact && absAmount >= 100000) {
    const formatted = (absAmount / 100000).toFixed(2);
    return `${amount < 0 ? '-' : ''}${symbol ? currency : ''}${formatted}L`;
  }

  if (compact && absAmount >= 1000) {
    const formatted = (absAmount / 1000).toFixed(1);
    return `${amount < 0 ? '-' : ''}${symbol ? currency : ''}${formatted}K`;
  }

  const formatted = absAmount.toLocaleString(LOCALE, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });

  return `${amount < 0 ? '-' : ''}${symbol ? currency : ''}${formatted}`;
}

export function formatNumber(
  num: number,
  options?: {
    decimalPlaces?: number;
    compact?: boolean;
    locale?: string;
  }
): string {
  const { decimalPlaces = 0, compact = false, locale = LOCALE } = options ?? {};

  if (compact) {
    const absNum = Math.abs(num);
    if (absNum >= 10000000) {
      return `${num < 0 ? '-' : ''}${(absNum / 10000000).toFixed(1)}Cr`;
    }
    if (absNum >= 100000) {
      return `${num < 0 ? '-' : ''}${(absNum / 100000).toFixed(1)}L`;
    }
    if (absNum >= 1000) {
      return `${num < 0 ? '-' : ''}${(absNum / 1000).toFixed(1)}K`;
    }
  }

  return num.toLocaleString(locale, {
    minimumFractionDigits: decimalPlaces,
    maximumFractionDigits: decimalPlaces,
  });
}

export function formatDate(
  date: string | Date,
  format: string = DEFAULT_DATE_FORMAT
): string {
  const d = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(d.getTime())) {
    return '';
  }

  const day = d.getDate();
  const month = d.getMonth();
  const year = d.getFullYear();
  const hours = d.getHours();
  const minutes = d.getMinutes();
  const seconds = d.getSeconds();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const monthShort = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
  ];

  const pad = (n: number) => n.toString().padStart(2, '0');
  const hours12 = hours % 12 || 12;
  const ampm = hours >= 12 ? 'PM' : 'AM';

  return format
    .replace('YYYY', year.toString())
    .replace('YY', year.toString().slice(-2))
    .replace('MMMM', monthNames[month])
    .replace('MMM', monthShort[month])
    .replace('MM', pad(month + 1))
    .replace('DD', pad(day))
    .replace('D', day.toString())
    .replace('hh', pad(hours12))
    .replace('HH', pad(hours))
    .replace('mm', pad(minutes))
    .replace('ss', pad(seconds))
    .replace('A', ampm);
}

export function formatTime(
  date: string | Date,
  format: string = DEFAULT_TIME_FORMAT
): string {
  return formatDate(date, format);
}

export function formatDateTime(
  date: string | Date,
  dateFormat: string = DEFAULT_DATE_FORMAT,
  timeFormat: string = DEFAULT_TIME_FORMAT
): string {
  const d = `${formatDate(date, dateFormat)} ${formatDate(date, timeFormat)}`;
  return d.trim();
}

export function formatPhone(phone: string): string {
  const cleaned = phone.replace(/\D/g, '');

  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }

  if (cleaned.length === 12 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 2)} ${cleaned.slice(2, 7)} ${cleaned.slice(7)}`;
  }

  if (cleaned.length === 13 && cleaned.startsWith('91')) {
    return `+${cleaned.slice(0, 3)} ${cleaned.slice(3, 8)} ${cleaned.slice(8)}`;
  }

  return phone;
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB'];
  const k = 1024;
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${units[i]}`;
}

export function formatPercentage(value: number, decimalPlaces: number = 1): string {
  return `${value.toFixed(decimalPlaces)}%`;
}

export function formatInvoiceNumber(prefix: string, number: number, padding: number = 4): string {
  return `${prefix}-${number.toString().padStart(padding, '0')}`;
}

export function formatAccountNumber(accountNumber: string): string {
  const cleaned = accountNumber.replace(/\s/g, '');
  if (cleaned.length <= 4) return cleaned;
  return `****${cleaned.slice(-4)}`;
}

export function formatIfsc(ifsc: string): string {
  return ifsc.toUpperCase().replace(/\s/g, '');
}

export function truncate(text: string, maxLength: number, suffix: string = '...'): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - suffix.length) + suffix;
}

export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return `${count} ${singular}`;
  return `${count} ${plural ?? singular + 's'}`;
}

export function getRelativeTime(date: string | Date): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHr = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHr / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin}m ago`;
  if (diffHr < 24) return `${diffHr}h ago`;
  if (diffDay < 7) return `${diffDay}d ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}w ago`;
  return formatDate(d, 'DD MMM YYYY');
}
