import {
  EMAIL_REGEX,
  PHONE_REGEX,
  GST_NUMBER_REGEX,
  PAN_NUMBER_REGEX,
  PINCODE_REGEX,
} from '../constants';

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

export function validateRequired(value: unknown, fieldName: string): ValidationResult {
  if (value === null || value === undefined) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (typeof value === 'string' && value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
}

export function validateEmail(email: string): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: false, error: 'Email is required' };
  }
  if (!EMAIL_REGEX.test(email.trim())) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  return { isValid: true };
}

export function validatePhone(phone: string): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: false, error: 'Phone number is required' };
  }
  const cleaned = phone.replace(/[\s\-()]/g, '');
  if (!PHONE_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid phone number' };
  }
  return { isValid: true };
}

export function validatePhoneOptional(phone: string | null | undefined): ValidationResult {
  if (!phone || phone.trim().length === 0) {
    return { isValid: true };
  }
  return validatePhone(phone);
}

export function validateEmailOptional(email: string | null | undefined): ValidationResult {
  if (!email || email.trim().length === 0) {
    return { isValid: true };
  }
  return validateEmail(email);
}

export function validateGstNumber(gstNumber: string): ValidationResult {
  if (!gstNumber || gstNumber.trim().length === 0) {
    return { isValid: false, error: 'GST number is required' };
  }
  const cleaned = gstNumber.toUpperCase().trim();
  if (!GST_NUMBER_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid GST number (e.g., 22AAAAA0000A1Z5)' };
  }
  return { isValid: true };
}

export function validateGstNumberOptional(gstNumber: string | null | undefined): ValidationResult {
  if (!gstNumber || gstNumber.trim().length === 0) {
    return { isValid: true };
  }
  return validateGstNumber(gstNumber);
}

export function validatePanNumber(panNumber: string): ValidationResult {
  if (!panNumber || panNumber.trim().length === 0) {
    return { isValid: false, error: 'PAN number is required' };
  }
  const cleaned = panNumber.toUpperCase().trim();
  if (!PAN_NUMBER_REGEX.test(cleaned)) {
    return { isValid: false, error: 'Please enter a valid PAN number (e.g., ABCDE1234F)' };
  }
  return { isValid: true };
}

export function validatePanNumberOptional(panNumber: string | null | undefined): ValidationResult {
  if (!panNumber || panNumber.trim().length === 0) {
    return { isValid: true };
  }
  return validatePanNumber(panNumber);
}

export function validatePincode(pincode: string): ValidationResult {
  if (!pincode || pincode.trim().length === 0) {
    return { isValid: false, error: 'Pincode is required' };
  }
  if (!PINCODE_REGEX.test(pincode.trim())) {
    return { isValid: false, error: 'Please enter a valid 6-digit pincode' };
  }
  return { isValid: true };
}

export function validatePincodeOptional(pincode: string | null | undefined): ValidationResult {
  if (!pincode || pincode.trim().length === 0) {
    return { isValid: true };
  }
  return validatePincode(pincode);
}

export function validateNumber(
  value: string | number,
  options?: {
    min?: number;
    max?: number;
    allowNegative?: boolean;
    fieldName?: string;
  }
): ValidationResult {
  const { min, max, allowNegative = false, fieldName = 'Value' } = options ?? {};
  const num = typeof value === 'string' ? parseFloat(value) : value;

  if (isNaN(num)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }

  if (!allowNegative && num < 0) {
    return { isValid: false, error: `${fieldName} cannot be negative` };
  }

  if (min !== undefined && num < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }

  if (max !== undefined && num > max) {
    return { isValid: false, error: `${fieldName} must be at most ${max}` };
  }

  return { isValid: true };
}

export function validatePositiveNumber(
  value: string | number,
  fieldName?: string
): ValidationResult {
  return validateNumber(value, {
    min: 0.01,
    allowNegative: false,
    fieldName,
  });
}

export function validateQuantity(
  value: string | number,
  allowZero: boolean = false
): ValidationResult {
  return validateNumber(value, {
    min: allowZero ? 0 : 1,
    allowNegative: false,
    fieldName: 'Quantity',
  });
}

export function validateMinLength(
  value: string,
  minLength: number,
  fieldName: string
): ValidationResult {
  if (!value || value.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  if (value.trim().length < minLength) {
    return { isValid: false, error: `${fieldName} must be at least ${minLength} characters` };
  }
  return { isValid: true };
}

export function validateMaxLength(
  value: string,
  maxLength: number,
  fieldName: string
): ValidationResult {
  if (value && value.length > maxLength) {
    return { isValid: false, error: `${fieldName} must be at most ${maxLength} characters` };
  }
  return { isValid: true };
}

export function validateUrl(url: string): ValidationResult {
  if (!url || url.trim().length === 0) {
    return { isValid: true };
  }
  try {
    new URL(url);
    return { isValid: true };
  } catch {
    return { isValid: false, error: 'Please enter a valid URL' };
  }
}

export function validateDate(date: string, fieldName: string = 'Date'): ValidationResult {
  if (!date || date.trim().length === 0) {
    return { isValid: false, error: `${fieldName} is required` };
  }
  const d = new Date(date);
  if (isNaN(d.getTime())) {
    return { isValid: false, error: `Please enter a valid ${fieldName.toLowerCase()}` };
  }
  return { isValid: true };
}

export function validateDateNotFuture(date: string, fieldName: string = 'Date'): ValidationResult {
  const dateResult = validateDate(date, fieldName);
  if (!dateResult.isValid) return dateResult;

  const d = new Date(date);
  const today = new Date();
  today.setHours(23, 59, 59, 999);

  if (d > today) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  return { isValid: true };
}

export function validateDueDate(
  invoiceDate: string,
  dueDate: string
): ValidationResult {
  const dateResult = validateDate(dueDate, 'Due date');
  if (!dateResult.isValid) return dateResult;

  const invoice = new Date(invoiceDate);
  const due = new Date(dueDate);

  if (due < invoice) {
    return { isValid: false, error: 'Due date cannot be before invoice date' };
  }
  return { isValid: true };
}

export function validateGstRate(rate: number): ValidationResult {
  const validRates = [0, 5, 12, 18, 28];
  if (!validRates.includes(rate)) {
    return { isValid: false, error: 'Please select a valid GST rate' };
  }
  return { isValid: true };
}

export function validateForm<T extends Record<string, unknown>>(
  values: T,
  rules: Record<keyof T, (value: T[keyof T]) => ValidationResult>
): { isValid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {};
  let isValid = true;

  for (const [field, validator] of Object.entries(rules) as [
    keyof T,
    (value: T[keyof T]) => ValidationResult,
  ][]) {
    const result = validator(values[field]);
    if (!result.isValid) {
      errors[field as string] = result.error ?? 'Invalid value';
      isValid = false;
    }
  }

  return { isValid, errors };
}
