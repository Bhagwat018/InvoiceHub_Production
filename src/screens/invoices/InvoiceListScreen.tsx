import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import {ReanimatedSwipeable} from 'react-native-gesture-handler/ReanimatedSwipeable';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useInvoices } from '../../hooks/useInvoices';
import AppText from '../../components/common/AppText';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import InvoiceCard from '../../components/cards/InvoiceCard';
import InvoiceSkeleton from '../../components/loading/InvoiceSkeleton';
import { CURRENCY_SYMBOL, INVOICE_STATUS_LABELS } from '../../constants';
import type { InvoiceStackParamList } from '../../navigation/types';
import type { Invoice, InvoiceStatus } from '../../types';

type Nav = NativeStackNavigationProp<InvoiceStackParamList>;

type FilterKey = 'all' | 'draft' | 'pending' | 'paid' | 'partially_paid' | 'overdue' | 'cancelled';

const STATUS_FILTERS: { key: FilterKey; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'draft', label: 'Draft' },
  { key: 'pending', label: 'Pending' },
  { key: 'paid', label: 'Paid' },
  { key: 'partially_paid', label: 'Partial' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'cancelled', label: 'Cancelled' },
];

type SortKey = 'newest' | 'oldest' | 'amount_high' | 'amount_low';

const SORT_OPTIONS: { key: SortKey; label: string }[] = [
  { key: 'newest', label: 'Newest First' },
  { key: 'oldest', label: 'Oldest First' },
  { key: 'amount_high', label: 'Amount: High to Low' },
  { key: 'amount_low', label: 'Amount: Low to High' },
];

export default function InvoiceListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<Nav>();
  const { invoices, isLoading, deleteInvoice } = useInvoices();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterKey>('all');
  const [activeSort, setActiveSort] = useState<SortKey>('newest');
  const [showSortSheet, setShowSortSheet] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const filteredInvoices = useMemo(() => {
    let result = [...invoices];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.invoiceNumber.toLowerCase().includes(q) ||
          inv.customer.name.toLowerCase().includes(q),
      );
    }

    if (activeFilter !== 'all') {
      result = result.filter((inv) => inv.status === activeFilter);
    }

    switch (activeSort) {
      case 'oldest':
        result.sort((a, b) => new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime());
        break;
      case 'amount_high':
        result.sort((a, b) => b.totalAmount - a.totalAmount);
        break;
      case 'amount_low':
        result.sort((a, b) => a.totalAmount - b.totalAmount);
        break;
      case 'newest':
      default:
        result.sort((a, b) => new Date(b.invoiceDate).getTime() - new Date(a.invoiceDate).getTime());
        break;
    }

    return result;
  }, [invoices, searchQuery, activeFilter, activeSort]);

  const summary = useMemo(() => {
    const total = filteredInvoices.length;
    const totalAmount = filteredInvoices.reduce((s, i) => s + i.totalAmount, 0);
    const outstanding = filteredInvoices.reduce((s, i) => s + i.balanceAmount, 0);
    return { total, totalAmount, outstanding };
  }, [filteredInvoices]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleDelete = useCallback(
    (invoice: Invoice) => {
      Alert.alert('Delete Invoice', `Delete ${invoice.invoiceNumber}?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteInvoice(invoice.id);
            } catch {}
          },
        },
      ]);
    },
    [deleteInvoice],
  );

  const renderRightActions = useCallback(
    (invoice: Invoice) => (
      <View style={styles.swipeActions}>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: theme.colors.primary }]}
          onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: invoice.id })}
        >
          <Icon name="eye" size={20} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: theme.colors.info }]}
          onPress={() => {}}
        >
          <Icon name="share-variant" size={20} color={theme.colors.onInfo} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.swipeAction, { backgroundColor: theme.colors.error }]}
          onPress={() => handleDelete(invoice)}
        >
          <Icon name="delete" size={20} color={theme.colors.onError} />
        </TouchableOpacity>
      </View>
    ),
    [navigation, handleDelete, theme],
  );

  const renderInvoice = useCallback(
    ({ item }: { item: Invoice }) => (
      <ReanimatedSwipeable renderRightActions={() => renderRightActions(item)} overshootRight={false}>
        <InvoiceCard
          invoice={item}
          onPress={() => navigation.navigate('InvoiceDetail', { invoiceId: item.id })}
        />
      </ReanimatedSwipeable>
    ),
    [navigation, renderRightActions],
  );

  const renderSummaryBar = () => (
    <Surface style={[styles.summaryBar, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.summaryItem}>
        <AppText variant="caption" color="textTertiary">
          Invoices
        </AppText>
        <AppText variant="h4" color="textPrimary">
          {summary.total}
        </AppText>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <AppText variant="caption" color="textTertiary">
          Total
        </AppText>
        <AppText variant="price" color="primary">
          {CURRENCY_SYMBOL}{summary.totalAmount.toLocaleString('en-IN')}
        </AppText>
      </View>
      <View style={styles.summaryDivider} />
      <View style={styles.summaryItem}>
        <AppText variant="caption" color="textTertiary">
          Outstanding
        </AppText>
        <AppText variant="price" color="error">
          {CURRENCY_SYMBOL}{summary.outstanding.toLocaleString('en-IN')}
        </AppText>
      </View>
    </Surface>
  );

  const renderHeader = () => (
    <View>
      <SearchBar
        placeholder="Search invoices..."
        onSearch={setSearchQuery}
        value={searchQuery}
      />

      <FlatList
        horizontal
        data={STATUS_FILTERS}
        keyExtractor={(item) => item.key}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.filterRow}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => setActiveFilter(item.key)}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.filterChip,
                {
                  backgroundColor:
                    activeFilter === item.key
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  borderColor:
                    activeFilter === item.key ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <AppText
                variant="labelMedium"
                color={activeFilter === item.key ? 'primary' : 'textSecondary'}
              >
                {item.label}
              </AppText>
            </View>
          </TouchableOpacity>
        )}
      />

      {renderSummaryBar()}

      <View style={styles.sortRow}>
        <AppText variant="labelMedium" color="textSecondary">
          {filteredInvoices.length} invoices
        </AppText>
        <TouchableOpacity
          onPress={() => setShowSortSheet(!showSortSheet)}
          activeOpacity={0.7}
          style={styles.sortBtn}
        >
          <Icon name="sort" size={18} color={theme.colors.textSecondary} />
          <AppText variant="labelMedium" color="textSecondary" style={{ marginHorizontal: 4 }}>
            {SORT_OPTIONS.find((s) => s.key === activeSort)?.label}
          </AppText>
          <Icon name="chevron-down" size={16} color={theme.colors.textTertiary} />
        </TouchableOpacity>
      </View>

      {showSortSheet && (
        <Surface style={[styles.sortSheet, { backgroundColor: theme.colors.surface }]} elevation={2}>
          {SORT_OPTIONS.map((opt) => (
            <TouchableOpacity
              key={opt.key}
              onPress={() => {
                setActiveSort(opt.key);
                setShowSortSheet(false);
              }}
              style={[
                styles.sortOption,
                {
                  backgroundColor:
                    activeSort === opt.key ? theme.colors.primaryContainer : 'transparent',
                },
              ]}
            >
              <AppText
                variant="bodyMedium"
                color={activeSort === opt.key ? 'primary' : 'textPrimary'}
              >
                {opt.label}
              </AppText>
              {activeSort === opt.key && (
                <Icon name="check" size={18} color={theme.colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </Surface>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (isLoading) {
      return (
        <View>
          {[1, 2, 3, 4].map((i) => (
            <InvoiceSkeleton key={i} />
          ))}
        </View>
      );
    }
    return (
      <EmptyState
        icon="file-document-outline"
        title="No Invoices Found"
        subtitle={
          searchQuery
            ? `No invoices matching "${searchQuery}"`
            : 'Create your first invoice to get started'
        }
        actionLabel={!searchQuery ? 'Create Invoice' : undefined}
        onAction={!searchQuery ? () => navigation.navigate('InvoiceForm', {}) : undefined}
      />
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={filteredInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoice}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
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
        icon="plus"
        onPress={() => navigation.navigate('InvoiceForm', {})}
        animated
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 100 },
  filterRow: { paddingVertical: 12, gap: 8 },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  summaryBar: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  summaryItem: { flex: 1, alignItems: 'center' },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#E0E0E0',
  },
  sortRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  sortBtn: { flexDirection: 'row', alignItems: 'center' },
  sortSheet: { borderRadius: 12, padding: 4, marginBottom: 8 },
  sortOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  swipeActions: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  swipeAction: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
});
