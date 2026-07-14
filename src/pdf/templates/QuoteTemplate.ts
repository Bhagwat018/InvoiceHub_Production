import type { Invoice, BusinessProfile } from '../../types';
import type { PdfOptions } from '../index';
import { CURRENCY_SYMBOL } from '../../constants';

function fmt(amount: number): string {
  return amount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

export function buildQuoteHtml(
  invoice: Invoice,
  business: BusinessProfile,
  options?: PdfOptions,
): string {
  const showLogo = options?.showLogo !== false;

  const itemRows = invoice.items
    .map(
      (item, i) => `
      <tr style="border-bottom: 1px solid #f0f0f0;">
        <td style="padding: 10px 8px; font-size: 11px; color: #333; text-align: center; width: 30px;">${i + 1}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #333;">
          <div style="font-weight: 600;">${item.name}</div>
          ${item.description ? `<div style="font-size: 10px; color: #888; margin-top: 2px;">${item.description}</div>` : ''}
        </td>
        <td style="padding: 10px 8px; font-size: 11px; color: #555; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #555; text-align: right;">${CURRENCY_SYMBOL}${fmt(item.rate)}</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #555; text-align: right;">${item.taxRate}%</td>
        <td style="padding: 10px 8px; font-size: 11px; color: #333; text-align: right; font-weight: 600;">${CURRENCY_SYMBOL}${fmt(item.total)}</td>
      </tr>`,
    )
    .join('');

  const summaryRows = `
    <tr><td style="padding: 6px 0; font-size: 12px; color: #666;">Subtotal</td><td style="padding: 6px 0; font-size: 12px; color: #333; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.subtotal)}</td></tr>
    ${invoice.discountAmount > 0 ? `<tr><td style="padding: 6px 0; font-size: 12px; color: #666;">Discount</td><td style="padding: 6px 0; font-size: 12px; color: #E53935; text-align: right;">-${CURRENCY_SYMBOL}${fmt(invoice.discountAmount)}</td></tr>` : ''}
    <tr><td style="padding: 6px 0; font-size: 12px; color: #666;">Tax</td><td style="padding: 6px 0; font-size: 12px; color: #333; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.totalTax)}</td></tr>
    <tr style="border-top: 2px solid #FF9800;">
      <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #FF9800;">Total</td>
      <td style="padding: 10px 0; font-size: 14px; font-weight: 700; color: #FF9800; text-align: right;">${CURRENCY_SYMBOL}${fmt(invoice.totalAmount)}</td>
    </tr>
  `;

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; background: #fff; }
  </style>
</head>
<body>
  <div style="max-width: 750px; margin: 0 auto; padding: 30px;">
    <!-- Header -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px;">
      <tr>
        <td style="width: 60%; vertical-align: top;">
          <table cellpadding="0" cellspacing="0">
            <tr>
              ${showLogo && business.logo ? `<td style="padding-right: 16px;"><img src="${business.logo}" style="width: 56px; height: 56px; border-radius: 10px;" /></td>` : ''}
              <td style="vertical-align: middle;">
                <div style="font-size: 22px; font-weight: 700; color: #1a1a1a;">${business.name || 'Your Business'}</div>
                ${business.address ? `<div style="font-size: 11px; color: #666; margin-top: 4px; line-height: 1.5;">${[business.address, business.city, business.state, business.pincode].filter(Boolean).join(', ')}</div>` : ''}
                ${business.phone ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${business.phone}</div>` : ''}
                ${business.email ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${business.email}</div>` : ''}
              </td>
            </tr>
          </table>
        </td>
        <td style="width: 40%; vertical-align: top; text-align: right;">
          <div style="font-size: 28px; font-weight: 700; color: #FF9800; letter-spacing: 1px;">QUOTE</div>
          <div style="font-size: 14px; color: #555; margin-top: 4px; font-weight: 600;">${invoice.invoiceNumber}</div>
        </td>
      </tr>
    </table>

    <!-- Details -->
    <div style="background: #FFF8E1; border-radius: 10px; padding: 14px 20px; margin-bottom: 24px; border-left: 4px solid #FF9800;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="width: 33%; padding: 4px 0;">
            <div style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Quote Date</div>
            <div style="font-size: 13px; font-weight: 600; color: #333; margin-top: 2px;">${formatDate(invoice.invoiceDate)}</div>
          </td>
          <td style="width: 33%; padding: 4px 0;">
            <div style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 0.5px;">Valid Until</div>
            <div style="font-size: 13px; font-weight: 600; color: #E65100; margin-top: 2px;">${formatDate(invoice.dueDate)}</div>
          </td>
        </tr>
      </table>
    </div>

    <!-- Bill To -->
    <div style="margin-bottom: 24px;">
      <div style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 8px; font-weight: 600;">Prepared For</div>
      <div style="padding-left: 12px; border-left: 3px solid #FF9800;">
        <div style="font-size: 14px; font-weight: 700; color: #1a1a1a;">${invoice.customer.name}</div>
        ${invoice.customer.address ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${[invoice.customer.address, invoice.customer.city, invoice.customer.state, invoice.customer.pincode].filter(Boolean).join(', ')}</div>` : ''}
        ${invoice.customer.phone ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${invoice.customer.phone}</div>` : ''}
        ${invoice.customer.email ? `<div style="font-size: 11px; color: #666; margin-top: 2px;">${invoice.customer.email}</div>` : ''}
      </div>
    </div>

    <!-- Items -->
    <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 24px; border-collapse: collapse;">
      <thead>
        <tr style="background: #FF9800;">
          <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; text-align: center; font-weight: 600;">#</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; text-align: left; font-weight: 600;">Description</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; text-align: center; font-weight: 600;">Qty</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; text-align: right; font-weight: 600;">Rate</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; text-align: right; font-weight: 600;">Tax</th>
          <th style="padding: 10px 8px; font-size: 10px; color: #fff; text-transform: uppercase; text-align: right; font-weight: 600;">Amount</th>
        </tr>
      </thead>
      <tbody>${itemRows}</tbody>
    </table>

    <!-- Summary -->
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td style="width: 55%;"></td>
        <td style="width: 45%; vertical-align: top;">
          <table width="100%" cellpadding="0" cellspacing="0">${summaryRows}</table>
        </td>
      </tr>
    </table>

    ${invoice.notes ? `
    <div style="margin-top: 20px; margin-bottom: 16px;">
      <div style="font-size: 10px; color: #999; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 6px; font-weight: 600;">Notes</div>
      <div style="font-size: 11px; color: #555; line-height: 1.6; padding: 10px; background: #fafafa; border-radius: 6px;">${invoice.notes}</div>
    </div>` : ''}

    <!-- Disclaimer -->
    <div style="background: #FFF3E0; border-radius: 8px; padding: 12px 16px; margin-top: 20px; border-left: 3px solid #FF9800;">
      <div style="font-size: 10px; color: #E65100; font-weight: 600;">IMPORTANT</div>
      <div style="font-size: 10px; color: #666; margin-top: 4px; line-height: 1.5;">
        This is an estimate/quote and not a tax invoice. Prices are subject to change. This quote is valid until the date mentioned above.
      </div>
    </div>

    <!-- Footer -->
    <div style="border-top: 2px solid #FF9800; padding-top: 16px; margin-top: 24px;">
      <table width="100%" cellpadding="0" cellspacing="0">
        <tr>
          <td style="vertical-align: bottom; width: 50%;">
            <div style="border-top: 1px solid #e0e0e0; width: 160px; padding-top: 6px;">
              <div style="font-size: 10px; color: #999;">Authorized Signature</div>
            </div>
          </td>
          <td style="vertical-align: bottom; width: 50%; text-align: right;">
            <div style="font-size: 11px; color: #666;">For <strong style="color: #1a1a1a;">${business.name || 'Your Business'}</strong></div>
          </td>
        </tr>
      </table>
    </div>

    <div style="text-align: center; margin-top: 30px; padding-top: 12px; border-top: 1px solid #eee;">
      <div style="font-size: 9px; color: #bbb;">Generated by InvoiceHub</div>
    </div>
  </div>
</body>
</html>`;
}
