import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export default class BusinessProfile extends Model {
  static table = 'business_profiles';

  @text('name') name!: string;
  @text('email') email!: string | null;
  @text('phone') phone!: string | null;
  @text('address') address!: string | null;
  @text('city') city!: string | null;
  @text('state') state!: string | null;
  @text('state_code') stateCode!: string | null;
  @text('pincode') pincode!: string | null;
  @text('country') country!: string;
  @text('gst_number') gstNumber!: string | null;
  @text('pan_number') panNumber!: string | null;
  @text('logo_uri') logoUri!: string | null;
  @text('signature_uri') signatureUri!: string | null;
  @text('bank_name') bankName!: string | null;
  @text('bank_account_number') bankAccountNumber!: string | null;
  @text('bank_ifsc') bankIfsc!: string | null;
  @text('upi_id') upiId!: string | null;
  @text('website') website!: string | null;
  @text('invoice_prefix') invoicePrefix!: string;
  @field('invoice_start_number') invoiceStartNumber!: number;
  @text('default_payment_terms') defaultPaymentTerms!: string | null;
  @text('default_notes') defaultNotes!: string | null;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;
}
