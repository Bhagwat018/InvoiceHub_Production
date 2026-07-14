import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export default class Notification extends Model {
  static table = 'notifications';

  @text('title') title!: string;
  @text('message') message!: string;
  @text('type') type!: string;
  @field('is_read') isRead!: boolean;
  @text('action_screen') actionScreen!: string | null;
  @text('action_params') actionParams!: string | null;
  @text('reference_id') referenceId!: string | null;
  @text('reference_type') referenceType!: string | null;
  @readonly @date('created_at') createdAt!: Date;
}
