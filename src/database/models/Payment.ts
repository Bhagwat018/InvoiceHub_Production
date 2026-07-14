import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, text } from '@nozbe/watermelondb/decorators';

export default class Payment extends Model {
  static table = 'payments';

  static associations = {
    invoice: { type: 'belongs_to' as const, key: 'invoice_id' },
    customer: { type: 'belongs_to' as const, key: 'customer_id' },
  };

  @text('payment_number') paymentNumber!: string;
  @relation('invoices', 'invoice_id') invoice: any;
  @relation('customers', 'customer_id') customer: any;
  @field('amount') amount!: number;
  @text('payment_mode') paymentMode!: string;
  @text('reference_number') referenceNumber!: string | null;
  @text('notes') notes!: string | null;
  @date('payment_date') paymentDate!: Date;
  @text('status') status!: string;
  @text('receipt_number') receiptNumber!: string | null;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
