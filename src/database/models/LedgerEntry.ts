import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, relation, text } from '@nozbe/watermelondb/decorators';

export default class LedgerEntry extends Model {
  static table = 'ledger_entries';

  static associations = {
    customer: { type: 'belongs_to' as const, key: 'customer_id' },
  };

  @relation('customers', 'customer_id') customer: any;
  @text('type') type!: string;
  @field('amount') amount!: number;
  @field('balance') balance!: number;
  @text('description') description!: string;
  @text('reference_id') referenceId!: string | null;
  @text('reference_type') referenceType!: string | null;
  @date('date') entryDate!: Date;
  @readonly @date('created_at') createdAt!: Date;
}
