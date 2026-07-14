import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children, text } from '@nozbe/watermelondb/decorators';

export default class ExpenseCategory extends Model {
  static table = 'expense_categories';

  static associations = {
    expenses: { type: 'has_many' as const, foreignKey: 'category_id' },
  };

  @text('name') name!: string;
  @text('icon') icon!: string | null;
  @text('color') color!: string | null;
  @field('is_default') isDefault!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('expenses') expenses: any;
}
