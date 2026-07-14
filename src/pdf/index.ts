import { PdfGenerator } from './PdfGenerator';
import type { Invoice, BusinessProfile, TaxSettings } from '../types';

export interface PdfOptions {
  theme?: 'light' | 'dark';
  showLogo?: boolean;
  showSignature?: boolean;
  showQrCode?: boolean;
  showBankDetails?: boolean;
  showHsnCode?: boolean;
  paperSize?: 'A4' | 'A5' | 'Letter';
  orientation?: 'portrait' | 'landscape';
}

export interface PdfResult {
  filePath: string;
  fileSize: number;
}

const defaultOptions: PdfOptions = {
  theme: 'light',
  showLogo: true,
  showSignature: true,
  showQrCode: false,
  showBankDetails: true,
  showHsnCode: true,
  paperSize: 'A4',
  orientation: 'portrait',
};

export async function generateInvoicePdf(
  invoice: Invoice,
  business: BusinessProfile,
  taxSettings?: TaxSettings,
  options?: Partial<PdfOptions>,
): Promise<PdfResult> {
  const opts = { ...defaultOptions, ...options };
  const generator = new PdfGenerator();
  return generator.generateInvoice(invoice, business, taxSettings, opts);
}

export async function generateQuotePdf(
  invoice: Invoice,
  business: BusinessProfile,
  options?: Partial<PdfOptions>,
): Promise<PdfResult> {
  const opts = { ...defaultOptions, ...options };
  const generator = new PdfGenerator();
  return generator.generateQuote(invoice, business, opts);
}

export { PdfGenerator } from './PdfGenerator';
export type { PdfOptions, PdfResult };
