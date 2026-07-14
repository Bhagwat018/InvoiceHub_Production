import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Linking,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCustomers } from '../../hooks/useCustomers';
import { useInvoices } from '../../hooks/useInvoices';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import AppText from '../../components/common/AppText';
import SearchBar from '../../components/common/SearchBar';
import CustomerCard from '../../components/cards/CustomerCard';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import CustomerSkeleton from '../../components/loading/CustomerSkeleton';
import ConfirmModal from '../../components/modals/ConfirmModal';
import SortModal from '../../components/modals/SortModal';
import type { CustomerStackParamList } from '../../navigation/types';
import type { Customer } from '../../types';

type NavigationProp = NativeStackNavigationProp<CustomerStackParamList, 'CustomerList'>;

type FilterType = 'all' | 'favorites' | 'outstanding';
type SortType = 'name' | 'recent' | 'outstanding';

const SORT_OPTIONS = [
  { label: 'Name (A-Z)', value: 'name', icon: 'sort-alphabetical-ascending' },
  { label: 'Recently Added', value: 'recent', icon: 'clock-outline' },
  { label: 'Outstanding Amount', value: 'outstanding', icon: 'cash' },
];

export default function CustomerListScreen() {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();

  const {
    customers,
    isLoading,
    fetchCustomers,
    deleteCustomer,
    searchCustomers,
  } = useCustomers();

  const { invoices } = useInvoices();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortType>('name');
  const [refreshing, setRefreshing] = useState(false);
  const [sortModalVisible, setSortModalVisible] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);

  const customerOutstanding = useMemo(() => {
    const map: Record<string, number> = {};
    for (const inv of invoices) {
      if (inv.status !== 'paid' && inv.status !== 'cancelled' && inv.status !== 'draft') {
        const outstanding = inv.totalAmount - inv.amountPaid;
        map[inv.customerId] = (map[inv.customerId] || 0) + outstanding;
      }
    }
    return map;
  }, [invoices]);

  const filteredCustomers = useMemo(() => {
    let result: Customer[] = [...customers];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          c.phone?.toLowerCase().includes(q) ||
          c.email?.toLowerCase().includes(q)
      );
    }

    switch (activeFilter) {
      case 'favorites':
        result = result.filter((c) => c.isFavourite);
        break;
      case 'outstanding':
        result = result.filter((c) => (customerOutstanding[c.id] || 0) > 0);
        break;
    }

    switch (sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'recent':
        result.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      case 'outstanding':
        result.sort(
          (a, b) =>
            (customerOutstanding[b.id] || 0) - (customerOutstanding[a.id] || 0)
        );
        break;
    }

    return result;
  }, [customers, searchQuery, activeFilter, sortBy, customerOutstanding]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchCustomers();
    setRefreshing(false);
  }, [fetchCustomers]);

  const handleDeletePress = (customer: Customer) => {
    setCustomerToDelete(customer);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (customerToDelete) {
      try {
        await deleteCustomer(customerToDelete.id);
      } catch {}
    }
    setDeleteModalVisible(false);
    setCustomerToDelete(null);
  };

  const handleCall = (phone: string) => {
    if (phone) {
      Linking.openURL(`tel:${phone}`);
    }
  };

  const handleSwipeEdit = (customer: Customer) => {
    navigation.navigate('CustomerForm', { customerId: customer.id });
  };

  const handleSwipeDelete = (customer: Customer) => {
    handleDeletePress(customer);
  };

  const handleSwipeCall = (customer: Customer) => {
    if (customer.phone) {
      handleCall(customer.phone);
    }
  };

  const renderFilterChip = (label: string, value: FilterType) => (
    <TouchableOpacity
      key={value}
      onPress={() => setActiveFilter(value)}
      style={[
        styles.filterChip,
        {
          backgroundColor:
            activeFilter === value
              ? theme.colors.primaryContainer
              : theme.colors.surfaceVariant,
          borderColor:
            activeFilter === value
              ? theme.colors.primary
              : theme.colors.border,
        },
      ]}
    >
      <AppText
        variant="labelMedium"
        color={activeFilter === value ? 'primary' : 'textSecondary'}
      >
        {label}
      </AppText>
      {value === 'outstanding' && (
        <View
          style={[
            styles.filterCount,
            {
              backgroundColor:
                activeFilter === value
                  ? theme.colors.primary
                  : theme.colors.textTertiary,
            },
          ]}
        >
          <AppText variant="labelSmall" color="textInverse" style={styles.filterCountText}>
            {
              customers.filter(
                (c) => (customerOutstanding[c.id] || 0) > 0
              ).length
            }
          </AppText>
        </View>
      )}
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={setSearchQuery}
        placeholder="Search customers..."
      />

      <View style={styles.filterSortRow}>
        <View style={styles.filterChips}>
          {renderFilterChip('All', 'all')}
          {renderFilterChip('Favorites', 'favorites')}
          {renderFilterChip('Outstanding', 'outstanding')}
        </View>

        <TouchableOpacity
          onPress={() => setSortModalVisible(true)}
          style={[styles.sortButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Icon name="sort" size={20} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.resultInfo}>
        <AppText variant="caption" color="textTertiary">
          {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''}
        </AppText>
        {sortBy !== 'name' && (
          <AppText variant="caption" color="textTertiary">
            {' '}
            · Sorted by {SORT_OPTIONS.find((o) => o.value === sortBy)?.label}
          </AppText>
        )}
      </View>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <CustomerSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="magnify-close"
          title="No Results Found"
          subtitle={`No customers match "${searchQuery}". Try a different search term.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      );
    }
    if (activeFilter !== 'all') {
      return (
        <EmptyState
          icon={activeFilter === 'favorites' ? 'heart-outline' : 'cash-remove'}
          title={`No ${activeFilter} Customers`}
          subtitle={
            activeFilter === 'favorites'
              ? 'Mark customers as favorites to see them here'
              : 'No customers have outstanding balances'
          }
          actionLabel="Show All"
          onAction={() => setActiveFilter('all')}
        />
      );
    }
    return (
      <EmptyState
        icon="account-group-outline"
        title="No Customers Yet"
        subtitle="Add your first customer to start creating invoices"
        actionLabel="Add Customer"
        onAction={() => navigation.navigate('CustomerForm', {})}
      />
    );
  };

  const renderCustomerItem = ({ item }: { item: Customer }) => {
    const outstanding = customerOutstanding[item.id] || 0;
    return (
      <View>
        <CustomerCard
          customer={item}
          outstanding={outstanding}
          onPress={() => navigation.navigate('CustomerDetail', { customerId: item.id })}
        />
        <View style={styles.quickActionsRow}>
          <TouchableOpacity
            onPress={() => handleSwipeEdit(item)}
            style={[styles.quickAction, { backgroundColor: theme.colors.primaryContainer }]}
          >
            <Icon name="pencil" size={14} color={theme.colors.primary} />
          </TouchableOpacity>
          {item.phone && (
            <TouchableOpacity
              onPress={() => handleSwipeCall(item)}
              style={[styles.quickAction, { backgroundColor: theme.colors.successContainer }]}
            >
              <Icon name="phone" size={14} color={theme.colors.success} />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={() => handleSwipeDelete(item)}
            style={[styles.quickAction, { backgroundColor: theme.colors.errorContainer }]}
          >
            <Icon name="delete-outline" size={14} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {isLoading ? (
        renderLoadingSkeleton()
      ) : (
        <FlatList
          data={filteredCustomers}
          keyExtractor={(item) => item.id}
          renderItem={renderCustomerItem}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: 100 },
          ]}
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
      )}

      <FloatingActionButton
        icon="account-plus"
        onPress={() => navigation.navigate('CustomerForm', {})}
      />

      <SortModal
        visible={sortModalVisible}
        options={SORT_OPTIONS}
        currentValue={sortBy}
        onSelect={(value) => setSortBy(value as SortType)}
        onClose={() => setSortModalVisible(false)}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Customer"
        message={`Are you sure you want to delete "${customerToDelete?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setCustomerToDelete(null);
        }}
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
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  header: {
    marginBottom: 4,
  },
  filterSortRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  filterChips: {
    flexDirection: 'row',
    flex: 1,
    gap: 8,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  filterCount: {
    marginLeft: 6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  filterCountText: {
    fontSize: 9,
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
    flexDirection: 'row',
    alignItems: 'center',
  },
  quickActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: -8,
    marginBottom: 12,
    paddingRight: 4,
  },
  quickAction: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  skeletonContainer: {
    padding: 16,
  },
});
