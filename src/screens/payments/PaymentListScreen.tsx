import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePayments } from '../../hooks/usePayments';
import { useCustomers } from '../../hooks/useCustomers';
import { useInvoices } from '../../hooks/useInvoices';
import AppText from '../../components/common/AppText';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import StatCard from '../../components/cards/StatCard';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import SortModal from '../../components/modals/SortModal';
import FilterModal from '../../components/modals/FilterModal';
import { CURRENCY_SYMBOL, PAYMENT_MODES, PAYMENT_MODE_LABELS } from '../../constants';
import type { MoreStackParamList } from '../../navigation/types';
import type { Payment } from '../../types';

type NavigationProp = NativeStackNavigationProp<MoreStackParamList, 'Payments'>;

type SortType = 'newest' | 'oldest' | 'amount_high' | 'amount_low';

const SORT_OPTIONS = [
  { label: 'Newest First', value: 'newest', icon: 'clock-outline' },
  { label: 'Oldest First', value: 'oldest', icon: 'clock-fast' },
  { label: 'Amount (High to Low)', value: 'amount_high', icon: 'sort-numeric-descending' },
  { label: 'Amount (Low to High)', value: 'amount_low', icon: 'sort-numeric-ascending' },
];

const PAYMENT_ICONS: Record<string, string> = {
  cash: 'cash',
  upi: 'cellphone',
  bank_transfer: 'bank',
  cheque: 'checkbook',
  card: 'credit-card',
  net_banking: 'laptop',
  demand_draft: 'file-document',
  credit: 'clock-outline',
  other: 'help-circle',
};

function PaymentSkeleton() {
  const theme = useTheme();
  return (
    <Surface style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.skeletonContent}>
        <SkeletonLoader width={40} height={40} borderRadius={10} />
        <View style={styles.skeletonInfo}>
          <SkeletonLoader width={120} height={16} />
          <SkeletonLoader width={80} height={12} marginTop={6} />
        </View>
        <SkeletonLoader width={70} height={18} />
      </View>
    </Surface>
  );
}

export default function PaymentListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { payments, isLoading, fetchPayments } = usePayments();
  const { customers } = useCustomers();
  const { invoices } = useInvoices();

  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortType>('newest');
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string | string[]>>({});
  const [refreshing, setRefreshing] = useState(false);

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c) => {
      map[c.id] = c.name;
    });
    return map;
  }, [customers]);

  const invoiceMap = useMemo(() => {
    const map: Record<string, string> = {};
    invoices.forEach((inv) => {
      map[inv.id] = inv.invoiceNumber;
    });
    return map;
  }, [invoices]);

  const summary = useMemo(() => {
    const total = payments.reduce((sum, p) => sum + p.amount, 0);
    const modeBreakdown: Record<string, number> = {};
    payments.forEach((p) => {
      modeBreakdown[p.paymentMode] = (modeBreakdown[p.paymentMode] || 0) + p.amount;
    });
    return { total, modeBreakdown };
  }, [payments]);

  const filteredPayments = useMemo(() => {
    let result = [...payments];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter((p) => {
        const customerName = customerMap[p.customer?.id] || '';
        const invoiceNumber = invoiceMap[p.invoice?.id] || '';
        return (
          customerName.toLowerCase().includes(q) ||
          invoiceNumber.toLowerCase().includes(q) ||
          p.paymentNumber.toLowerCase().includes(q) ||
          p.referenceNumber?.toLowerCase().includes(q)
        );
      });
    }

    const modeFilter = activeFilters['mode'];
    if (modeFilter && Array.isArray(modeFilter) && modeFilter.length > 0) {
      result = result.filter((p) => modeFilter.includes(p.paymentMode));
    }

    switch (sortBy) {
      case 'newest':
        result.sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime());
        break;
      case 'oldest':
        result.sort((a, b) => new Date(a.paymentDate).getTime() - new Date(b.paymentDate).getTime());
        break;
      case 'amount_high':
        result.sort((a, b) => b.amount - a.amount);
        break;
      case 'amount_low':
        result.sort((a, b) => a.amount - b.amount);
        break;
    }

    return result;
  }, [payments, searchQuery, sortBy, activeFilters, customerMap, invoiceMap]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchPayments();
    setRefreshing(false);
  }, [fetchPayments]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderPaymentItem = ({ item }: { item: Payment }) => {
    const customerName = customerMap[item.customer?.id] || 'Unknown';
    const invoiceNumber = invoiceMap[item.invoice?.id] || '';

    return (
      <TouchableOpacity
        onPress={() => navigation.navigate('PaymentCreate', { invoiceId: item.invoice?.id })}
        activeOpacity={0.7}
      >
        <Surface style={[styles.paymentCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.iconContainer, { backgroundColor: theme.colors.successContainer }]}>
            <Icon
              name={PAYMENT_ICONS[item.paymentMode] || 'cash'}
              size={20}
              color={theme.colors.success}
            />
          </View>
          <View style={styles.cardInfo}>
            <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
              {customerName}
            </AppText>
            <AppText variant="caption" color="textTertiary">
              {PAYMENT_MODE_LABELS[item.paymentMode as keyof typeof PAYMENT_MODE_LABELS] || item.paymentMode}
              {' · '}
              {formatDate(item.paymentDate)}
              {invoiceNumber ? ` · ${invoiceNumber}` : ''}
            </AppText>
            {item.referenceNumber && (
              <AppText variant="caption" color="textTertiary">
                Ref: {item.referenceNumber}
              </AppText>
            )}
          </View>
          <AppText variant="price" color="success">
            +{CURRENCY_SYMBOL}{item.amount.toLocaleString('en-IN')}
          </AppText>
        </Surface>
      </TouchableOpacity>
    );
  };

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.summaryRow}>
        <StatCard
          icon="cash-check"
          value={`${CURRENCY_SYMBOL}${summary.total.toLocaleString('en-IN')}`}
          label="Total Received"
          color={theme.colors.success}
        />
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={setSearchQuery}
        placeholder="Search payments..."
      />

      <View style={styles.filterSortRow}>
        <TouchableOpacity
          onPress={() => setFilterModalVisible(true)}
          style={[styles.filterButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Icon name="filter-variant" size={20} color={theme.colors.textSecondary} />
          <AppText variant="labelMedium" color="textSecondary" style={styles.filterButtonText}>
            Filter
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setSortModalVisible(true)}
          style={[styles.sortButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Icon name="sort" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.resultInfo}>
        <AppText variant="caption" color="textTertiary">
          {filteredPayments.length} payment{filteredPayments.length !== 1 ? 's' : ''}
        </AppText>
      </View>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {renderHeader()}
      {[1, 2, 3, 4, 5].map((i) => (
        <PaymentSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="magnify-close"
          title="No Results Found"
          subtitle={`No payments match "${searchQuery}". Try a different search term.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      );
    }
    return (
      <EmptyState
        icon="cash-check"
        title="No Payments Yet"
        subtitle="Record your first payment to start tracking"
        actionLabel="Record Payment"
        onAction={() => navigation.navigate('Payments')}
      />
    );
  };

  const filterSections = [
    {
      title: 'Payment Mode',
      key: 'mode',
      options: PAYMENT_MODES.map((mode) => ({
        label: PAYMENT_MODE_LABELS[mode],
        value: mode,
      })),
      multi: true,
    },
  ];

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        {renderLoadingSkeleton()}
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredPayments}
        keyExtractor={(item) => item.id}
        renderItem={renderPaymentItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={[styles.listContent, { paddingBottom: 100 }]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />

      <FloatingActionButton
        icon="cash-plus"
        onPress={() => navigation.navigate('Payments')}
      />

      <SortModal
        visible={sortModalVisible}
        options={SORT_OPTIONS}
        currentValue={sortBy}
        onSelect={(value) => setSortBy(value as SortType)}
        onClose={() => setSortModalVisible(false)}
      />

      <FilterModal
        visible={filterModalVisible}
        sections={filterSections}
        activeFilters={activeFilters}
        onApply={setActiveFilters}
        onClear={() => setActiveFilters({})}
        onClose={() => setFilterModalVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 4,
  },
  summaryRow: {
    marginBottom: 12,
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  filterButtonText: {
    marginLeft: 6,
  },
  sortButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  resultInfo: {
    marginTop: 8,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 12,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  skeletonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
