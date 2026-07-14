import { Model } from '@nozbe/watermelondb';
import { field, date, readonly, children, text } from '@nozbe/watermelondb/decorators';

export default class Product extends Model {
  static table = 'products';

  static associations = {
    invoice_items: { type: 'has_many' as const, foreignKey: 'product_id' },
  };

  @text('name') name!: string;
  @text('description') description!: string | null;
  @text('sku') sku!: string | null;
  @text('barcode') barcode!: string | null;
  @text('category') category!: string | null;
  @text('unit') unit!: string;
  @field('purchase_price') purchasePrice!: number;
  @field('selling_price') sellingPrice!: number;
  @field('tax_rate') taxRate!: number;
  @text('tax_type') taxType!: string;
  @field('discount') discount!: number;
  @field('stock_quantity') stockQuantity!: number | null;
  @field('low_stock_threshold') lowStockThreshold!: number | null;
  @text('hsn_code') hsnCode!: string | null;
  @text('image_uri') imageUri!: string | null;
  @field('is_service') isService!: boolean;
  @field('is_active') isActive!: boolean;
  @field('is_deleted') isDeleted!: boolean;
  @readonly @date('created_at') createdAt!: Date;
  @readonly @date('updated_at') updatedAt!: Date;

  @children('invoice_items') invoiceItems: any;
}
