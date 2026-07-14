import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Share,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RouteProp } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useInvoices } from '../../hooks/useInvoices';
import AppText from '../../components/common/AppText';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL, INVOICE_STATUS_LABELS, PAYMENT_MODE_LABELS } from '../../constants';
import type { InvoiceStackParamList } from '../../navigation/types';
import type { Invoice, InvoiceStatus, Payment } from '../../types';

type Nav = NativeStackNavigationProp<InvoiceStackParamList>;
type Route = RouteProp<InvoiceStackParamList, 'InvoiceDetail'>;

function numberToWords(num: number): string {
  if (num === 0) return 'Zero';
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
    'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const convert = (n: number): string => {
    if (n < 20) return ones[n];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
    if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' and ' + convert(n % 100) : '');
    if (n < 100000) return convert(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + convert(n % 1000) : '');
    if (n < 10000000) return convert(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + convert(n % 100000) : '');
    return convert(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + convert(n % 10000000) : '');
  };

  const rupees = Math.floor(num);
  const paise = Math.round((num - rupees) * 100);
  let result = convert(rupees) + ' Rupees';
  if (paise > 0) result += ' and ' + convert(paise) + ' Paise';
  result += ' Only';
  return result;
}

export default function InvoiceDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getInvoice, deleteInvoice, updateStatus, recordPayment } = useInvoices();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getInvoice(route.params.invoiceId);
        setInvoice(data);
      } catch {} finally {
        setIsLoading(false);
      }
    };
    load();
  }, [route.params.invoiceId, getInvoice]);

  const handleDelete = useCallback(() => {
    if (!invoice) return;
    Alert.alert('Delete Invoice', `Delete ${invoice.invoiceNumber}? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteInvoice(invoice.id);
            navigation.goBack();
          } catch {}
        },
      },
    ]);
  }, [invoice, deleteInvoice, navigation]);

  const handleCancel = useCallback(() => {
    if (!invoice) return;
    Alert.alert('Cancel Invoice', 'Mark this invoice as cancelled?', [
      { text: 'No', style: 'cancel' },
      {
        text: 'Yes, Cancel',
        style: 'destructive',
        onPress: async () => {
          await updateStatus(invoice.id, 'cancelled');
          const updated = await getInvoice(invoice.id);
          setInvoice(updated);
        },
      },
    ]);
  }, [invoice, updateStatus, getInvoice]);

  const handleRecordPayment = useCallback(() => {
    if (!invoice) return;
    navigation.navigate('InvoiceForm', { invoiceId: invoice.id });
  }, [invoice, navigation]);

  const handleShare = useCallback(async () => {
    if (!invoice) return;
    const text = [
      `Invoice: ${invoice.invoiceNumber}`,
      `Customer: ${invoice.customer.name}`,
      `Amount: ${CURRENCY_SYMBOL}${invoice.totalAmount.toLocaleString('en-IN')}`,
      `Status: ${INVOICE_STATUS_LABELS[invoice.status as InvoiceStatus]}`,
    ].join('\n');
    await Share.share({ message: text });
  }, [invoice]);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, padding: 16 }]}>
        <SkeletonLoader width="50%" height={24} />
        <SkeletonLoader width="100%" height={200} borderRadius={12} marginTop={16} />
        <SkeletonLoader width="100%" height={300} borderRadius={12} marginTop={16} />
      </View>
    );
  }

  if (!invoice) return null;

  const isCancelled = invoice.status === 'cancelled';
  const isPaid = invoice.status === 'paid';
  const canRecordPayment = !isPaid && !isCancelled && invoice.balanceAmount > 0;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.padding}>
          <View style={styles.headerRow}>
            <View style={{ flex: 1 }}>
              <AppText variant="h3" color="textPrimary">
                {invoice.invoiceNumber}
              </AppText>
              <AppText variant="bodySmall" color="textTertiary" style={{ marginTop: 4 }}>
                {formatDate(invoice.invoiceDate)}
              </AppText>
            </View>
            <Badge status={invoice.status as InvoiceStatus} size="medium" />
          </View>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Business Details
            </AppText>
            <InfoLine label="Name" value="Your Business" />
            <InfoLine label="Address" value="Business Address" />
            <InfoLine label="GSTIN" value="22AAAAA0000A1Z5" />
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Bill To
            </AppText>
            <InfoLine label="Name" value={invoice.customer.name} />
            {invoice.customer.phone && <InfoLine label="Phone" value={invoice.customer.phone} />}
            {invoice.customer.email && <InfoLine label="Email" value={invoice.customer.email} />}
            {invoice.customer.gstNumber && <InfoLine label="GSTIN" value={invoice.customer.gstNumber} />}
            {invoice.customer.address && <InfoLine label="Address" value={invoice.customer.address} />}
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Items
            </AppText>
            <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
              <AppText variant="labelSmall" color="textTertiary" style={styles.colSno}>#</AppText>
              <AppText variant="labelSmall" color="textTertiary" style={styles.colDesc}>Description</AppText>
              <AppText variant="labelSmall" color="textTertiary" style={styles.colQty}>Qty</AppText>
              <AppText variant="labelSmall" color="textTertiary" style={styles.colRate}>Rate</AppText>
              <AppText variant="labelSmall" color="textTertiary" style={styles.colAmt}>Amount</AppText>
            </View>
            {invoice.items.map((item, idx) => (
              <View key={item.id} style={[styles.tableRow, { borderBottomColor: theme.colors.divider }]}>
                <AppText variant="bodySmall" color="textSecondary" style={styles.colSno}>{idx + 1}</AppText>
                <AppText variant="bodySmall" color="textPrimary" style={styles.colDesc} numberOfLines={2}>
                  {item.name}
                </AppText>
                <AppText variant="bodySmall" color="textSecondary" style={styles.colQty}>
                  {item.quantity}
                </AppText>
                <AppText variant="bodySmall" color="textSecondary" style={styles.colRate}>
                  {CURRENCY_SYMBOL}{item.rate.toLocaleString('en-IN')}
                </AppText>
                <AppText variant="bodySmall" color="textPrimary" style={styles.colAmt}>
                  {CURRENCY_SYMBOL}{item.total.toLocaleString('en-IN')}
                </AppText>
              </View>
            ))}
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.totalRow}>
              <AppText variant="bodyMedium" color="textSecondary">Subtotal</AppText>
              <AppText variant="bodyMedium" color="textPrimary">
                {CURRENCY_SYMBOL}{invoice.subtotal.toLocaleString('en-IN')}
              </AppText>
            </View>
            {invoice.discountAmount > 0 && (
              <View style={styles.totalRow}>
                <AppText variant="bodyMedium" color="textSecondary">Discount</AppText>
                <AppText variant="bodyMedium" color="error">
                  -{CURRENCY_SYMBOL}{invoice.discountAmount.toLocaleString('en-IN')}
                </AppText>
              </View>
            )}
            {invoice.cgstAmount > 0 && (
              <View style={styles.totalRow}>
                <AppText variant="bodySmall" color="textTertiary">CGST</AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {CURRENCY_SYMBOL}{invoice.cgstAmount.toLocaleString('en-IN')}
                </AppText>
              </View>
            )}
            {invoice.sgstAmount > 0 && (
              <View style={styles.totalRow}>
                <AppText variant="bodySmall" color="textTertiary">SGST</AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {CURRENCY_SYMBOL}{invoice.sgstAmount.toLocaleString('en-IN')}
                </AppText>
              </View>
            )}
            {invoice.igstAmount > 0 && (
              <View style={styles.totalRow}>
                <AppText variant="bodySmall" color="textTertiary">IGST</AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {CURRENCY_SYMBOL}{invoice.igstAmount.toLocaleString('en-IN')}
                </AppText>
              </View>
            )}
            {invoice.roundOff !== 0 && (
              <View style={styles.totalRow}>
                <AppText variant="bodySmall" color="textTertiary">Round Off</AppText>
                <AppText variant="bodySmall" color="textSecondary">
                  {invoice.roundOff > 0 ? '+' : ''}{CURRENCY_SYMBOL}{invoice.roundOff.toFixed(2)}
                </AppText>
              </View>
            )}
            <View style={[styles.totalRow, styles.grandTotal, { borderTopColor: theme.colors.border }]}>
              <AppText variant="h4" color="textPrimary">Total</AppText>
              <AppText variant="priceLarge" color="primary">
                {CURRENCY_SYMBOL}{invoice.totalAmount.toLocaleString('en-IN')}
              </AppText>
            </View>
            <AppText variant="caption" color="textTertiary" style={{ marginTop: 4, fontStyle: 'italic' }}>
              {numberToWords(invoice.totalAmount)}
            </AppText>
          </Surface>

          <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <View style={styles.totalRow}>
              <AppText variant="bodyMedium" color="textSecondary">Amount Paid</AppText>
              <AppText variant="bodyMedium" color="success">
                {CURRENCY_SYMBOL}{invoice.amountPaid.toLocaleString('en-IN')}
              </AppText>
            </View>
            <View style={styles.totalRow}>
              <AppText variant="h5" color="textPrimary">Balance Due</AppText>
              <AppText
                variant="price"
                style={{ color: invoice.balanceAmount > 0 ? theme.colors.error : theme.colors.success }}
              >
                {CURRENCY_SYMBOL}{invoice.balanceAmount.toLocaleString('en-IN')}
              </AppText>
            </View>
          </Surface>

          {payments.length > 0 && (
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
                Payment History
              </AppText>
              {payments.map((p) => (
                <View key={p.id} style={[styles.paymentRow, { borderBottomColor: theme.colors.divider }]}>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodyMedium" color="textPrimary">
                      {CURRENCY_SYMBOL}{p.amount.toLocaleString('en-IN')}
                    </AppText>
                    <AppText variant="caption" color="textTertiary">
                      {formatDate(p.paymentDate)} - {PAYMENT_MODE_LABELS[p.paymentMode]}
                    </AppText>
                  </View>
                  <Badge status={p.status === 'completed' ? 'paid' : 'pending'} />
                </View>
              ))}
            </Surface>
          )}

          {(invoice.notes || invoice.termsAndConditions) && (
            <Surface style={[styles.card, { backgroundColor: theme.colors.surface }]} elevation={1}>
              {invoice.notes && (
                <View style={{ marginBottom: 12 }}>
                  <AppText variant="labelMedium" color="textTertiary">Notes</AppText>
                  <AppText variant="bodyMedium" color="textSecondary" style={{ marginTop: 4 }}>
                    {invoice.notes}
                  </AppText>
                </View>
              )}
              {invoice.termsAndConditions && (
                <View>
                  <AppText variant="labelMedium" color="textTertiary">Terms & Conditions</AppText>
                  <AppText variant="bodySmall" color="textSecondary" style={{ marginTop: 4 }}>
                    {invoice.termsAndConditions}
                  </AppText>
                </View>
              )}
            </Surface>
          )}

          <View style={{ height: 100 }} />
        </View>
      </ScrollView>

      <View style={[styles.bottomBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        {canRecordPayment && (
          <TouchableOpacity
            style={[styles.primaryBtn, { backgroundColor: theme.colors.success }]}
            onPress={handleRecordPayment}
          >
            <Icon name="cash" size={18} color={theme.colors.onSuccess} />
            <AppText variant="labelMedium" color="textInverse">Record Payment</AppText>
          </TouchableOpacity>
        )}
        <View style={styles.secondaryBtnRow}>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate('InvoiceForm', { invoiceId: invoice.id })}
          >
            <Icon name="pencil" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={handleShare}
          >
            <Icon name="share-variant" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.colors.surfaceVariant }]}
            onPress={() => navigation.navigate('InvoicePreview', { invoiceId: invoice.id })}
          >
            <Icon name="file-document-outline" size={18} color={theme.colors.textSecondary} />
          </TouchableOpacity>
          {!isCancelled && !isPaid && (
            <TouchableOpacity
              style={[styles.secondaryBtn, { backgroundColor: theme.colors.warningContainer }]}
              onPress={handleCancel}
            >
              <Icon name="close-circle" size={18} color={theme.colors.warning} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.secondaryBtn, { backgroundColor: theme.colors.errorContainer }]}
            onPress={handleDelete}
          >
            <Icon name="delete" size={18} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <View style={infoStyles.row}>
      <AppText variant="bodySmall" color="textTertiary" style={infoStyles.label}>{label}</AppText>
      <AppText variant="bodyMedium" color="textPrimary" style={infoStyles.value}>{value}</AppText>
    </View>
  );
}

const infoStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingVertical: 6,
  },
  label: { width: 80 },
  value: { flex: 1, textAlign: 'right' },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  padding: { padding: 16 },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  sectionTitle: { marginBottom: 12 },
  tableHeader: {
    flexDirection: 'row',
    paddingBottom: 8,
    borderBottomWidth: 1,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    alignItems: 'center',
  },
  colSno: { width: 28 },
  colDesc: { flex: 1, marginRight: 8 },
  colQty: { width: 36, textAlign: 'center' },
  colRate: { width: 70, textAlign: 'right' },
  colAmt: { width: 80, textAlign: 'right' },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  grandTotal: {
    borderTopWidth: 1,
    paddingTop: 12,
    marginTop: 4,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  bottomBar: {
    padding: 12,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 12,
    gap: 8,
    marginBottom: 10,
  },
  secondaryBtnRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
  },
  secondaryBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
