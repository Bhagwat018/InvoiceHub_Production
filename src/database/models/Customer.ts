import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children, text } from '@nozbe/watermelondb/decorators';

export default class Customer extends Model {
  static table = 'customers';

  static associations = {
    invoices: { type: 'has_many' as const, foreignKey: 'customer_id' },
    payments: { type: 'has_many' as const, foreignKey: 'customer_id' },
    ledger_entries: { type: 'has_many' as const, foreignKey: 'customer_id' },
  };

  @text('name') name!: string;
  @text('email') email!: string | null;
  @text('phone') phone!: string | null;
  @text('gst_number') gstNumber!: string | null;
  @text('pan_number') panNumber!: string | null;
  @text('address') address!: string | null;
  @text('city') city!: string | null;
  @text('state') state!: string | null;
  @text('state_code') stateCode!: string | null;
  @text('pincode') pincode!: string | null;
  @text('country') country!: string;
  @text('contact_person') contactPerson!: string | null;
  @text('notes') notes!: string | null;
  @field('outstanding_amount') outstandingAmount!: number;
  @field('is_favorite') isFavorite!: boolean;
  @text('avatar_color') avatarColor!: string | null;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('invoices') invoices: any;
  @children('payments') payments: any;
  @children('ledger_entries') ledgerEntries: any;
}
