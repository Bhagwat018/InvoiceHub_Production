import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Linking,
  Alert,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCustomers } from '../../hooks/useCustomers';
import { useInvoices } from '../../hooks/useInvoices';
import { usePayments } from '../../hooks/usePayments';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import AppText from '../../components/common/AppText';
import Avatar from '../../components/common/Avatar';
import Badge from '../../components/common/Badge';
import Divider from '../../components/common/Divider';
import InvoiceCard from '../../components/cards/InvoiceCard';
import StatCard from '../../components/cards/StatCard';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../components/modals/ConfirmModal';
import LoadingState from '../../components/common/LoadingState';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL } from '../../constants';
import type { CustomerStackParamList } from '../../navigation/types';
import type { Customer, Invoice, Payment, InvoiceStatus } from '../../types';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'CustomerDetail'>;

type TabType = 'overview' | 'invoices' | 'payments' | 'ledger';

const TABS: { label: string; value: TabType }[] = [
  { label: 'Overview', value: 'overview' },
  { label: 'Invoices', value: 'invoices' },
  { label: 'Payments', value: 'payments' },
  { label: 'Ledger', value: 'ledger' },
];

function DetailSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <SkeletonLoader width={64} height={64} borderRadius={32} />
        <View style={styles.skeletonHeaderText}>
          <SkeletonLoader width={140} height={20} />
          <SkeletonLoader width={100} height={14} marginTop={6} />
          <SkeletonLoader width={120} height={14} marginTop={4} />
        </View>
      </View>
      <View style={styles.skeletonTabs}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonLoader key={i} width={70} height={32} borderRadius={16} />
        ))}
      </View>
      <View style={styles.skeletonStatsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Surface key={i} style={[styles.skeletonStat, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={36} height={36} borderRadius={10} />
            <SkeletonLoader width={60} height={16} marginTop={8} />
            <SkeletonLoader width={40} height={10} marginTop={4} />
          </Surface>
        ))}
      </View>
    </View>
  );
}

export default function CustomerDetailScreen() {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const route = useRoute();
  const navigation = useNavigation<NavigationProp>();
  const { customerId } = route.params as { customerId: string };

  const { getCustomer, deleteCustomer } = useCustomers();
  const { getByCustomer } = useInvoices();
  const { getByCustomer: getPaymentsByCustomer } = usePayments();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [customerInvoices, setCustomerInvoices] = useState<Invoice[]>([]);
  const [customerPayments, setCustomerPayments] = useState<Payment[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [cust, invs, pays] = await Promise.all([
        getCustomer(customerId),
        getByCustomer(customerId),
        getPaymentsByCustomer(customerId),
      ]);
      setCustomer(cust);
      setCustomerInvoices(invs);
      setCustomerPayments(pays);
    } catch {}
    setIsLoading(false);
  }, [customerId, getCustomer, getByCustomer, getPaymentsByCustomer]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleDelete = async () => {
    try {
      await deleteCustomer(customerId);
      navigation.goBack();
    } catch {}
    setDeleteModalVisible(false);
  };

  const handleCall = () => {
    if (customer?.phone) {
      Linking.openURL(`tel:${customer.phone}`);
    }
  };

  const handleWhatsApp = () => {
    if (customer?.phone) {
      const phone = customer.phone.replace(/[^0-9]/g, '');
      const url = `whatsapp://send?phone=${phone}`;
      Linking.canOpenURL(url).then((supported) => {
        if (supported) {
          Linking.openURL(url);
        } else {
          Alert.alert('WhatsApp', 'WhatsApp is not installed on this device');
        }
      });
    }
  };

  const formatCurrency = (amount: number) =>
    `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const totalInvoiced = customerInvoices
    .filter((inv) => inv.status !== 'cancelled' && inv.status !== 'draft')
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const totalPaid = customerPayments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + p.amount, 0);

  const outstanding = totalInvoiced - totalPaid;
  const lastInvoice = customerInvoices[0];

  const renderActionButtons = () => (
    <View style={styles.actionRow}>
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.colors.primaryContainer }]}
        onPress={() => navigation.navigate('CustomerForm', { customerId })}
      >
        <Icon name="pencil" size={18} color={theme.colors.primary} />
      </TouchableOpacity>
      {customer?.phone && (
        <>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: theme.colors.successContainer }]}
            onPress={handleCall}
          >
            <Icon name="phone" size={18} color={theme.colors.success} />
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: '#DCF8C6' }]}
            onPress={handleWhatsApp}
          >
            <Icon name="whatsapp" size={18} color="#25D366" />
          </TouchableOpacity>
        </>
      )}
      <TouchableOpacity
        style={[styles.actionBtn, { backgroundColor: theme.colors.errorContainer }]}
        onPress={() => setDeleteModalVisible(true)}
      >
        <Icon name="delete-outline" size={18} color={theme.colors.error} />
      </TouchableOpacity>
    </View>
  );

  const renderOverview = () => (
    <View style={styles.tabContent}>
      <View style={styles.statsGrid}>
        <View style={styles.statWrapper}>
          <StatCard
            icon="file-document-outline"
            value={customerInvoices.length}
            label="Total Invoices"
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.statWrapper}>
          <StatCard
            icon="cash-multiple"
            value={formatCurrency(totalInvoiced)}
            label="Total Amount"
            color={theme.colors.secondary}
          />
        </View>
        <View style={styles.statWrapper}>
          <StatCard
            icon="clock-outline"
            value={formatCurrency(outstanding)}
            label="Outstanding"
            color={outstanding > 0 ? theme.colors.error : theme.colors.success}
          />
        </View>
        <View style={styles.statWrapper}>
          <StatCard
            icon="calendar-check"
            value={lastInvoice ? formatDate(lastInvoice.invoiceDate) : 'N/A'}
            label="Last Invoice"
            color={theme.colors.accent}
          />
        </View>
      </View>

      <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
          Contact Details
        </AppText>
        {customer?.phone && (
          <View style={styles.infoRow}>
            <Icon name="phone" size={18} color={theme.colors.textTertiary} />
            <AppText variant="bodyMedium" color="textPrimary" style={styles.infoText}>
              {customer.phone}
            </AppText>
          </View>
        )}
        {customer?.email && (
          <View style={styles.infoRow}>
            <Icon name="email-outline" size={18} color={theme.colors.textTertiary} />
            <AppText variant="bodyMedium" color="textPrimary" style={styles.infoText}>
              {customer.email}
            </AppText>
          </View>
        )}
        {customer?.address && (
          <View style={styles.infoRow}>
            <Icon name="map-marker-outline" size={18} color={theme.colors.textTertiary} />
            <AppText variant="bodyMedium" color="textPrimary" style={styles.infoText} numberOfLines={2}>
              {customer.address}
              {customer.city ? `, ${customer.city}` : ''}
              {customer.state ? `, ${customer.state}` : ''}
              {customer.pincode ? ` - ${customer.pincode}` : ''}
            </AppText>
          </View>
        )}
      </Surface>

      {(customer?.gstNumber || customer?.panNumber) && (
        <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
            Business Details
          </AppText>
          {customer.gstNumber && (
            <View style={styles.infoRow}>
              <Icon name="alpha-g-circle" size={18} color={theme.colors.textTertiary} />
              <AppText variant="bodyMedium" color="textPrimary" style={styles.infoText}>
                GST: {customer.gstNumber}
              </AppText>
            </View>
          )}
          {customer.panNumber && (
            <View style={styles.infoRow}>
              <Icon name="alpha-p-circle" size={18} color={theme.colors.textTertiary} />
              <AppText variant="bodyMedium" color="textPrimary" style={styles.infoText}>
                PAN: {customer.panNumber}
              </AppText>
            </View>
          )}
        </Surface>
      )}

      {customer?.notes && (
        <Surface style={[styles.infoCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.cardTitle}>
            Notes
          </AppText>
          <AppText variant="bodyMedium" color="textSecondary">
            {customer.notes}
          </AppText>
        </Surface>
      )}
    </View>
  );

  const renderInvoices = () => (
    <View style={styles.tabContent}>
      {customerInvoices.length === 0 ? (
        <EmptyState
          icon="file-document-outline"
          title="No Invoices"
          subtitle="No invoices have been created for this customer yet"
          actionLabel="Create Invoice"
          onAction={() =>
            navigation.navigate('CustomerForm' as any, { customerId } as any)
          }
        />
      ) : (
        customerInvoices.map((invoice) => (
          <InvoiceCard
            key={invoice.id}
            invoice={invoice}
            onPress={() =>
              (navigation as any).navigate('InvoiceDetail', {
                invoiceId: invoice.id,
              })
            }
          />
        ))
      )}
    </View>
  );

  const renderPayments = () => (
    <View style={styles.tabContent}>
      {customerPayments.length === 0 ? (
        <EmptyState
          icon="cash"
          title="No Payments"
          subtitle="No payments have been recorded for this customer yet"
          actionLabel="Record Payment"
          onAction={() => {}}
        />
      ) : (
        customerPayments.map((payment) => (
          <Surface
            key={payment.id}
            style={[styles.paymentCard, { backgroundColor: theme.colors.surface }]}
            elevation={1}
          >
            <View style={styles.paymentHeader}>
              <View style={styles.paymentLeft}>
                <AppText variant="bodyMedium" color="textPrimary">
                  {payment.paymentNumber}
                </AppText>
                <AppText variant="caption" color="textTertiary">
                  {formatDate(payment.paymentDate)}
                </AppText>
              </View>
              <AppText variant="price" color="success">
                {formatCurrency(payment.amount)}
              </AppText>
            </View>
            <View style={styles.paymentDetails}>
              <Badge status={payment.status as any} />
              <AppText variant="caption" color="textTertiary">
                {payment.paymentMode?.replace('_', ' ').toUpperCase()}
              </AppText>
            </View>
          </Surface>
        ))
      )}
    </View>
  );

  const renderLedger = () => (
    <View style={styles.tabContent}>
      <EmptyState
        icon="book-open-variant"
        title="Ledger"
        subtitle="Ledger entries for this customer will appear here"
      />
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return renderOverview();
      case 'invoices':
        return renderInvoices();
      case 'payments':
        return renderPayments();
      case 'ledger':
        return renderLedger();
      default:
        return renderOverview();
    }
  };

  if (isLoading && !customer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <DetailSkeleton />
      </View>
    );
  }

  if (!customer) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <EmptyState
          icon="account-off"
          title="Customer Not Found"
          subtitle="This customer may have been deleted"
          actionLabel="Go Back"
          onAction={() => navigation.goBack()}
        />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      >
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backBtn}
          >
            <Icon name="arrow-left" size={24} color={theme.colors.textPrimary} />
          </TouchableOpacity>

          <View style={styles.customerHeader}>
            <Avatar name={customer.name} image={null} size="large" />
            <AppText variant="h4" color="textPrimary" style={styles.customerName}>
              {customer.name}
            </AppText>
            {customer.phone && (
              <AppText variant="bodyMedium" color="textSecondary">
                {customer.phone}
              </AppText>
            )}
            {customer.email && (
              <AppText variant="bodySmall" color="textTertiary">
                {customer.email}
              </AppText>
            )}
            {customer.isFavourite && (
              <View style={styles.favBadge}>
                <Icon name="heart" size={14} color={theme.colors.error} />
                <AppText variant="labelSmall" color="error" style={{ marginLeft: 4 }}>
                  Favorite
                </AppText>
              </View>
            )}
          </View>

          {renderActionButtons()}

          <View style={styles.tabBar}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab.value}
                onPress={() => setActiveTab(tab.value)}
                style={[
                  styles.tab,
                  activeTab === tab.value && {
                    borderBottomColor: theme.colors.primary,
                  },
                ]}
              >
                <AppText
                  variant="labelMedium"
                  color={activeTab === tab.value ? 'primary' : 'textTertiary'}
                >
                  {tab.label}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {renderTabContent()}

        <View style={{ height: 32 }} />
      </ScrollView>

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customer.name}"? This will also remove all associated invoices and payments.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDelete}
        onCancel={() => setDeleteModalVisible(false)}
        destructive
        icon="account-remove-outline"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 32,
  },
  header: {
    paddingHorizontal: 16,
  },
  backBtn: {
    marginTop: 48,
    marginBottom: 8,
    padding: 4,
  },
  customerHeader: {
    alignItems: 'center',
    marginBottom: 16,
  },
  customerName: {
    marginTop: 12,
    marginBottom: 4,
  },
  favBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 12,
    marginBottom: 20,
  },
  actionBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabBar: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabContent: {
    padding: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statWrapper: {
    width: '47.5%',
  },
  infoCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  infoText: {
    marginLeft: 10,
    flex: 1,
  },
  paymentCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  paymentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  paymentLeft: {
    flex: 1,
  },
  paymentDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 48,
  },
  skeletonHeaderText: {
    marginLeft: 16,
    gap: 4,
  },
  skeletonTabs: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 20,
  },
  skeletonStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  skeletonStat: {
    width: '47.5%',
    padding: 16,
    borderRadius: 16,
  },
});
