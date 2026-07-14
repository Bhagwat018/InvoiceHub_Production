import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, text } from '@nozbe/watermelondb/decorators';

export default class Expense extends Model {
  static table = 'expenses';

  static associations = {
    expenseCategory: { type: 'belongs_to' as const, key: 'category_id' },
  };

  @text('expense_number') expenseNumber!: string;
  @relation('expense_categories', 'category_id') category: any;
  @field('amount') amount!: number;
  @text('description') description!: string;
  @date('date') expenseDate!: Date;
  @text('receipt_uri') receiptUri!: string | null;
  @field('is_recurring') isRecurring!: boolean;
  @text('recurring_interval') recurringInterval!: string | null;
  @text('payment_mode') paymentMode!: string;
  @text('vendor_name') vendorName!: string | null;
  @text('invoice_number') invoiceNumber!: string | null;
  @field('tax_amount') taxAmount!: number | null;
  @field('is_deductible') isDeductible!: boolean;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
