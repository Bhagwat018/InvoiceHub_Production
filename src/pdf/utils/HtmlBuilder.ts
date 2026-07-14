import { CURRENCY_SYMBOL } from '../../constants';
import type { Invoice, InvoiceItem, BusinessProfile } from '../../types';

export function formatCurrency(amount: number): string {
  return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export function formatDate(dateStr: string, format: string = 'DD MMM YYYY'): string {
  const d = new Date(dateStr);
  const day = String(d.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const fullMonths = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const month = months[d.getMonth()];
  const fullMonth = fullMonths[d.getMonth()];
  const year = d.getFullYear();

  switch (format) {
    case 'DD/MM/YYYY': return `${day}/${String(d.getMonth() + 1).padStart(2, '0')}/${year}`;
    case 'MM/DD/YYYY': return `${String(d.getMonth() + 1).padStart(2, '0')}/${day}/${year}`;
    case 'YYYY-MM-DD': return `${year}-${String(d.getMonth() + 1).padStart(2, '0')}-${day}`;
    case 'DD MMMM YYYY': return `${day} ${fullMonth} ${year}`;
    case 'MMMM DD, YYYY': return `${fullMonth} ${day}, ${year}`;
    default: return `${day} ${month} ${year}`;
  }
}

export function buildItemRow(
  item: InvoiceItem,
  index: number,
  options?: { showHsn?: boolean; isDark?: boolean },
): string {
  const textColor = options?.isDark ? '#e0e0e0' : '#333';
  const subTextColor = options?.isDark ? '#888' : '#888';

  return `
    <tr style="border-bottom: 1px solid ${options?.isDark ? '#333' : '#f0f0f0'};">
      <td style="padding: 10px 8px; font-size: 11px; color: ${options?.isDark ? '#bbb' : '#333'}; text-align: center; width: 30px;">${index + 1}</td>
      <td style="padding: 10px 8px; font-size: 11px; color: ${textColor};">
        <div style="font-weight: 600;">${item.name}</div>
        ${item.description ? `<div style="font-size: 10px; color: ${subTextColor}; margin-top: 2px;">${item.description}</div>` : ''}
      </td>
      ${options?.showHsn ? `<td style="padding: 10px 8px; font-size: 11px; color: ${options?.isDark ? '#999' : '#555'}; text-align: center;">${item.hsnCode || '-'}</td>` : ''}
      <td style="padding: 10px 8px; font-size: 11px; color: ${options?.isDark ? '#999' : '#555'}; text-align: center;">${item.quantity}</td>
      <td style="padding: 10px 8px; font-size: 11px; color: ${options?.isDark ? '#999' : '#555'}; text-align: right;">${formatCurrency(item.rate)}</td>
      <td style="padding: 10px 8px; font-size: 11px; color: ${options?.isDark ? '#999' : '#555'}; text-align: right;">
        ${item.discount > 0 ? (item.discountType === 'percentage' ? `${item.discount}%` : formatCurrency(item.discount)) : '-'}
      </td>
      <td style="padding: 10px 8px; font-size: 11px; color: ${options?.isDark ? '#999' : '#555'}; text-align: right;">${item.taxRate}%</td>
      <td style="padding: 10px 8px; font-size: 11px; color: ${textColor}; text-align: right; font-weight: 600;">${formatCurrency(item.total)}</td>
    </tr>`;
}

export function buildSummaryTable(invoice: Invoice, options?: { accentColor?: string; isDark?: boolean }): string {
  const accent = options?.accentColor || '#1E88E5';
  const textColor = options?.isDark ? '#e0e0e0' : '#333';
  const labelColor = options?.isDark ? '#999' : '#666';
  const isIgst = invoice.igstAmount > 0;

  let rows = `
    <tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">Subtotal</td><td style="padding: 6px 0; font-size: 12px; color: ${textColor}; text-align: right;">${formatCurrency(invoice.subtotal)}</td></tr>`;

  if (invoice.discountAmount > 0) {
    rows += `<tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">Discount</td><td style="padding: 6px 0; font-size: 12px; color: #E53935; text-align: right;">-${formatCurrency(invoice.discountAmount)}</td></tr>`;
  }

  rows += `<tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">Taxable Amount</td><td style="padding: 6px 0; font-size: 12px; color: ${textColor}; text-align: right;">${formatCurrency(invoice.taxableAmount)}</td></tr>`;

  if (isIgst) {
    rows += `<tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">IGST</td><td style="padding: 6px 0; font-size: 12px; color: ${textColor}; text-align: right;">${formatCurrency(invoice.igstAmount)}</td></tr>`;
  } else {
    rows += `<tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">CGST</td><td style="padding: 6px 0; font-size: 12px; color: ${textColor}; text-align: right;">${formatCurrency(invoice.cgstAmount)}</td></tr>`;
    rows += `<tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">SGST</td><td style="padding: 6px 0; font-size: 12px; color: ${textColor}; text-align: right;">${formatCurrency(invoice.sgstAmount)}</td></tr>`;
  }

  if (invoice.roundOff !== 0) {
    rows += `<tr><td style="padding: 6px 0; font-size: 12px; color: ${labelColor};">Round Off</td><td style="padding: 6px 0; font-size: 12px; color: ${invoice.roundOff > 0 ? '#E53935' : '#43A047'}; text-align: right;">${invoice.roundOff > 0 ? '+' : ''}${formatCurrency(Math.abs(invoice.roundOff))}</td></tr>`;
  }

  rows += `
    <tr style="border-top: 2px solid ${accent};">
      <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: ${accent};">Total Amount</td>
      <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: ${accent}; text-align: right;">${formatCurrency(invoice.totalAmount)}</td>
    </tr>`;

  if (invoice.amountPaid > 0) {
    rows += `
      <tr><td style="padding: 4px 0; font-size: 12px; color: ${labelColor};">Amount Paid</td><td style="padding: 4px 0; font-size: 12px; color: #43A047; text-align: right;">${formatCurrency(invoice.amountPaid)}</td></tr>
      <tr><td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: ${textColor};">Balance Due</td><td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #E53935; text-align: right;">${formatCurrency(invoice.balanceAmount)}</td></tr>`;
  }

  return rows;
}

export function buildBankDetailsSection(business: BusinessProfile, options?: { isDark?: boolean }): string {
  if (!business.bankName && !business.bankAccountNumber) return '';

  const textColor = options?.isDark ? '#e0e0e0' : '#333';
  const labelColor = options?.isDark ? '#888' : '#666';
  const borderColor = options?.isDark ? '#333' : '#e0e0e0';

  let rows = '';
  if (business.bankName) rows += `<tr><td style="font-size: 11px; color: ${labelColor}; padding: 2px 16px 2px 0;">Bank</td><td style="font-size: 11px; color: ${textColor}; font-weight: 600;">${business.bankName}</td></tr>`;
  if (business.bankAccountNumber) rows += `<tr><td style="font-size: 11px; color: ${labelColor}; padding: 2px 16px 2px 0;">A/C No</td><td style="font-size: 11px; color: ${textColor}; font-weight: 600;">${business.bankAccountNumber}</td></tr>`;
  if (business.bankIfsc) rows += `<tr><td style="font-size: 11px; color: ${labelColor}; padding: 2px 16px 2px 0;">IFSC</td><td style="font-size: 11px; color: ${textColor}; font-weight: 600;">${business.bankIfsc}</td></tr>`;
  if (business.upiId) rows += `<tr><td style="font-size: 11px; color: ${labelColor}; padding: 2px 16px 2px 0;">UPI</td><td style="font-size: 11px; color: ${textColor}; font-weight: 600;">${business.upiId}</td></tr>`;

  return `
    <div style="border-top: 1px solid ${borderColor}; padding-top: 16px; margin-bottom: 16px;">
      <div style="font-size: 10px; color: ${labelColor}; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">Bank Details</div>
      <table cellpadding="0" cellspacing="0">${rows}</table>
    </div>`;
}

export function buildSignatureSection(business: BusinessProfile, options?: { showSignature?: boolean; isDark?: boolean }): string {
  const borderColor = options?.isDark ? '#333' : '#e0e0e0';
  const labelColor = options?.isDark ? '#666' : '#999';

  const signatureContent = options?.showSignature && business.signature
    ? `<img src="${business.signature}" style="height: 48px;" />`
    : '';

  return `
    <td style="vertical-align: bottom; width: 50%;">
      <div>
        ${signatureContent}
        <div style="border-top: 1px solid ${borderColor}; width: 160px; padding-top: 6px; ${signatureContent ? 'margin-top: 4px;' : ''}">
          <div style="font-size: 10px; color: ${labelColor};">Authorized Signature</div>
        </div>
      </div>
    </td>
    <td style="vertical-align: bottom; width: 50%; text-align: right;">
      <div style="font-size: 11px; color: ${options?.isDark ? '#888' : '#666'};">For <strong style="color: ${options?.isDark ? '#f5f5f5' : '#1a1a1a'};">${business.name || 'Your Business'}</strong></div>
    </td>`;
}

export function buildTableHeader(options?: { showHsn?: boolean; accentColor?: string; isDark?: boolean }): string {
  const accent = options?.accentColor || '#1E88E5';
  const headerColor = options?.isDark ? '#42A5F5' : accent;

  return `
    <tr style="background: ${accent};">
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; font-weight: 600;">#</th>
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; font-weight: 600;">Description</th>
      ${options?.showHsn ? `<th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; font-weight: 600;">HSN</th>` : ''}
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; font-weight: 600;">Qty</th>
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Rate</th>
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Disc</th>
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Tax</th>
      <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Amount</th>
    </tr>`;
}
