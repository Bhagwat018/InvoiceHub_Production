import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Share,
  Alert,
  Dimensions,
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
import { CURRENCY_SYMBOL, INVOICE_STATUS_LABELS } from '../../constants';
import type { InvoiceStackParamList } from '../../navigation/types';
import type { Invoice, InvoiceStatus } from '../../types';

type Nav = NativeStackNavigationProp<InvoiceStackParamList>;
type Route = RouteProp<InvoiceStackParamList, 'InvoicePreview'>;

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const PREVIEW_WIDTH = Math.min(SCREEN_WIDTH - 32, 500);

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

export default function InvoicePreviewScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const route = useRoute<Route>();
  const { getInvoice } = useInvoices();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
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

  const handleShare = useCallback(async () => {
    if (!invoice) return;
    const lines = [
      `TAX INVOICE`,
      ``,
      `Invoice: ${invoice.invoiceNumber}`,
      `Date: ${formatDate(invoice.invoiceDate)}`,
      `Due: ${formatDate(invoice.dueDate)}`,
      ``,
      `Bill To: ${invoice.customer.name}`,
      invoice.customer.address ? `Address: ${invoice.customer.address}` : '',
      invoice.customer.gstNumber ? `GSTIN: ${invoice.customer.gstNumber}` : '',
      ``,
      `--- Items ---`,
      ...invoice.items.map(
        (item, i) =>
          `${i + 1}. ${item.name} | Qty: ${item.quantity} | Rate: ${CURRENCY_SYMBOL}${item.rate} | Amt: ${CURRENCY_SYMBOL}${item.total.toLocaleString('en-IN')}`,
      ),
      ``,
      `Subtotal: ${CURRENCY_SYMBOL}${invoice.subtotal.toLocaleString('en-IN')}`,
      `Tax: ${CURRENCY_SYMBOL}${invoice.totalTax.toLocaleString('en-IN')}`,
      `Total: ${CURRENCY_SYMBOL}${invoice.totalAmount.toLocaleString('en-IN')}`,
      `Paid: ${CURRENCY_SYMBOL}${invoice.amountPaid.toLocaleString('en-IN')}`,
      `Balance: ${CURRENCY_SYMBOL}${invoice.balanceAmount.toLocaleString('en-IN')}`,
    ].filter(Boolean);
    await Share.share({ message: lines.join('\n') });
  }, [invoice]);

  const handlePrint = useCallback(() => {
    Alert.alert('Print', 'Print functionality will be available soon.');
  }, []);

  const handleEmail = useCallback(() => {
    Alert.alert('Email', 'Email sending will be available soon.');
  }, []);

  const handleWhatsApp = useCallback(() => {
    Alert.alert('WhatsApp', 'WhatsApp sharing will be available soon.');
  }, []);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background, padding: 16 }]}>
        <SkeletonLoader width="60%" height={24} />
        <SkeletonLoader width="100%" height={600} borderRadius={12} marginTop={16} />
      </View>
    );
  }

  if (!invoice) return null;

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.invoicePaper}>
          <Surface style={[styles.invoiceCard, { backgroundColor: '#FFFFFF' }]} elevation={2}>
            <View style={styles.invoiceHeader}>
              <View style={styles.logoPlaceholder}>
                <Icon name="office-building" size={32} color={theme.colors.primary} />
              </View>
              <View style={styles.invoiceTitleCol}>
                <AppText variant="h2" style={styles.invoiceTitleText}>
                  {invoice.invoiceNumber}
                </AppText>
                <AppText variant="bodySmall" style={styles.invoiceDateText}>
                  {formatDate(invoice.invoiceDate)}
                </AppText>
                <View style={{ marginTop: 4 }}>
                  <Badge status={invoice.status as InvoiceStatus} size="medium" />
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: '#E0E0E0' }]} />

            <View style={styles.addressRow}>
              <View style={styles.addressCol}>
                <AppText variant="overline" style={styles.addressLabel}>From</AppText>
                <AppText variant="bodyMedium" style={styles.addressName}>Your Business</AppText>
                <AppText variant="bodySmall" style={styles.addressText}>Business Address</AppText>
                <AppText variant="bodySmall" style={styles.addressText}>GSTIN: 22AAAAA0000A1Z5</AppText>
              </View>
              <View style={styles.addressCol}>
                <AppText variant="overline" style={styles.addressLabel}>Bill To</AppText>
                <AppText variant="bodyMedium" style={styles.addressName}>{invoice.customer.name}</AppText>
                {invoice.customer.address && (
                  <AppText variant="bodySmall" style={styles.addressText}>{invoice.customer.address}</AppText>
                )}
                {invoice.customer.phone && (
                  <AppText variant="bodySmall" style={styles.addressText}>{invoice.customer.phone}</AppText>
                )}
                {invoice.customer.gstNumber && (
                  <AppText variant="bodySmall" style={styles.addressText}>GSTIN: {invoice.customer.gstNumber}</AppText>
                )}
              </View>
            </View>

            <View style={styles.tableContainer}>
              <View style={[styles.tableHeaderRow, { backgroundColor: '#F5F5F5' }]}>
                <AppText variant="labelSmall" style={[styles.tCol, styles.tColSno]}>#</AppText>
                <AppText variant="labelSmall" style={[styles.tCol, styles.tColDesc]}>Description</AppText>
                <AppText variant="labelSmall" style={[styles.tCol, styles.tColCenter]}>Qty</AppText>
                <AppText variant="labelSmall" style={[styles.tCol, styles.tColRight]}>Rate</AppText>
                <AppText variant="labelSmall" style={[styles.tCol, styles.tColRight]}>Tax</AppText>
                <AppText variant="labelSmall" style={[styles.tCol, styles.tColRight]}>Amount</AppText>
              </View>
              {invoice.items.map((item, idx) => (
                <View key={item.id} style={styles.tableRow}>
                  <AppText variant="bodySmall" style={[styles.tCol, styles.tColSno]}>{idx + 1}</AppText>
                  <View style={[styles.tCol, styles.tColDesc]}>
                    <AppText variant="bodySmall" style={styles.tableText}>{item.name}</AppText>
                    {item.description && (
                      <AppText variant="caption" style={styles.tableSubText}>{item.description}</AppText>
                    )}
                  </View>
                  <AppText variant="bodySmall" style={[styles.tCol, styles.tColCenter]}>{item.quantity}</AppText>
                  <AppText variant="bodySmall" style={[styles.tCol, styles.tColRight]}>
                    {CURRENCY_SYMBOL}{item.rate.toLocaleString('en-IN')}
                  </AppText>
                  <AppText variant="bodySmall" style={[styles.tCol, styles.tColRight]}>
                    {CURRENCY_SYMBOL}{item.taxAmount.toLocaleString('en-IN')}
                  </AppText>
                  <AppText variant="bodySmall" style={[styles.tCol, styles.tColRight, styles.tableBold]}>
                    {CURRENCY_SYMBOL}{item.total.toLocaleString('en-IN')}
                  </AppText>
                </View>
              ))}
            </View>

            <View style={styles.totalsSection}>
              <View style={styles.totalsLeft}>
                <AppText variant="caption" style={styles.totalWords}>
                  {numberToWords(invoice.totalAmount)}
                </AppText>
              </View>
              <View style={styles.totalsRight}>
                <TotalLine label="Subtotal" value={invoice.subtotal} />
                {invoice.discountAmount > 0 && (
                  <TotalLine label="Discount" value={-invoice.discountAmount} color="#E53935" />
                )}
                {invoice.cgstAmount > 0 && (
                  <TotalLine label="CGST" value={invoice.cgstAmount} small />
                )}
                {invoice.sgstAmount > 0 && (
                  <TotalLine label="SGST" value={invoice.sgstAmount} small />
                )}
                {invoice.igstAmount > 0 && (
                  <TotalLine label="IGST" value={invoice.igstAmount} small />
                )}
                {invoice.roundOff !== 0 && (
                  <TotalLine label="Round Off" value={invoice.roundOff} small />
                )}
                <View style={[styles.grandTotalLine, { borderTopColor: '#E0E0E0' }]}>
                  <AppText variant="h4" style={styles.grandTotalLabel}>Total</AppText>
                  <AppText variant="priceLarge" style={styles.grandTotalValue}>
                    {CURRENCY_SYMBOL}{invoice.totalAmount.toLocaleString('en-IN')}
                  </AppText>
                </View>
                <View style={styles.paymentInfoRow}>
                  <AppText variant="bodySmall" style={styles.paymentLabel}>Amount Paid</AppText>
                  <AppText variant="bodySmall" style={{ color: '#43A047' }}>
                    {CURRENCY_SYMBOL}{invoice.amountPaid.toLocaleString('en-IN')}
                  </AppText>
                </View>
                <View style={styles.paymentInfoRow}>
                  <AppText variant="bodyMedium" style={styles.paymentLabel}>Balance Due</AppText>
                  <AppText variant="price" style={{ color: '#E53935' }}>
                    {CURRENCY_SYMBOL}{invoice.balanceAmount.toLocaleString('en-IN')}
                  </AppText>
                </View>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: '#E0E0E0' }]} />

            <View style={styles.qrPlaceholder}>
              <View style={[styles.qrBox, { borderColor: '#E0E0E0' }]}>
                <Icon name="qrcode" size={48} color="#BDBDBD" />
              </View>
              <AppText variant="caption" style={{ color: '#9E9E9E', marginTop: 4 }}>Scan to pay</AppText>
            </View>

            {invoice.termsAndConditions && (
              <View style={styles.termsSection}>
                <AppText variant="overline" style={styles.termsTitle}>Terms & Conditions</AppText>
                <AppText variant="bodySmall" style={styles.termsText}>
                  {invoice.termsAndConditions}
                </AppText>
              </View>
            )}

            {invoice.notes && (
              <View style={styles.notesSection}>
                <AppText variant="overline" style={styles.termsTitle}>Notes</AppText>
                <AppText variant="bodySmall" style={styles.termsText}>
                  {invoice.notes}
                </AppText>
              </View>
            )}

            <View style={styles.signatureSection}>
              <View style={styles.signatureLine} />
              <AppText variant="caption" style={{ color: '#9E9E9E' }}>Authorized Signature</AppText>
            </View>
          </Surface>
        </View>
        <View style={{ height: 100 }} />
      </ScrollView>

      <View style={[styles.actionBar, { backgroundColor: theme.colors.surface, borderTopColor: theme.colors.border }]}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.primaryContainer }]}
          onPress={handleShare}
        >
          <Icon name="share-variant" size={20} color={theme.colors.primary} />
          <AppText variant="labelSmall" color="primary">Share</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={() => {}}
        >
          <Icon name="download" size={20} color={theme.colors.textSecondary} />
          <AppText variant="labelSmall" color="textSecondary">PDF</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handlePrint}
        >
          <Icon name="printer" size={20} color={theme.colors.textSecondary} />
          <AppText variant="labelSmall" color="textSecondary">Print</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.colors.surfaceVariant }]}
          onPress={handleEmail}
        >
          <Icon name="email-outline" size={20} color={theme.colors.textSecondary} />
          <AppText variant="labelSmall" color="textSecondary">Email</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: '#E8F5E9' }]}
          onPress={handleWhatsApp}
        >
          <Icon name="whatsapp" size={20} color="#43A047" />
          <AppText variant="labelSmall" color="success">WhatsApp</AppText>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function TotalLine({
  label,
  value,
  color,
  small,
}: {
  label: string;
  value: number;
  color?: string;
  small?: boolean;
}) {
  return (
    <View style={totalStyles.row}>
      <AppText variant={small ? 'bodySmall' : 'bodyMedium'} style={{ color: color || '#616161' }}>
        {label}
      </AppText>
      <AppText variant={small ? 'bodySmall' : 'bodyMedium'} style={{ color: color || '#303030' }}>
        {value < 0 ? '-' : ''}{CURRENCY_SYMBOL}{Math.abs(value).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
      </AppText>
    </View>
  );
}

const totalStyles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  invoicePaper: { padding: 16, alignItems: 'center' },
  invoiceCard: {
    width: PREVIEW_WIDTH,
    padding: 20,
    borderRadius: 8,
  },
  invoiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  logoPlaceholder: {
    width: 56,
    height: 56,
    borderRadius: 8,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  invoiceTitleCol: { alignItems: 'flex-end' },
  invoiceTitleText: { color: '#1E1E1E', fontWeight: '700' as const },
  invoiceDateText: { color: '#757575', marginTop: 2 },
  divider: { height: 1, marginVertical: 16 },
  addressRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 16,
  },
  addressCol: { flex: 1 },
  addressLabel: { color: '#9E9E9E', marginBottom: 4, fontWeight: '600' as const },
  addressName: { color: '#1E1E1E', fontWeight: '600' as const, marginBottom: 2 },
  addressText: { color: '#616161', lineHeight: 18 },
  tableContainer: { marginBottom: 16 },
  tableHeaderRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    paddingHorizontal: 4,
    borderRadius: 4,
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#EEEEEE',
    alignItems: 'center',
  },
  tCol: { paddingHorizontal: 2 },
  tColSno: { width: 24 },
  tColDesc: { flex: 1 },
  tColCenter: { width: 36, textAlign: 'center' as const },
  tColRight: { width: 64, textAlign: 'right' as const },
  tableText: { color: '#1E1E1E' },
  tableSubText: { color: '#9E9E9E', fontSize: 10 },
  tableBold: { fontWeight: '600' as const },
  totalsSection: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  totalsLeft: { flex: 1, justifyContent: 'flex-end', paddingRight: 16 },
  totalsRight: { width: 200 },
  totalWords: { color: '#757575', fontStyle: 'italic', lineHeight: 18 },
  grandTotalLine: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    paddingTop: 8,
    marginTop: 4,
  },
  grandTotalLabel: { color: '#1E1E1E', fontWeight: '700' as const },
  grandTotalValue: { color: '#1E88E5', fontWeight: '700' as const },
  paymentInfoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 4,
  },
  paymentLabel: { color: '#616161' },
  qrPlaceholder: {
    alignItems: 'center',
    marginVertical: 16,
  },
  qrBox: {
    width: 80,
    height: 80,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  termsSection: { marginTop: 8 },
  notesSection: { marginTop: 8 },
  termsTitle: { color: '#9E9E9E', marginBottom: 4, fontWeight: '600' as const },
  termsText: { color: '#616161', lineHeight: 18 },
  signatureSection: {
    alignItems: 'flex-end',
    marginTop: 24,
    paddingTop: 16,
  },
  signatureLine: {
    width: 120,
    height: 1,
    backgroundColor: '#E0E0E0',
    marginBottom: 4,
  },
  actionBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: 10,
    paddingBottom: 32,
    borderTopWidth: 1,
  },
  actionBtn: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    minWidth: 56,
    gap: 4,
  },
});
