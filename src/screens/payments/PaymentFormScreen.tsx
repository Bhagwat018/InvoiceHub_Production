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
import { usePayments } from '../../hooks/usePayments';
import { useCustomers } from '../../hooks/useCustomers';
import { useInvoices } from '../../hooks/useInvoices';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import AmountInput from '../../components/inputs/AmountInput';
import AppSelect from '../../components/inputs/AppSelect';
import AppTextInput from '../../components/inputs/AppTextInput';
import DateInput from '../../components/inputs/DateInput';
import { PAYMENT_MODES, PAYMENT_MODE_LABELS, CURRENCY_SYMBOL } from '../../constants';
import type { RootStackParamList } from '../../navigation/types';

type NavigationProp = NativeStackNavigationProp<RootStackParamList, 'PaymentCreate'>;
type PaymentFormRouteProp = RouteProp<RootStackParamList, 'PaymentCreate'>;

const PAYMENT_MODE_OPTIONS = PAYMENT_MODES.map((mode) => ({
  label: PAYMENT_MODE_LABELS[mode],
  value: mode,
}));

export default function PaymentFormScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();
  const route = useRoute<PaymentFormRouteProp>();

  const { createPayment } = usePayments();
  const { customers } = useCustomers();
  const { invoices, getInvoice } = useInvoices();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string>(route.params?.invoiceId || '');
  const [amount, setAmount] = useState(0);
  const [paymentMode, setPaymentMode] = useState<string>('cash');
  const [referenceNumber, setReferenceNumber] = useState('');
  const [paymentDate, setPaymentDate] = useState<Date>(new Date());
  const [notes, setNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const [customerError, setCustomerError] = useState('');
  const [amountError, setAmountError] = useState('');

  const customerOptions = customers.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const filteredInvoices = selectedCustomerId
    ? invoices.filter(
        (inv) =>
          inv.customer?.id === selectedCustomerId &&
          inv.status !== 'paid' &&
          inv.status !== 'cancelled'
      )
    : invoices.filter((inv) => inv.status !== 'paid' && inv.status !== 'cancelled');

  const invoiceOptions = filteredInvoices.map((inv) => ({
    label: `${inv.invoiceNumber} (${CURRENCY_SYMBOL}${inv.balanceAmount.toLocaleString('en-IN')} pending)`,
    value: inv.id,
  }));

  const selectedInvoice = filteredInvoices.find((inv) => inv.id === selectedInvoiceId);

  useEffect(() => {
    if (route.params?.invoiceId) {
      setSelectedInvoiceId(route.params.invoiceId);
      getInvoice(route.params.invoiceId).then((inv) => {
        setSelectedCustomerId(inv.customer?.id || '');
      }).catch(() => {});
    }
  }, [route.params?.invoiceId, getInvoice]);

  const validate = useCallback(() => {
    let valid = true;
    setCustomerError('');
    setAmountError('');

    if (!selectedCustomerId) {
      setCustomerError('Please select a customer');
      valid = false;
    }
    if (amount <= 0) {
      setAmountError('Please enter a valid amount');
      valid = false;
    }
    if (selectedInvoice && amount > selectedInvoice.balanceAmount) {
      setAmountError(`Amount cannot exceed pending balance of ${CURRENCY_SYMBOL}${selectedInvoice.balanceAmount.toLocaleString('en-IN')}`);
      valid = false;
    }
    return valid;
  }, [selectedCustomerId, amount, selectedInvoice]);

  const handleSave = useCallback(async () => {
    if (!validate()) return;

    try {
      setIsSaving(true);
      await createPayment({
        invoiceId: selectedInvoiceId || '',
        customerId: selectedCustomerId,
        amount,
        paymentMode: paymentMode as any,
        referenceNumber: referenceNumber || null,
        notes: notes || null,
        paymentDate,
      });
      navigation.goBack();
    } catch (err) {
      Alert.alert('Error', 'Failed to record payment. Please try again.');
    } finally {
      setIsSaving(false);
    }
  }, [
    validate,
    createPayment,
    selectedInvoiceId,
    selectedCustomerId,
    amount,
    paymentMode,
    referenceNumber,
    notes,
    paymentDate,
    navigation,
  ]);

  return (
    <ScreenContainer scroll keyboardAvoid>
      <ScreenHeader title="Record Payment" />

      <View style={styles.content}>
        <AppSelect
          label="Customer"
          value={selectedCustomerId}
          options={customerOptions}
          placeholder="Select customer"
          onSelect={(value) => {
            setSelectedCustomerId(value);
            setCustomerError('');
          }}
          error={customerError}
        />

        <AppSelect
          label="Invoice (Optional)"
          value={selectedInvoiceId}
          options={invoiceOptions}
          placeholder="Select invoice"
          onSelect={(value) => setSelectedInvoiceId(value)}
        />

        {selectedInvoice && (
          <View style={[styles.invoiceInfo, { backgroundColor: theme.colors.primaryContainer }]}>
            <AppText variant="labelMedium" color="primary">
              Pending: {CURRENCY_SYMBOL}{selectedInvoice.balanceAmount.toLocaleString('en-IN')}
            </AppText>
          </View>
        )}

        <AmountInput
          label="Amount"
          value={amount}
          onChangeValue={(value) => {
            setAmount(value);
            setAmountError('');
          }}
          error={amountError}
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
          label="Reference Number"
          value={referenceNumber}
          onChangeText={setReferenceNumber}
          placeholder="Cheque number, UPI ID, etc."
          leftIcon="identifier"
          autoCapitalize="none"
        />

        <DateInput
          label="Payment Date"
          value={paymentDate}
          onChangeDate={setPaymentDate}
        />

        <AppTextInput
          label="Notes"
          value={notes}
          onChangeText={setNotes}
          placeholder="Add any notes..."
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
          Record Payment
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
  invoiceInfo: {
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  saveButton: {
    marginTop: 8,
    borderRadius: 12,
  },
  saveButtonContent: {
    paddingVertical: 6,
  },
});
