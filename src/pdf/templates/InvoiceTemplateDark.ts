import type { Invoice, BusinessProfile, TaxSettings } from '../../types';
import type { PdfOptions } from '../index';
import { CURRENCY_SYMBOL } from '../../constants';

function fmt(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function statusColor(status: string): string {
  const map: Record<string, string> = {
    paid: '#66BB6A', pending: '#FFA726', overdue: '#EF5350', draft: '#78909C',
    sent: '#42A5F5', partially_paid: '#42A5F5', cancelled: '#607D8B', refunded: '#26A69A',
  };
  return map[status] || '#78909C';
}

function statusLabel(status: string): string {
  const map: Record<string, string> = {
    draft: 'DRAFT', pending: 'PENDING', sent: 'SENT', paid: 'PAID',
    partially_paid: 'PARTIALLY PAID', overdue: 'OVERDUE', cancelled: 'CANCELLED', refunded: 'REFUNDED',
  };
  return map[status] || status.toUpperCase();
}

export function buildInvoiceDarkHtml(
  invoice: Invoice,
  business: BusinessProfile,
  taxSettings?: TaxSettings,
  options?: PdfOptions,
): string {
  const showLogo = options?.showLogo !== false;
  const showSignature = options?.showSignature !== false;
  const showBankDetails = options?.showBankDetails !== false;
  const showHsnCode = options?.showHsnCode !== false;
  const color = statusColor(invoice.status);
  const sLabel = statusLabel(invoice.status);
  const isIgst = invoice.igstAmount > 0;

  const itemRows = invoice.items
    .map(
      (item, i) => `
      <tr style="border-bottom: 1px solid #333;">
        <td style="padding: 10px 8px; font-size: 11px; color: #bbb; text-align: center; width: 30px;">${i + 1}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #e0e0e0;">
          <div style="font-weight: 600;">${item.name}</div>
          ${item.description ? `<div style="font-size: 10px; color: #888; margin-top: 2px;">${item.description}</div>` : ''}
        </td>
        ${showHsnCode ? `<td style="padding: 10px 8px; font-size: 11px; color: #999; text-align: center;">${item.hsnCode || '-'}</td>` : ''}
        <td style="padding: 10px 8px; font-size: 11px; color: #999; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #999; text-align: right;">${CURRENCY_SYMBOL}${fmt(item.rate)}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #999; text-align: right;">${item.discount > 0 ? `${item.discountType === 'percentage' ? item.discount + '%' : CURRENCY_SYMBOL + fmt(item.discount)}` : '-'}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #999; text-align: right;">${item.taxRate}%</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #e0e0e0; text-align: right; font-weight: 600;">${CURRENCY_SYMBOL}${fmt(item.total)}</td>
      </tr>`,
    )
    .join('');

  const summaryRows = `
    <tr><td style="padding: 6px 0; font-size: 12px; color: #999;">Subtotal</td><td style="padding: 6px 0; font-size: 12px; color: #e0e0e0; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.subtotal)}</td></tr>
    ${invoice.discountAmount > 0 ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #999;">Discount</td><td style="padding: 6px 0; font-size: 12px; color: #EF5350; text-align: right;">-${CURRENCY_SYMBOL}${fmt(invoice.discountAmount)}</td></tr>` : ''}
    <tr><td style="padding: 6px 0; font-size: 12px; color: #999;">Taxable Amount</td><td style="padding: 6px 0; font-size: 12px; color: #e0e0e0; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.taxableAmount)}</td></tr>
    ${isIgst
      ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #999;">IGST</td><td style="padding: 6px 0; font-size: 12px; color: #e0e0e0; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.igstAmount)}</td></tr>`
      : `<tr><td style="padding: 6px 0; font-size: 12px; color: #999;">CGST</td><td style="padding: 6px 0; font-size: 12px; color: #e0e0e0; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.cgstAmount)}</td></tr>
         <tr><td style="padding: 6px 0; font-size: 12px; color: #999;">SGST</td><td style="padding: 6px 0; font-size: 12px; color: #e0e0e0; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.sgstAmount)}</td></tr>`
    }
    ${invoice.roundOff !== 0 ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #999;">Round Off</td><td style="padding: 6px 0; font-size: 12px; color: ${invoice.roundOff > 0 ? '#EF5350' : '#66BB6A'}; text-align: right;">${invoice.roundOff > 0 ? '+' : ''}${CURRENCY_SYMBOL}${fmt(Math.abs(invoice.roundOff))}</td></tr>` : ''}
    <tr style="border-top: 2px solid #42A5F5;">
      <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #42A5F5;">Total Amount</td>
      <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #42A5F5; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.totalAmount)}</td>
    </tr>
    ${invoice.amountPaid > 0 ? `<tr><td style="padding: 4px 0; font-size: 12px; color: #999;">Amount Paid</td><td style="padding: 4px 0; font-size: 12px; color: #66BB6A; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.amountPaid)}</td></tr>
    <tr><td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #e0e0e0;">Balance Due</td><td style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #EF5350; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.balanceAmount)}</td></tr>` : ''}
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #e0e0e0; background: #121212; }
  </style>
</head>
<body>
  <div style="max-width: 750px; margin: 0 auto; padding: 30px; background: #1a1a1a;">
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="width: 60%; vertical-align: top;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              ${showLogo && business.logo ? `<td style="padding-right: 16px; vertical-align: middle;"><img src="${business.logo}" style="width: 56px; height: 56px; border-radius: 10px;" /></td>` : ''}
              <td style="vertical-align: middle;">
                <div style="font-size: 22px; font-weight: 700; color: #f5f5f5;">${business.name || 'Your Business'}</div>
                ${business.address ? `<div style="font-size: 11px; color: #888; margin-top: 4px; line-height: 1.5;">${[business.address, business.city, business.state, business.pincode].filter(Boolean).join(', ')}</div>` : ''}
                ${business.phone ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${business.phone}</div>` : ''}
                ${business.email ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${business.email}</div>` : ''}
                ${business.gstNumber ? `<div style="font-size: 11px; color: #bbb; margin-top: 4px; font-weight: 600;">GSTIN: ${business.gstNumber}</div>` : ''}
                ${business.panNumber ? `<div style="font-size: 11px; color: #bbb; margin-top: 2px;">PAN: ${business.panNumber}</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
        <td style="width: 40%; vertical-align: top; text-align: right;">
          <div style="display: inline-block; padding: 6px 16px; border-radius: 20px; background: ${color}25; color: ${color}; font-size: 12px; font-weight: 700; letter-spacing: 1px;">
            ${sLabel}
          </div>
          <div style="font-size: 28px; font-weight: 700; color: #42A5F5; letter-spacing: 1px; margin-top: 8px;">
            INVOICE
          </div>
          <div style="font-size: 14px; color: #bbb; margin-top: 4px; font-weight: 600;">
            ${invoice.invoiceNumber}
          </div>
        </td>
      </tr>
    </table>

    <!-- Details Bar -->
    <div style="background: #222; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; border: 1px solid #333;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 33%; padding: 4px 0;">
            <div style="font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.5px;">Invoice Date</div>
            <div style="font-size: 13px; font-weight: 600; color: #e0e0e0; margin-top: 2px;">${formatDate(invoice.invoiceDate)}</div>
          </td>
          <td style="width: 33%; padding: 4px 0;">
            <div style="font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.5px;">Due Date</div>
            <div style="font-size: 13px; font-weight: 600; color: #EF5350; margin-top: 2px;">${formatDate(invoice.dueDate)}</div>
          </td>
          ${invoice.referenceNumber ? `<td style="width: 33%; padding: 4px 0;">
            <div style="font-size: 10px; color: #777; text-transform: uppercase; letter-spacing: 0.5px;">Reference</div>
            <div style="font-size: 13px; font-weight: 600; color: #e0e0e0; margin-top: 2px;">${invoice.referenceNumber}</div>
          </td>` : '<td></td>'}
        </tr>
      </table>
    </div>

    <!-- Bill To -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">Bill To</div>
      <div style="padding-left: 12px; border-left: 3px solid #42A5F5;">
        <div style="font-size: 14px; font-weight: 700; color: #f5f5f5;">${invoice.customer.name}</div>
        ${invoice.customer.contactPerson ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${invoice.customer.contactPerson}</div>` : ''}
        ${invoice.customer.address ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${[invoice.customer.address, invoice.customer.city, invoice.customer.state, invoice.customer.pincode].filter(Boolean).join(', ')}</div>` : ''}
        ${invoice.customer.phone ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${invoice.customer.phone}</div>` : ''}
        ${invoice.customer.email ? `<div style="font-size: 11px; color: #888; margin-top: 2px;">${invoice.customer.email}</div>` : ''}
        ${invoice.customer.gstNumber ? `<div style="font-size: 11px; color: #bbb; margin-top: 4px; font-weight: 600;">GSTIN: ${invoice.customer.gstNumber}</div>` : ''}
      </div>
    </div>

    <!-- Items Table -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
      <thead>
        <tr style="background: #2d2d2d;">
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; font-weight: 600;">#</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: left; font-weight: 600;">Description</th>
          ${showHsnCode ? `<th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; font-weight: 600;">HSN</th>` : ''}
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: center; font-weight: 600;">Qty</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Rate</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Disc</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Tax</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #42A5F5; text-transform: uppercase; letter-spacing: 0.5px; text-align: right; font-weight: 600;">Amount</th>
        </tr>
      </thead>
      <tbody>
        ${itemRows}
      </tbody>
    </table>

    <!-- Summary -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width: 55%;"></td>
        <td style="width: 45%; vertical-align: top;">
          <table width="100%" cellpadding="0" cellspacing="0">
            ${summaryRows}
          </table>
        </td>
      </tr>
    </table>

    ${invoice.notes ? `
    <div style="margin-top: 20px; margin-bottom: 16px;">
      <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 600;">Notes</div>
      <div style="font-size: 11px; color: #999; line-height: 1.6; padding: 10px; background: #222; border-radius: 6px; border: 1px solid #333;">${invoice.notes}</div>
    </div>` : ''}

    ${invoice.termsAndConditions ? `
    <div style="margin-bottom: 24px;">
      <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 600;">Terms & Conditions</div>
      <div style="font-size: 10px; color: #888; line-height: 1.6;">${invoice.termsAndConditions}</div>
    </div>` : ''}

    ${showBankDetails && (business.bankName || business.bankAccountNumber) ? `
    <div style="border-top: 1px solid #333; padding-top: 16px; margin-bottom: 16px;">
      <div style="font-size: 10px; color: #666; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">Bank Details</div>
      <table cellpadding="0" cellspacing="0">
        ${business.bankName ? `<tr><td style="font-size: 11px; color: #888; padding: 2px 16px 2px 0;">Bank</td><td style="font-size: 11px; color: #e0e0e0; font-weight: 600;">${business.bankName}</td></tr>` : ''}
        ${business.bankAccountNumber ? `<tr><td style="font-size: 11px; color: #888; padding: 2px 16px 2px 0;">A/C No</td><td style="font-size: 11px; color: #e0e0e0; font-weight: 600;">${business.bankAccountNumber}</td></tr>` : ''}
        ${business.bankIfsc ? `<tr><td style="font-size: 11px; color: #888; padding: 2px 16px 2px 0;">IFSC</td><td style="font-size: 11px; color: #e0e0e0; font-weight: 600;">${business.bankIfsc}</td></tr>` : ''}
        ${business.upiId ? `<tr><td style="font-size: 11px; color: #888; padding: 2px 16px 2px 0;">UPI</td><td style="font-size: 11px; color: #e0e0e0; font-weight: 600;">${business.upiId}</td></tr>` : ''}
      </table>
    </div>` : ''}

    <!-- Footer -->
    <div style="border-top: 2px solid #42A5F5; padding-top: 16px; margin-top: 16px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align: bottom; width: 50%;">
            ${showSignature && business.signature ? `
            <div>
              <img src="${business.signature}" style="height: 48px;" />
              <div style="font-size: 10px; color: #666; margin-top: 4px; border-top: 1px solid #333; padding-top: 4px; display: inline-block;">Authorized Signature</div>
            </div>` : `
            <div>
              <div style="border-top: 1px solid #333; width: 160px; padding-top: 6px;">
                <div style="font-size: 10px; color: #666;">Authorized Signature</div>
              </div>
            </div>`}
          </td>
          <td style="vertical-align: bottom; width: 50%; text-align: right;">
            <div style="font-size: 11px; color: #888;">For <strong style="color: #f5f5f5;">${business.name || 'Your Business'}</strong></div>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 12px; border-top: 1px solid #222;">
      <div style="font-size: 9px; color: #555;">Generated by InvoiceHub</div>
    </div>
  </div>
</body>
</html>`;
}
