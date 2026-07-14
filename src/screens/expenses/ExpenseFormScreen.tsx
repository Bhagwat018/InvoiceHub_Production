import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { useTheme, Button } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import { useExpenses } from '../../hooks/useExpenses';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import AmountInput from '../../components/inputs/AmountInput';
import AppSelect from '../../components/inputs/AppSelect';
import AppTextInput from '../../components/inputs/AppTextInput';
import DateInput from '../../components/inputs/DateInput';
import AppSwitch from '../../components/inputs/AppSwitch';
import {
  EXPENSE_TYPES,
  EXPENSE_TYPE_LABELS,
  PAYMENT_MODES,
  PAYMENT_MODE_LABELS,
} from '../../constants';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'ExpenseCreate' | 'ExpenseEdit'>;
type ExpenseFormRouteProp = RouteProp<RootStackParamList, 'ExpenseCreate'> & {
  params?: { expenseId?: string };
};

const EXPENSE_TYPE_OPTIONS = EXPENSE_TYPES.map((type) => ({
  label: EXPENSE_TYPE_LABELS[type],
  value: type,
}));

const PAYMENT_MODE_OPTIONS = PAYMENT_MODES.map((mode) => ({
  label: PAYMENT_MODE_LABELS[mode],
  value: mode,
}));

const RECURRING_OPTIONS = [
  { label: 'Daily', value: 'daily' },
  { label: 'Weekly', value: 'weekly' },
  { label: 'Monthly', value: 'monthly' },
  { label: 'Quarterly', value: 'quarterly' },
  { label: 'Yearly', value: 'yearly' },
];

export default function ExpenseFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<ExpenseFormRouteProp>();

  const { createExpense, updateExpense, getExpense } = useExpenses();

  const expenseId = route.params?.expenseId;
  const isEditing = !!expenseId;

  const [amount, setAmount] = useState(0);
  const [expenseType, setExpenseType] = useState<string>('');
  const [description, setDescription] = useState('');
  const [expenseDate, setExpenseDate] = useState<Date>(new Date());
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [vendorName, setVendorName] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<string>('monthly');
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [amountError, setAmountError] = useState('');
  const [typeError, setTypeError] = useState('');
  const [descriptionError, setDescriptionError] = useState('');

  useEffect(() => {
    if (isEditing && expenseId) {
      getExpense(expenseId).then((expense) => {
        setAmount(expense.amount);
        setExpenseType((expense as any).expenseType || '');
        setDescription(expense.description);
        setExpenseDate(new Date(expense.expenseDate));
        setPaymentMode(expense.paymentMode || 'cash');
        setVendorName(expense.vendorName || '');
        setInvoiceNumber(expense.invoiceNumber || '');
        setIsRecurring(expense.isRecurring);
        setRecurringInterval(expense.recurringInterval || 'monthly');
      }).catch(() => {
        Alert.alert('Error', 'Failed to load expense details');
        navigation.goBack();
      });
    }
  }, [isEditing, expenseId, getExpense, navigation]);

  const validate = useCallback(() => {
    let valid = true;
    setAmountError('');
    setTypeError('');
    setDescriptionError('');

    if (amount <= 0) {
      setAmountError('Please enter a valid amount');
      valid = false;
    }
    if (!expenseType) {
      setTypeError('Please select a category');
      valid = false;
    }
    if (!description.trim()) {
      setDescriptionError('Please enter a description');
      valid = false;
    }
    return valid;
  }, [amount, expenseType, description]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      const data = {
        amount,
        description: description.trim(),
        expenseDate,
        paymentMode: paymentMode as any,
        vendorName: vendorName.trim() || null,
        invoiceNumber: invoiceNumber.trim() || null,
        isRecurring,
        recurringInterval: isRecurring ? (recurringInterval as any) : null,
        notes: notes.trim() || null,
      };

      if (isEditing && expenseId) {
        await updateExpense(expenseId, data);
      } else {
        await createExpense({
          ...data,
          expenseType: expenseType as any,
          expenseNumber: '',
        });
      }
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', `Failed to ${isEditing ? 'update' : 'add'} expense. Please try again.`);
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    isEditing,
    expenseId,
    createExpense,
    updateExpense,
    amount,
    description,
    expenseDate,
    paymentMode,
    vendorName,
    invoiceNumber,
    isRecurring,
    recurringInterval,
    notes,
    expenseType,
    navigation,
  ]);

  return (
    <ScreenContainer scroll keyboardAvoid>
      <ScreenHeader title={isEditing ? 'Edit Expense' : 'Add Expense'} />

      <View style={styles.content}>
        <AmountInput
          label="Amount"
          value={amount}
          onChangeValue={(value) => {
            setAmount(value);
            setAmountError('');
          }}
          error={amountError}
        />

        <AppSelect
          label="Category"
          value={expenseType}
          options={EXPENSE_TYPE_OPTIONS}
          placeholder="Select category"
          onSelect={(value) => {
            setExpenseType(value);
            setTypeError('');
          }}
          error={typeError}
        />

        <AppTextInput
          label="Description"
          value={description}
          onChangeText={(text) => {
            setDescription(text);
            setDescriptionError('');
          }}
          placeholder="What was this expense for?"
          leftIcon="text"
          error={descriptionError}
        />

        <DateInput
          label="Date"
          value={expenseDate}
          onChangeDate={setExpenseDate}
        />

        <AppText variant="labelMedium" color="textSecondary" style={styles.sectionLabel}>
          Payment Mode
        </AppText>
        <View style={styles.modeGrid}>
          {PAYMENT_MODE_OPTIONS.map((option) => {
            const isSelected = paymentMode === option.value;
            return (
              <View
                key={option.value}
                style={[
                  styles.modeChip,
                  {
                    backgroundColor: isSelected
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                    borderColor: isSelected ? theme.colors.primary : theme.colors.border,
                  },
                ]}
              >
                <Button
                  mode="text"
                  compact
                  onPress={() => setPaymentMode(option.value)}
                  labelStyle={[
                    styles.modeLabel,
                    { color: isSelected ? theme.colors.primary : theme.colors.textSecondary },
                  ]}
                >
                  {option.label}
                </Button>
              </View>
            );
          })}
        </View>

        <AppTextInput
          label="Vendor Name"
          value={vendorName}
          onChangeText={setVendorName}
          placeholder="Vendor/Supplier name"
          leftIcon="store"
        />

        <AppTextInput
          label="Invoice Number (Optional)"
          value={invoiceNumber}
          onChangeText={setInvoiceNumber}
          placeholder="Related invoice number"
          leftIcon="file-document"
          autoCapitalize="characters"
        />

        <View style={styles.divider} />

        <AppSwitch
          label="Recurring Expense"
          value={isRecurring}
          onValueChange={setIsRecurring}
          description="Toggle if this expense repeats regularly"
        />

        {isRecurring && (
          <AppSelect
            label="Recurring Interval"
            value={recurringInterval}
            options={RECURRING_OPTIONS}
            placeholder="Select interval"
            onSelect={setRecurringInterval}
          />
        )}

        <AppTextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Additional notes..."
          leftIcon="note-text"
          multiline
          numberOfLines={3}
          textAlignVertical="top"
        />

        <Button
          mode="contained"
          onPress={handleSave}
          loading={isSaving}
          disabled={isSaving}
          style={styles.saveButton}
          contentStyle={styles.saveButtonContent}
        >
          {isEditing ? 'Update Expense' : 'Add Expense'}
        </Button>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  sectionLabel: {
    marginBottom: 8,
  },
  modeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  modeChip: {
    borderRadius: 20,
    borderWidth: 1,
  },
  modeLabel: {
    fontSize: 13,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: '#E0E0E0',
    marginVertical: 8,
  },
  saveButton: {
    marginTop: 16,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
});
