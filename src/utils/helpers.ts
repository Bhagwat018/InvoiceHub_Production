import { Platform } from 'react-native';

export function generateId(): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 10);
  const platformPart = Platform.OS === 'ios' ? 'a' : 'b';
  return `${timestamp}${platformPart}${randomPart}`;
}

export function generateInvoiceNumber(
  prefix: string,
  sequence: number,
  padding: number = 4
): string {
  return `${prefix}-${sequence.toString().padStart(padding, '0')}`;
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func.apply(this, args);
    }, wait);
  };
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  let lastArgs: Parameters<T> | null = null;
  let lastThis: unknown = null;

  return function (this: unknown, ...args: Parameters<T>) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => {
        inThrottle = false;
        if (lastArgs) {
          func.apply(lastThis, lastArgs);
          lastArgs = null;
          lastThis = null;
        }
      }, limit);
    } else {
      lastArgs = args;
      lastThis = this;
    }
  };
}

export function capitalize(text: string): string {
  if (!text) return '';
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase();
}

export function capitalizeWords(text: string): string {
  if (!text) return '';
  return text
    .split(' ')
    .map((word) => capitalize(word))
    .join(' ');
}

export function toUpperCase(text: string): string {
  return text?.toUpperCase() ?? '';
}

export function toLowerCase(text: string): string {
  return text?.toLowerCase() ?? '';
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w-]+/g, '')
    .replace(/--+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * clamp(t, 0, 1);
}

export function roundTo(num: number, decimals: number = 2): number {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
}

export function roundOffAmount(amount: number): { rounded: number; difference: number } {
  const rounded = Math.round(amount);
  return {
    rounded,
    difference: roundTo(rounded - amount, 2),
  };
}

export function groupBy<T>(array: T[], keyFn: (item: T) => string): Record<string, T[]> {
  return array.reduce(
    (result, item) => {
      const key = keyFn(item);
      if (!result[key]) {
        result[key] = [];
      }
      result[key].push(item);
      return result;
    },
    {} as Record<string, T[]>
  );
}

export function sortBy<T>(array: T[], keyFn: (item: T) => string | number, order: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aVal = keyFn(a);
    const bVal = keyFn(b);

    if (typeof aVal === 'string' && typeof bVal === 'string') {
      return order === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
    }

    return order === 'asc'
      ? (aVal as number) - (bVal as number)
      : (bVal as number) - (aVal as number);
  });
}

export function uniqueBy<T>(array: T[], keyFn: (item: T) => string): T[] {
  const seen = new Set<string>();
  return array.filter((item) => {
    const key = keyFn(item);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function sumBy<T>(array: T[], keyFn: (item: T) => number): number {
  return array.reduce((sum, item) => sum + keyFn(item), 0);
}

export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export function flatten<T>(array: (T | T[])[]): T[] {
  return array.reduce<T[]>((result, item) => {
    return result.concat(Array.isArray(item) ? item : [item]);
  }, []);
}

export function pick<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Pick<T, K> {
  const result = {} as Pick<T, K>;
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key];
    }
  });
  return result;
}

export function omit<T extends Record<string, unknown>, K extends keyof T>(
  obj: T,
  keys: K[]
): Omit<T, K> {
  const result = { ...obj };
  keys.forEach((key) => {
    delete result[key];
  });
  return result as Omit<T, K>;
}

export function deepMerge<T extends Record<string, unknown>>(
  target: T,
  source: Partial<T>
): T {
  const result = { ...target };
  Object.keys(source).forEach((key) => {
    const k = key as keyof T;
    if (
      source[k] &&
      typeof source[k] === 'object' &&
      !Array.isArray(source[k]) &&
      target[k] &&
      typeof target[k] === 'object' &&
      !Array.isArray(target[k])
    ) {
      (result as Record<string, unknown>)[k] = deepMerge(
        target[k] as Record<string, unknown>,
        source[k] as Record<string, unknown>
      );
    } else {
      (result as Record<string, unknown>)[k] = source[k];
    }
  });
  return result;
}

export function isEmpty(value: unknown): boolean {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
}

export function isEqual(a: unknown, b: unknown): boolean {
  if (a === b) return true;
  if (a === null || b === null) return false;
  if (typeof a !== typeof b) return false;

  if (typeof a !== 'object') return a === b;

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  if (Array.isArray(a) && Array.isArray(b)) {
    if (a.length !== b.length) return false;
    return a.every((item, index) => isEqual(item, b[index]));
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  return keysA.every(
    (key) =>
      Object.prototype.hasOwnProperty.call(b, key) &&
      isEqual(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key]
      )
  );
}

export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function retry<T>(
  fn: () => Promise<T>,
  retries: number = 3,
  delay: number = 1000
): Promise<T> {
  return fn().catch((err) => {
    if (retries <= 0) throw err;
    return sleep(delay).then(() => retry(fn, retries - 1, delay));
  });
}

export function getInitials(name: string): string {
  if (!name) return '';
  return name
    .split(' ')
    .map((part) => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
}

export function getAvatarColor(name: string): string {
  const colors = [
    '#1E88E5',
    '#00897B',
    '#43A047',
    '#FB8C00',
    '#E53935',
    '#8E24AA',
    '#3949AB',
    '#00ACC1',
    '#7CB342',
    '#FFB300',
  ];

  if (!name) return colors[0];

  const hash = name.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  return colors[Math.abs(hash) % colors.length];
}

export function getDaysUntilDue(dueDate: string): number {
  const due = new Date(dueDate);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  due.setHours(0, 0, 0, 0);
  return Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

export function isOverdue(dueDate: string): boolean {
  return getDaysUntilDue(dueDate) < 0;
}

export function isDueSoon(dueDate: string, daysThreshold: number = 3): boolean {
  const days = getDaysUntilDue(dueDate);
  return days >= 0 && days <= daysThreshold;
}

export function calculateGstBreakup(
  amount: number,
  gstRate: number,
  isIgst: boolean = false
): {
  cgst: number;
  sgst: number;
  igst: number;
  total: number;
} {
  if (isIgst) {
    const igst = roundTo(amount * (gstRate / 100));
    return { cgst: 0, sgst: 0, igst, total: igst };
  }

  const halfRate = gstRate / 2;
  const cgst = roundTo(amount * (halfRate / 100));
  const sgst = cgst;
  return { cgst, sgst, igst: 0, total: cgst + sgst };
}

export function calculateDiscount(
  amount: number,
  discount: number,
  discountType: 'percentage' | 'fixed'
): number {
  if (discountType === 'percentage') {
    return roundTo(amount * (discount / 100));
  }
  return Math.min(discount, amount);
}
