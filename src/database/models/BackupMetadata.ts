import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, text } from '@nozbe/watermelondb/decorators';

export default class BackupMetadata extends Model {
  static table = 'backup_metadata';

  @text('file_name') fileName!: string;
  @field('file_size') fileSize!: number;
  @text('backup_type') backupType!: string;
  @text('status') status!: string;
  @text('google_drive_id') googleDriveId!: string | null;
  @text('description') description!: string | null;
  @readonly @date('created_at') createdAt!: Date;
}
