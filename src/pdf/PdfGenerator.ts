import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { buildInvoiceHtml } from './templates/InvoiceTemplate';
import { buildInvoiceDarkHtml } from './templates/InvoiceTemplateDark';
import { buildQuoteHtml } from './templates/QuoteTemplate';
import type { Invoice, BusinessProfile, TaxSettings } from '../types';
import type { PdfOptions, PdfResult } from './index';

export class PdfGenerator {
  async generateInvoice(
    invoice: Invoice,
    business: BusinessProfile,
    taxSettings?: TaxSettings,
    options?: PdfOptions,
  ): Promise<PdfResult> {
    const isDark = options?.theme === 'dark';
    const html = isDark
      ? buildInvoiceDarkHtml(invoice, business, taxSettings, options)
      : buildInvoiceHtml(invoice, business, taxSettings, options);

    const fileName = `Invoice_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}`;

    const file = await RNHTMLtoPDF.convert({
      html,
      fileName,
      directory: 'Documents',
      width: this.getPageWidth(options?.paperSize || 'A4'),
      height: this.getPageHeight(options?.paperSize || 'A4'),
      base64: false,
      width: 595,
      height: 842,
    });

    if (!file.filePath) {
      throw new Error('Failed to generate PDF');
    }

    return {
      filePath: file.filePath,
      fileSize: file.numberOfPages ?? 0,
    };
  }

  async generateQuote(
    invoice: Invoice,
    business: BusinessProfile,
    options?: PdfOptions,
  ): Promise<PdfResult> {
    const html = buildQuoteHtml(invoice, business, options);

    const fileName = `Quote_${invoice.invoiceNumber.replace(/[^a-zA-Z0-9-]/g, '_')}`;

    const file = await RNHTMLtoPDF.convert({
      html,
      fileName,
      directory: 'Documents',
      base64: false,
      width: 595,
      height: 842,
    });

    if (!file.filePath) {
      throw new Error('Failed to generate PDF');
    }

    return {
      filePath: file.filePath,
      fileSize: file.numberOfPages ?? 0,
    };
  }

  private getPageWidth(size: string): number {
    const sizes: Record<string, number> = { A4: 595, A5: 420, Letter: 612 };
    return sizes[size] || 595;
  }

  private getPageHeight(size: string): number {
    const sizes: Record<string, number> = { A4: 842, A5: 595, Letter: 792 };
    return sizes[size] || 842;
  }

  async sharePdf(filePath: string): Promise<void> {
    const Share = require('react-native-share');
    await Share.default.open({
      url: `file://${filePath}`,
      type: 'application/pdf',
    });
  }

  async printPdf(filePath: string): Promise<void> {
    const RNPrint = require('react-native-print');
    await RNPrint.default.print({ filePath });
  }
}
