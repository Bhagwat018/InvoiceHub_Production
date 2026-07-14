import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Platform,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useForm, Controller } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useProducts } from '../../hooks/useProducts';
import AppText from '../../components/common/AppText';
import AppTextInput from '../../components/inputs/AppTextInput';
import AppSelect from '../../components/inputs/AppSelect';
import AppSwitch from '../../components/inputs/AppSwitch';
import AmountInput from '../../components/inputs/AmountInput';
import { GST_RATES, UNITS, UNIT_LABELS, CURRENCY_SYMBOL } from '../../constants';
import type { RootStackParamList } from '../../navigation/types';

type Nav = NativeStackNavigationProp<RootStackParamList>;
type Route = RouteProp<RootStackParamList, 'ProductForm'>;

interface ProductFormData {
  name: string;
  description: string;
  sku: string;
  barcode: string;
  hsnCode: string;
  category: string;
  unit: string;
  costPrice: string;
  price: string;
  taxRate: string;
  stock: string;
  lowStockThreshold: string;
  isService: boolean;
}

export default function ProductFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { createProduct, updateProduct, getProduct } = useProducts();

  const editId = route.params?.productId;
  const isEditing = !!editId;
  const [isLoadingProduct, setIsLoadingProduct] = useState(isEditing);
  const [isSaving, setIsSaving] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<ProductFormData>({
    defaultValues: {
      name: '',
      description: '',
      sku: '',
      barcode: '',
      hsnCode: '',
      category: '',
      unit: 'piece',
      costPrice: '',
      price: '',
      taxRate: '18',
      stock: '',
      lowStockThreshold: '',
      isService: false,
    },
  });

  useEffect(() => {
    if (editId) {
      getProduct(editId).then((product) => {
        reset({
          name: product.name,
          description: product.description || '',
          sku: product.sku || '',
          barcode: product.barcode || '',
          hsnCode: product.hsnCode || '',
          category: product.category || '',
          unit: product.unit,
          costPrice: product.costPrice ? String(product.costPrice) : '',
          price: String(product.price),
          taxRate: String(product.taxRate),
          stock: product.stock !== null ? String(product.stock) : '',
          lowStockThreshold: product.lowStockThreshold !== null ? String(product.lowStockThreshold) : '',
          isService: product.stock === null,
        });
        setIsLoadingProduct(false);
      });
    }
  }, [editId, getProduct, reset]);

  const watchCostPrice = watch('costPrice');
  const watchPrice = watch('price');
  const watchIsService = watch('isService');

  const profitMargin = useMemo(() => {
    const cp = parseFloat(watchCostPrice) || 0;
    const sp = parseFloat(watchPrice) || 0;
    if (cp > 0 && sp > 0) {
      return (((sp - cp) / cp) * 100).toFixed(1);
    }
    return null;
  }, [watchCostPrice, watchPrice]);

  const onSubmit = useCallback(
    async (data: ProductFormData) => {
      try {
        setIsSaving(true);
        const payload = {
          name: data.name.trim(),
          description: data.description.trim() || null,
          sku: data.sku.trim() || null,
          barcode: data.barcode.trim() || null,
          hsnCode: data.hsnCode.trim() || null,
          category: data.category.trim() || null,
          unit: data.unit as any,
          price: parseFloat(data.price) || 0,
          costPrice: data.costPrice ? parseFloat(data.costPrice) : null,
          taxRate: parseFloat(data.taxRate) || 0,
          stock: data.isService ? null : (data.stock ? parseInt(data.stock, 10) : null),
          lowStockThreshold: data.lowStockThreshold ? parseInt(data.lowStockThreshold, 10) : null,
          taxType: 'exclusive' as const,
          isActive: true,
        };

        if (isEditing && editId) {
          await updateProduct(editId, payload);
        } else {
          await createProduct(payload);
        }
        navigation.goBack();
      } catch (err) {
        Alert.alert('Error', 'Failed to save product. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [isEditing, editId, createProduct, updateProduct, navigation],
  );

  const unitOptions = useMemo(
    () => UNITS.map((u) => ({ label: UNIT_LABELS[u], value: u })),
    [],
  );

  const taxOptions = useMemo(
    () => GST_RATES.map((r) => ({ label: `${r}%`, value: String(r) })),
    [],
  );

  if (isLoadingProduct) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, alignItems: 'center', justifyContent: 'center' }]}>
        <AppText variant="bodyMedium" color="textTertiary">Loading product...</AppText>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.padding}>
          <View style={[styles.imagePicker, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}>
            <Icon name="camera-plus-outline" size={40} color={theme.colors.textTertiary} />
            <AppText variant="caption" color="textTertiary" style={{ marginTop: 8 }}>
              Add Product Image
            </AppText>
          </View>

          <Controller
            control={control}
            name="name"
            rules={{ required: 'Product name is required' }}
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Product Name *"
                placeholder="Enter product name"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                error={errors.name?.message}
                leftIcon="tag-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Description"
                placeholder="Product description"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                multiline
                numberOfLines={3}
                leftIcon="text-box-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="sku"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="SKU"
                placeholder="Stock keeping unit"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="barcode"
              />
            )}
          />

          <Controller
            control={control}
            name="barcode"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Barcode"
                placeholder="Scan or enter barcode"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="qrcode-scan"
                rightIcon="camera"
              />
            )}
          />

          <Controller
            control={control}
            name="hsnCode"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="HSN Code"
                placeholder="Harmonized System Code"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="identifier"
              />
            )}
          />

          <Controller
            control={control}
            name="category"
            render={({ field: { onChange, onBlur, value } }) => (
              <AppTextInput
                label="Category"
                placeholder="Product category"
                value={value}
                onChangeText={onChange}
                onBlur={onBlur}
                leftIcon="folder-outline"
              />
            )}
          />

          <Controller
            control={control}
            name="unit"
            render={({ field: { onChange, value } }) => (
              <AppSelect
                label="Unit"
                value={value}
                options={unitOptions}
                onSelect={onChange}
                placeholder="Select unit"
              />
            )}
          />

          <View style={styles.priceRow}>
            <View style={styles.priceCol}>
              <Controller
                control={control}
                name="costPrice"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AmountInput
                    label="Purchase Price"
                    value={parseFloat(value) || 0}
                    onChangeValue={(v) => onChange(String(v))}
                    placeholder="0.00"
                  />
                )}
              />
            </View>
            <View style={styles.priceCol}>
              <Controller
                control={control}
                name="price"
                rules={{ required: 'Selling price is required' }}
                render={({ field: { onChange, onBlur, value } }) => (
                  <AmountInput
                    label="Selling Price *"
                    value={parseFloat(value) || 0}
                    onChangeValue={(v) => onChange(String(v))}
                    placeholder="0.00"
                    error={errors.price?.message}
                  />
                )}
              />
            </View>
          </View>

          {profitMargin && (
            <Surface style={[styles.marginBanner, { backgroundColor: theme.colors.successContainer }]} elevation={0}>
              <Icon name="trending-up" size={18} color={theme.colors.success} />
              <AppText variant="labelMedium" color="success" style={{ marginLeft: 8 }}>
                Profit Margin: {profitMargin}%
              </AppText>
            </Surface>
          )}

          <Controller
            control={control}
            name="taxRate"
            render={({ field: { onChange, value } }) => (
              <AppSelect
                label="GST Rate"
                value={value}
                options={taxOptions}
                onSelect={onChange}
                placeholder="Select GST rate"
              />
            )}
          />

          <Controller
            control={control}
            name="isService"
            render={({ field: { onChange, value } }) => (
              <AppSwitch
                label="Service Item"
                description="Toggle if this is a service (no stock tracking)"
                value={value}
                onValueChange={onChange}
              />
            )}
          />

          {!watchIsService && (
            <>
              <Controller
                control={control}
                name="stock"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppTextInput
                    label="Stock Quantity"
                    placeholder="0"
                    value={value}
                    onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    leftIcon="package-variant-closed"
                  />
                )}
              />

              <Controller
                control={control}
                name="lowStockThreshold"
                render={({ field: { onChange, onBlur, value } }) => (
                  <AppTextInput
                    label="Low Stock Threshold"
                    placeholder="Alert when stock reaches"
                    value={value}
                    onChangeText={(t) => onChange(t.replace(/[^0-9]/g, ''))}
                    onBlur={onBlur}
                    keyboardType="number-pad"
                    leftIcon="alert-circle-outline"
                  />
                )}
              />
            </>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: theme.colors.primary }]}
          onPress={handleSubmit(onSubmit)}
          disabled={isSaving}
        >
          <Icon name="check" size={20} color={theme.colors.onPrimary} />
          <AppText variant="labelLarge" color="textInverse">
            {isSaving ? 'Saving...' : isEditing ? 'Update Product' : 'Save Product'}
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 16 },
  imagePicker: {
    height: 160,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  priceRow: { flexDirection: 'row', gap: 12 },
  priceCol: { flex: 1 },
  marginBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bottomBar: {
    padding: 16,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  saveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 8,
  },
});
