import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, text } from '@nozbe/watermelondb/decorators';

export default class InvoiceItem extends Model {
  static table = 'invoice_items';

  static associations = {
    invoice: { type: 'belongs_to' as const, key: 'invoice_id' },
    product: { type: 'belongs_to' as const, key: 'product_id' },
  };

  @relation('invoices', 'invoice_id') invoice: any;
  @relation('products', 'product_id') product: any;
  @text('name') name!: string;
  @text('description') description!: string | null;
  @text('hsn_code') hsnCode!: string | null;
  @text('unit') unit!: string;
  @field('quantity') quantity!: number;
  @field('unit_price') unitPrice!: number;
  @field('discount_percent') discountPercent!: number;
  @field('discount_amount') discountAmount!: number;
  @field('tax_rate') taxRate!: number;
  @field('tax_amount') taxAmount!: number;
  @field('total') total!: number;
  @readonly @date('created_at') createdAt!: Date;

  get netAmount(): number {
    return this.quantity * this.unitPrice - this.discountAmount;
  }
}
