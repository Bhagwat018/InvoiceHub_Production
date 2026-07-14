import { Model, Q } from '@nozbe/watermelondb';
import { field, date, readonly, children, relation, text } from '@nozbe/watermelondb/decorators';

export default class Invoice extends Model {
  static table = 'invoices';

  static associations = {
    customer: { type: 'belongs_to' as const, key: 'customer_id' },
    invoice_items: { type: 'has_many' as const, foreignKey: 'invoice_id' },
    payments: { type: 'has_many' as const, foreignKey: 'invoice_id' },
  };

  @text('invoice_number') invoiceNumber!: string;
  @relation('customers', 'customer_id') customer: any;
  @field('subtotal') subtotal!: number;
  @field('discount_amount') discountAmount!: number;
  @field('discount_percent') discountPercent!: number;
  @field('tax_amount') taxAmount!: number;
  @text('tax_type') taxType!: string;
  @field('cgst_amount') cgstAmount!: number;
  @field('sgst_amount') sgstAmount!: number;
  @field('igst_amount') igstAmount!: number;
  @field('round_off') roundOff!: number;
  @field('total_amount') totalAmount!: number;
  @field('amount_paid') amountPaid!: number;
  @text('status') status!: string;
  @date('due_date') dueDate!: Date;
  @date('invoice_date') invoiceDate!: Date;
  @text('notes') notes!: string | null;
  @text('terms_conditions') termsConditions!: string | null;
  @text('shipping_address') shippingAddress!: string | null;
  @field('shipping_charges') shippingCharges!: number;
  @text('reference_number') referenceNumber!: string | null;
  @field('is_recurring') isRecurring!: boolean;
  @text('recurring_interval') recurringInterval!: string | null;
  @text('type') type!: string;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('invoice_items') invoiceItems: any;
  @children('payments') payments: any;

  get balanceAmount(): number {
    return this.totalAmount - this.amountPaid;
  }

  get isOverdue(): boolean {
    return this.status !== 'paid' && this.status !== 'cancelled' && new Date() > this.dueDate;
  }
}
