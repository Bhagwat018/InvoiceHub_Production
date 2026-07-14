import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  FlatList,
  TextInput,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useInvoices } from '../../hooks/useInvoices';
import { useProducts } from '../../hooks/useProducts';
import { useCustomers } from '../../hooks/useCustomers';
import AppText from '../../components/common/AppText';
import AppTextInput from '../../components/inputs/AppTextInput';
import AppSelect from '../../components/inputs/AppSelect';
import AppSwitch from '../../components/inputs/AppSwitch';
import AmountInput from '../../components/inputs/AmountInput';
import DateInput from '../../components/inputs/DateInput';
import SearchBar from '../../components/common/SearchBar';
import {
  CURRENCY_SYMBOL,
  GST_RATES,
  UNITS,
  UNIT_LABELS,
  INVOICE_STATUS_LABELS,
} from '../../constants';
import type { InvoiceStackParamList } from '../../navigation/types';
import type { Customer, Product as ProductType, InvoiceItem } from '../../types';

type Nav = NativeStackNavigationProp<InvoiceStackParamList>;
type Route = RouteProp<InvoiceStackParamList, 'InvoiceForm'>;

interface InvoiceItemForm {
  productId: string | null;
  name: string;
  description: string;
  hsnCode: string;
  unit: string;
  quantity: string;
  rate: string;
  discount: string;
  discountType: 'percentage' | 'fixed';
  taxRate: string;
}

interface InvoiceFormData {
  invoiceType: 'invoice' | 'quote' | 'estimate';
  customerId: string;
  invoiceDate: Date;
  dueDate: Date;
  referenceNumber: string;
  items: InvoiceItemForm[];
  discountType: 'percentage' | 'fixed';
  discountValue: string;
  invoiceLevelDiscount: boolean;
  taxType: 'CGST_SGST' | 'IGST';
  roundOff: boolean;
  notes: string;
  termsAndConditions: string;
  shippingCharges: string;
}

function calculateItem(item: InvoiceItemForm) {
  const qty = parseFloat(item.quantity) || 0;
  const rate = parseFloat(item.rate) || 0;
  const taxRate = parseFloat(item.taxRate) || 0;
  const amount = qty * rate;

  let discount = 0;
  if (item.discountType === 'percentage') {
    discount = amount * ((parseFloat(item.discount) || 0) / 100);
  } else {
    discount = parseFloat(item.discount) || 0;
  }

  const taxableAmount = amount - discount;
  const taxAmount = taxableAmount * (taxRate / 100);
  const total = taxableAmount + taxAmount;

  return { amount, discount, taxableAmount, taxAmount, total };
}

export default function InvoiceFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { createInvoice, updateInvoice, getInvoice, getNextInvoiceNumber } = useInvoices();
  const { products, searchProducts } = useProducts();
  const { customers, searchCustomers } = useCustomers();

  const editId = route.params?.invoiceId;
  const prefillCustomerId = route.params?.customerId;
  const isEditing = !!editId;
  const [isSaving, setIsSaving] = useState(false);
  const [showCustomerPicker, setShowCustomerPicker] = useState(false);
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [addingItemIndex, setAddingItemIndex] = useState<number | null>(null);

  const defaultTerms = 'Payment due within 30 days. Goods once sold will not be returned.';
  const defaultInvoiceDate = new Date();
  const defaultDueDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

  const { control, handleSubmit, watch, setValue, reset, getValues } = useForm<InvoiceFormData>({
    defaultValues: {
      invoiceType: 'invoice',
      customerId: prefillCustomerId || '',
      invoiceDate: defaultInvoiceDate,
      dueDate: defaultDueDate,
      referenceNumber: '',
      items: [
        {
          productId: null,
          name: '',
          description: '',
          hsnCode: '',
          unit: 'piece',
          quantity: '1',
          rate: '0',
          discount: '0',
          discountType: 'percentage',
          taxRate: '18',
        },
      ],
      discountType: 'percentage',
      discountValue: '0',
      invoiceLevelDiscount: false,
      taxType: 'CGST_SGST',
      roundOff: true,
      notes: '',
      termsAndConditions: defaultTerms,
      shippingCharges: '0',
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchItems = watch('items');
  const watchDiscountType = watch('discountType');
  const watchDiscountValue = watch('discountValue');
  const watchInvoiceLevelDiscount = watch('invoiceLevelDiscount');
  const watchTaxType = watch('taxType');
  const watchRoundOff = watch('roundOff');
  const watchShippingCharges = watch('shippingCharges');
  const watchCustomerId = watch('customerId');

  useEffect(() => {
    if (editId) {
      getInvoice(editId).then((inv) => {
        reset({
          invoiceType: 'invoice',
          customerId: inv.customerId,
          invoiceDate: new Date(inv.invoiceDate),
          dueDate: new Date(inv.dueDate),
          referenceNumber: inv.referenceNumber || '',
          items: inv.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            description: item.description || '',
            hsnCode: item.hsnCode || '',
            unit: item.unit,
            quantity: String(item.quantity),
            rate: String(item.rate),
            discount: String(item.discount),
            discountType: item.discountType,
            taxRate: String(item.taxRate),
          })),
          discountType: inv.discountType,
          discountValue: String(inv.discountAmount > 0 ? inv.discountAmount : 0),
          invoiceLevelDiscount: inv.discountAmount > 0,
          taxType: inv.igstAmount > 0 ? 'IGST' : 'CGST_SGST',
          roundOff: inv.roundOff !== 0,
          notes: inv.notes || '',
          termsAndConditions: inv.termsAndConditions || defaultTerms,
          shippingCharges: String(inv.shippingCharges || 0),
        });
      });
    }
  }, [editId, getInvoice, reset]);

  const totals = useMemo(() => {
    const items = watchItems || [];
    let totalAmount = 0;
    let totalDiscount = 0;
    let totalTaxable = 0;
    let totalCgst = 0;
    let totalSgst = 0;
    let totalIgst = 0;

    items.forEach((item) => {
      const calc = calculateItem(item);
      totalAmount += calc.amount;
      totalDiscount += calc.discount;
      totalTaxable += calc.taxableAmount;

      const tax = parseFloat(item.taxRate) || 0;
      if (watchTaxType === 'IGST') {
        totalIgst += calc.taxAmount;
      } else {
        totalCgst += calc.taxAmount / 2;
        totalSgst += calc.taxAmount / 2;
      }
    });

    let invoiceDiscount = 0;
    if (watchInvoiceLevelDiscount && parseFloat(watchDiscountValue) > 0) {
      if (watchDiscountType === 'percentage') {
        invoiceDiscount = totalTaxable * ((parseFloat(watchDiscountValue) || 0) / 100);
      } else {
        invoiceDiscount = parseFloat(watchDiscountValue) || 0;
      }
    }

    const afterDiscount = totalTaxable - invoiceDiscount;

    let cgst = totalCgst;
    let sgst = totalSgst;
    let igst = totalIgst;

    if (watchInvoiceLevelDiscount && invoiceDiscount > 0) {
      const discountRatio = invoiceDiscount / (totalTaxable || 1);
      cgst = totalCgst * (1 - discountRatio);
      sgst = totalSgst * (1 - discountRatio);
      igst = totalIgst * (1 - discountRatio);
    }

    const totalTax = cgst + sgst + igst;
    const shipping = parseFloat(watchShippingCharges) || 0;
    let grandTotal = afterDiscount + totalTax + shipping;

    let roundOffAmount = 0;
    if (watchRoundOff) {
      roundOffAmount = Math.round(grandTotal) - grandTotal;
      grandTotal = Math.round(grandTotal);
    }

    return {
      subtotal: totalAmount,
      discount: totalDiscount + invoiceDiscount,
      taxableAmount: afterDiscount,
      cgst,
      sgst,
      igst,
      totalTax,
      roundOff: roundOffAmount,
      grandTotal,
      shipping,
    };
  }, [
    watchItems, watchDiscountType, watchDiscountValue,
    watchInvoiceLevelDiscount, watchTaxType, watchRoundOff,
    watchShippingCharges,
  ]);

  const addItem = useCallback(() => {
    append({
      productId: null,
      name: '',
      description: '',
      hsnCode: '',
      unit: 'piece',
      quantity: '1',
      rate: '0',
      discount: '0',
      discountType: 'percentage',
      taxRate: '18',
    });
  }, [append]);

  const addProductToItem = useCallback(
    (product: ProductType, index: number) => {
      setValue(`items.${index}.productId`, product.id);
      setValue(`items.${index}.name`, product.name);
      setValue(`items.${index}.description`, product.description || '');
      setValue(`items.${index}.hsnCode`, product.hsnCode || '');
      setValue(`items.${index}.unit`, product.unit);
      setValue(`items.${index}.rate`, String(product.price));
      setValue(`items.${index}.taxRate`, String(product.taxRate));
      setShowProductPicker(false);
      setAddingItemIndex(null);
    },
    [setValue],
  );

  const filteredCustomers = useMemo(() => {
    if (!customerSearch.trim()) return customers;
    const q = customerSearch.toLowerCase();
    return customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.phone && c.phone.includes(q)) ||
        (c.email && c.email.toLowerCase().includes(q)),
    );
  }, [customers, customerSearch]);

  const filteredProducts = useMemo(() => {
    if (!productSearch.trim()) return products;
    const q = productSearch.toLowerCase();
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        (p.sku && p.sku.toLowerCase().includes(q)),
    );
  }, [products, productSearch]);

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === watchCustomerId),
    [customers, watchCustomerId],
  );

  const onSubmit = useCallback(
    async (data: InvoiceFormData, status: 'draft' | 'sent') => {
      try {
        setIsSaving(true);
        const items = data.items.map((item) => {
          const calc = calculateItem(item);
          return {
            productId: item.productId,
            name: item.name.trim(),
            description: item.description.trim() || null,
            hsnCode: item.hsnCode.trim() || null,
            unit: item.unit as any,
            quantity: parseFloat(item.quantity) || 0,
            rate: parseFloat(item.rate) || 0,
            discount: parseFloat(item.discount) || 0,
            discountType: item.discountType,
            taxRate: parseFloat(item.taxRate) || 0,
            taxType: data.taxType === 'IGST' ? 'exclusive' as const : 'exclusive' as const,
            taxAmount: calc.taxAmount,
            amount: calc.amount,
            total: calc.total,
          };
        });

        const payload = {
          customerId: data.customerId,
          status,
          invoiceDate: data.invoiceDate.toISOString(),
          dueDate: data.dueDate.toISOString(),
          referenceNumber: data.referenceNumber.trim() || null,
          notes: data.notes.trim() || null,
          termsAndConditions: data.termsAndConditions.trim() || null,
          items,
          discountType: data.discountType,
          discountAmount: totals.discount,
          subtotal: totals.subtotal,
          taxableAmount: totals.taxableAmount,
          cgstAmount: totals.cgst,
          sgstAmount: totals.sgst,
          igstAmount: totals.igst,
          totalTax: totals.totalTax,
          roundOff: totals.roundOff,
          totalAmount: totals.grandTotal,
          amountPaid: 0,
          balanceAmount: totals.grandTotal,
          shippingCharges: totals.shipping,
        };

        if (isEditing && editId) {
          await updateInvoice(editId, payload);
        } else {
          await createInvoice(payload);
        }
        navigation.goBack();
      } catch (err) {
        Alert.alert('Error', 'Failed to save invoice. Please try again.');
      } finally {
        setIsSaving(false);
      }
    },
    [isEditing, editId, totals, createInvoice, updateInvoice, navigation],
  );

  const handleSaveDraft = useCallback(
    (data: InvoiceFormData) => onSubmit(data, 'draft'),
    [onSubmit],
  );

  const handleSaveAndSend = useCallback(
    (data: InvoiceFormData) => onSubmit(data, 'sent'),
    [onSubmit],
  );

  const taxOptions = useMemo(
    () => GST_RATES.map((r) => ({ label: `${r}%`, value: String(r) })),
    [],
  );

  const unitOptions = useMemo(
    () => UNITS.map((u) => ({ label: UNIT_LABELS[u], value: u })),
    [],
  );

  const CustomerPickerModal = () => (
    <Modal visible={showCustomerPicker} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <AppText variant="h4" color="textPrimary">Select Customer</AppText>
            <TouchableOpacity onPress={() => setShowCustomerPicker(false)}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <SearchBar
            placeholder="Search customers..."
            onSearch={setCustomerSearch}
            value={customerSearch}
          />
          <FlatList
            data={filteredCustomers}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.pickerItem,
                  {
                    backgroundColor:
                      item.id === watchCustomerId
                        ? theme.colors.primaryContainer
                        : 'transparent',
                  },
                ]}
                onPress={() => {
                  setValue('customerId', item.id);
                  setShowCustomerPicker(false);
                  setCustomerSearch('');
                }}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyMedium" color="textPrimary">{item.name}</AppText>
                  {item.phone && (
                    <AppText variant="caption" color="textTertiary">{item.phone}</AppText>
                  )}
                </View>
                {item.id === watchCustomerId && (
                  <Icon name="check" size={20} color={theme.colors.primary} />
                )}
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyPicker}>
                <AppText variant="bodyMedium" color="textTertiary">No customers found</AppText>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  const ProductPickerModal = () => (
    <Modal visible={showProductPicker} animationType="slide" transparent>
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor: theme.colors.surface }]}>
          <View style={styles.modalHeader}>
            <AppText variant="h4" color="textPrimary">Select Product</AppText>
            <TouchableOpacity onPress={() => { setShowProductPicker(false); setAddingItemIndex(null); }}>
              <Icon name="close" size={24} color={theme.colors.textSecondary} />
            </TouchableOpacity>
          </View>
          <SearchBar
            placeholder="Search products..."
            onSearch={setProductSearch}
            value={productSearch}
          />
          <FlatList
            data={filteredProducts}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={styles.pickerItem}
                onPress={() => {
                  if (addingItemIndex !== null) {
                    addProductToItem(item, addingItemIndex);
                  }
                  setProductSearch('');
                }}
              >
                <View style={{ flex: 1 }}>
                  <AppText variant="bodyMedium" color="textPrimary">{item.name}</AppText>
                  <AppText variant="caption" color="textTertiary">
                    {CURRENCY_SYMBOL}{item.price.toLocaleString('en-IN')}
                    {item.sku ? ` | SKU: ${item.sku}` : ''}
                  </AppText>
                </View>
                <Icon name="plus-circle" size={24} color={theme.colors.primary} />
              </TouchableOpacity>
            )}
            ListEmptyComponent={
              <View style={styles.emptyPicker}>
                <AppText variant="bodyMedium" color="textTertiary">No products found</AppText>
              </View>
            }
          />
        </View>
      </View>
    </Modal>
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
          <View style={styles.padding}>
            <Controller
              control={control}
              name="invoiceType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.typeSelector}>
                  {(['invoice', 'quote', 'estimate'] as const).map((type) => (
                    <TouchableOpacity
                      key={type}
                      onPress={() => onChange(type)}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            value === type ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                          borderColor:
                            value === type ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelMedium"
                        color={value === type ? 'primary' : 'textSecondary'}
                      >
                        {type.charAt(0).toUpperCase() + type.slice(1)}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            />

            <TouchableOpacity
              style={[styles.customerSelector, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => setShowCustomerPicker(true)}
            >
              {selectedCustomer ? (
                <View style={styles.selectedCustomer}>
                  <View style={[styles.customerAvatar, { backgroundColor: theme.colors.primaryContainer }]}>
                    <AppText variant="h5" color="primary">
                      {selectedCustomer.name.charAt(0)}
                    </AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyLarge" color="textPrimary">{selectedCustomer.name}</AppText>
                    {selectedCustomer.phone && (
                      <AppText variant="caption" color="textTertiary">{selectedCustomer.phone}</AppText>
                    )}
                  </View>
                  <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
                </View>
              ) : (
                <View style={styles.emptyCustomer}>
                  <Icon name="account-plus-outline" size={24} color={theme.colors.primary} />
                  <AppText variant="bodyMedium" color="primary">Select Customer</AppText>
                </View>
              )}
            </TouchableOpacity>

            <View style={styles.dateRow}>
              <View style={styles.dateCol}>
                <Controller
                  control={control}
                  name="invoiceDate"
                  render={({ field: { onChange, value } }) => (
                    <DateInput
                      label="Invoice Date"
                      value={value}
                      onChangeDate={onChange}
                    />
                  )}
                />
              </View>
              <View style={styles.dateCol}>
                <Controller
                  control={control}
                  name="dueDate"
                  render={({ field: { onChange, value } }) => (
                    <DateInput
                      label="Due Date"
                      value={value}
                      onChangeDate={onChange}
                    />
                  )}
                />
              </View>
            </View>

            <Controller
              control={control}
              name="referenceNumber"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Reference Number"
                  placeholder="PO number, etc."
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  leftIcon="referenced"
                />
              )}
            />

            <Controller
              control={control}
              name="taxType"
              render={({ field: { onChange, value } }) => (
                <View style={styles.taxTypeRow}>
                  <AppText variant="labelMedium" color="textSecondary" style={{ marginBottom: 8 }}>
                    Tax Type
                  </AppText>
                  <View style={styles.taxTypeChips}>
                    <TouchableOpacity
                      onPress={() => onChange('CGST_SGST')}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            value === 'CGST_SGST' ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                          borderColor:
                            value === 'CGST_SGST' ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelMedium"
                        color={value === 'CGST_SGST' ? 'primary' : 'textSecondary'}
                      >
                        Intra-state (CGST+SGST)
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => onChange('IGST')}
                      style={[
                        styles.typeChip,
                        {
                          backgroundColor:
                            value === 'IGST' ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
                          borderColor:
                            value === 'IGST' ? theme.colors.primary : theme.colors.border,
                        },
                      ]}
                    >
                      <AppText
                        variant="labelMedium"
                        color={value === 'IGST' ? 'primary' : 'textSecondary'}
                      >
                        Inter-state (IGST)
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              )}
            />

            <View style={styles.itemsHeader}>
              <AppText variant="h5" color="textPrimary">Items</AppText>
              <TouchableOpacity onPress={addItem} style={styles.addItemBtn}>
                <Icon name="plus" size={18} color={theme.colors.primary} />
                <AppText variant="labelMedium" color="primary">Add Item</AppText>
              </TouchableOpacity>
            </View>

            {fields.map((field, index) => {
              const itemCalc = calculateItem(watchItems?.[index] || field);
              return (
                <Surface
                  key={field.id}
                  style={[styles.itemCard, { backgroundColor: theme.colors.surface }]}
                  elevation={1}
                >
                  <View style={styles.itemHeader}>
                    <AppText variant="labelMedium" color="textSecondary">
                      Item {index + 1}
                    </AppText>
                    <View style={styles.itemHeaderActions}>
                      <TouchableOpacity
                        onPress={() => {
                          setAddingItemIndex(index);
                          setShowProductPicker(true);
                        }}
                        style={styles.itemAction}
                      >
                        <Icon name="package-variant" size={18} color={theme.colors.primary} />
                      </TouchableOpacity>
                      {fields.length > 1 && (
                        <TouchableOpacity
                          onPress={() => remove(index)}
                          style={styles.itemAction}
                        >
                          <Icon name="delete-outline" size={18} color={theme.colors.error} />
                        </TouchableOpacity>
                      )}
                    </View>
                  </View>

                  <Controller
                    control={control}
                    name={`items.${index}.name`}
                    rules={{ required: 'Name is required' }}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppTextInput
                        placeholder="Item name *"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <Controller
                    control={control}
                    name={`items.${index}.description`}
                    render={({ field: { onChange, onBlur, value } }) => (
                      <AppTextInput
                        placeholder="Description (optional)"
                        value={value}
                        onChangeText={onChange}
                        onBlur={onBlur}
                      />
                    )}
                  />

                  <View style={styles.itemRow}>
                    <Controller
                      control={control}
                      name={`items.${index}.quantity`}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.itemCol}>
                          <AppText variant="caption" color="textTertiary">Qty</AppText>
                          <TextInput
                            style={[styles.itemInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                            value={value}
                            onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
                            keyboardType="decimal-pad"
                            placeholder="1"
                            placeholderTextColor={theme.colors.inputPlaceholder}
                          />
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`items.${index}.unit`}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.itemCol}>
                          <AppText variant="caption" color="textTertiary">Unit</AppText>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert('Select Unit', '', unitOptions.map((opt) => ({
                                text: opt.label,
                                onPress: () => onChange(opt.value),
                              })).concat([{ text: 'Cancel', style: 'cancel' }]));
                            }}
                            style={[styles.itemInput, styles.unitSelector, { borderColor: theme.colors.border }]}
                          >
                            <AppText variant="bodySmall" color="textPrimary">
                              {UNIT_LABELS[value as keyof typeof UNIT_LABELS] || value}
                            </AppText>
                            <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`items.${index}.rate`}
                      render={({ field: { onChange, value } }) => (
                        <View style={[styles.itemCol, { flex: 1.5 }]}>
                          <AppText variant="caption" color="textTertiary">Rate</AppText>
                          <TextInput
                            style={[styles.itemInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                            value={value}
                            onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
                            keyboardType="decimal-pad"
                            placeholder="0.00"
                            placeholderTextColor={theme.colors.inputPlaceholder}
                          />
                        </View>
                      )}
                    />
                  </View>

                  <View style={styles.itemRow}>
                    <Controller
                      control={control}
                      name={`items.${index}.discount`}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.itemCol}>
                          <AppText variant="caption" color="textTertiary">Discount</AppText>
                          <TextInput
                            style={[styles.itemInput, { color: theme.colors.textPrimary, borderColor: theme.colors.border }]}
                            value={value}
                            onChangeText={(t) => onChange(t.replace(/[^0-9.]/g, ''))}
                            keyboardType="decimal-pad"
                            placeholder="0"
                            placeholderTextColor={theme.colors.inputPlaceholder}
                          />
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`items.${index}.discountType`}
                      render={({ field: { onChange, value } }) => (
                        <View style={styles.itemCol}>
                          <AppText variant="caption" color="textTertiary">Type</AppText>
                          <TouchableOpacity
                            onPress={() => onChange(value === 'percentage' ? 'fixed' : 'percentage')}
                            style={[styles.itemInput, styles.unitSelector, { borderColor: theme.colors.border }]}
                          >
                            <AppText variant="bodySmall" color="textPrimary">
                              {value === 'percentage' ? '%' : CURRENCY_SYMBOL}
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      )}
                    />

                    <Controller
                      control={control}
                      name={`items.${index}.taxRate`}
                      render={({ field: { onChange, value } }) => (
                        <View style={[styles.itemCol, { flex: 1.5 }]}>
                          <AppText variant="caption" color="textTertiary">GST %</AppText>
                          <TouchableOpacity
                            onPress={() => {
                              Alert.alert('GST Rate', '', taxOptions.map((opt) => ({
                                text: opt.label,
                                onPress: () => onChange(opt.value),
                              })).concat([{ text: 'Cancel', style: 'cancel' }]));
                            }}
                            style={[styles.itemInput, styles.unitSelector, { borderColor: theme.colors.border }]}
                          >
                            <AppText variant="bodySmall" color="textPrimary">{value}%</AppText>
                            <Icon name="chevron-down" size={14} color={theme.colors.textTertiary} />
                          </TouchableOpacity>
                        </View>
                      )}
                    />
                  </View>

                  <View style={[styles.itemTotal, { borderTopColor: theme.colors.divider }]}>
                    <AppText variant="caption" color="textTertiary">Amount</AppText>
                    <AppText variant="price" color="primary">
                      {CURRENCY_SYMBOL}{itemCalc.total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                    </AppText>
                  </View>
                </Surface>
              );
            })}

            <TouchableOpacity style={styles.addItemFull} onPress={addItem}>
              <Icon name="plus-circle-outline" size={20} color={theme.colors.primary} />
              <AppText variant="labelMedium" color="primary" style={{ marginLeft: 8 }}>
                Add Another Item
              </AppText>
            </TouchableOpacity>

            <Controller
              control={control}
              name="invoiceLevelDiscount"
              render={({ field: { onChange, value } }) => (
                <AppSwitch
                  label="Apply Invoice-level Discount"
                  value={value}
                  onValueChange={onChange}
                />
              )}
            />

            {watchInvoiceLevelDiscount && (
              <View style={styles.discountRow}>
                <View style={{ flex: 1 }}>
                  <Controller
                    control={control}
                    name="discountValue"
                    render={({ field: { onChange, value } }) => (
                      <AppTextInput
                        placeholder="Discount"
                        value={value}
                        onChangeText={onChange}
                        keyboardType="decimal-pad"
                      />
                    )}
                  />
                </View>
                <Controller
                  control={control}
                  name="discountType"
                  render={({ field: { onChange, value } }) => (
                    <TouchableOpacity
                      onPress={() => onChange(value === 'percentage' ? 'fixed' : 'percentage')}
                      style={[styles.discountTypeBtn, { backgroundColor: theme.colors.surfaceVariant, borderColor: theme.colors.border }]}
                    >
                      <AppText variant="labelMedium" color="textPrimary">
                        {value === 'percentage' ? '% Flat' : `${CURRENCY_SYMBOL} Flat`}
                      </AppText>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            <Controller
              control={control}
              name="shippingCharges"
              render={({ field: { onChange, value } }) => (
                <AmountInput
                  label="Shipping Charges"
                  value={parseFloat(value) || 0}
                  onChangeValue={(v) => onChange(String(v))}
                  placeholder="0.00"
                />
              )}
            />

            <Controller
              control={control}
              name="roundOff"
              render={({ field: { onChange, value } }) => (
                <AppSwitch
                  label="Round Off Total"
                  description="Round the total to nearest integer"
                  value={value}
                  onValueChange={onChange}
                />
              )}
            />

            <Surface style={[styles.totalsCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={styles.totalRow}>
                <AppText variant="bodyMedium" color="textSecondary">Subtotal</AppText>
                <AppText variant="bodyMedium" color="textPrimary">
                  {CURRENCY_SYMBOL}{totals.subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </AppText>
              </View>
              {totals.discount > 0 && (
                <View style={styles.totalRow}>
                  <AppText variant="bodyMedium" color="textSecondary">Discount</AppText>
                  <AppText variant="bodyMedium" color="error">
                    -{CURRENCY_SYMBOL}{totals.discount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </AppText>
                </View>
              )}
              {totals.cgst > 0 && (
                <View style={styles.totalRow}>
                  <AppText variant="bodySmall" color="textTertiary">CGST</AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {CURRENCY_SYMBOL}{totals.cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </AppText>
                </View>
              )}
              {totals.sgst > 0 && (
                <View style={styles.totalRow}>
                  <AppText variant="bodySmall" color="textTertiary">SGST</AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {CURRENCY_SYMBOL}{totals.sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </AppText>
                </View>
              )}
              {totals.igst > 0 && (
                <View style={styles.totalRow}>
                  <AppText variant="bodySmall" color="textTertiary">IGST</AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {CURRENCY_SYMBOL}{totals.igst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </AppText>
                </View>
              )}
              {totals.shipping > 0 && (
                <View style={styles.totalRow}>
                  <AppText variant="bodySmall" color="textTertiary">Shipping</AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {CURRENCY_SYMBOL}{totals.shipping.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                  </AppText>
                </View>
              )}
              {totals.roundOff !== 0 && (
                <View style={styles.totalRow}>
                  <AppText variant="bodySmall" color="textTertiary">Round Off</AppText>
                  <AppText variant="bodySmall" color="textSecondary">
                    {totals.roundOff > 0 ? '+' : ''}{CURRENCY_SYMBOL}{totals.roundOff.toFixed(2)}
                  </AppText>
                </View>
              )}
              <View style={[styles.totalRow, styles.grandTotalRow, { borderTopColor: theme.colors.border }]}>
                <AppText variant="h4" color="textPrimary">Total</AppText>
                <AppText variant="priceLarge" color="primary">
                  {CURRENCY_SYMBOL}{totals.grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                </AppText>
              </View>
            </Surface>

            <Controller
              control={control}
              name="notes"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Notes"
                  placeholder="Additional notes for the customer"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={3}
                  leftIcon="note-text-outline"
                />
              )}
            />

            <Controller
              control={control}
              name="termsAndConditions"
              render={({ field: { onChange, onBlur, value } }) => (
                <AppTextInput
                  label="Terms & Conditions"
                  placeholder="Terms and conditions"
                  value={value}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  multiline
                  numberOfLines={4}
                  leftIcon="file-document-outline"
                />
              )}
            />

            <View style={{ height: 120 }} />
          </View>
        </ScrollView>

        <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
          <TouchableOpacity
            style={[styles.draftBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleSubmit(handleSaveDraft)}
            disabled={isSaving}
          >
            <Icon name="content-save-outline" size={18} color={theme.colors.textSecondary} />
            <AppText variant="labelMedium" color="textSecondary">
              {isSaving ? 'Saving...' : 'Save Draft'}
            </AppText>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.sendBtn, { backgroundColor: theme.colors.primary }]}
            onPress={handleSubmit(handleSaveAndSend)}
            disabled={isSaving}
          >
            <Icon name="send" size={18} color={theme.colors.onPrimary} />
            <AppText variant="labelLarge" color="textInverse">
              Save & Send
            </AppText>
          </TouchableOpacity>
        </View>

        <CustomerPickerModal />
        <ProductPickerModal />
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 16 },
  typeSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
  },
  customerSelector: {
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 16,
  },
  selectedCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  customerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  emptyCustomer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  dateRow: { flexDirection: 'row', gap: 12 },
  dateCol: { flex: 1 },
  taxTypeRow: { marginBottom: 16 },
  taxTypeChips: { flexDirection: 'row', gap: 8 },
  itemsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  addItemBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  itemCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  itemHeaderActions: {
    flexDirection: 'row',
    gap: 8,
  },
  itemAction: { padding: 4 },
  itemRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  itemCol: { flex: 1 },
  itemInput: {
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
    backgroundColor: 'transparent',
  },
  unitSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  itemTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    marginTop: 4,
  },
  addItemFull: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 12,
    borderColor: '#E0E0E0',
    marginBottom: 16,
  },
  discountRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-end',
    marginBottom: 16,
  },
  discountTypeBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 16,
  },
  totalsCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  grandTotalRow: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 8,
  },
  bottomBar: {
    flexDirection: 'row',
    padding: 12,
    paddingBottom: 32,
    gap: 10,
    borderTopWidth: 1,
  },
  draftBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  sendBtn: {
    flex: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 12,
    gap: 6,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 34,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 12,
  },
  pickerItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  emptyPicker: {
    padding: 32,
    alignItems: 'center',
  },
});
