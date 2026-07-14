import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useExpenses } from '../../hooks/useExpenses';
import AppText from '../../components/common/AppText';
import SearchBar from '../../components/common/SearchBar';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import StatCard from '../../components/cards/StatCard';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import ConfirmModal from '../../components/modals/ConfirmModal';
import { CURRENCY_SYMBOL, EXPENSE_TYPE_LABELS, PAYMENT_MODE_LABELS } from '../../constants';
import type { MoreStackParamList } from '../../navigation/types';
import type { Expense } from '../../types';

type NavigationProp = NativeStackNavigationProp<MoreStackParamList, 'Expenses'>;

const EXPENSE_ICONS: Record<string, string> = {
  office_rent: 'office-building',
  utilities: 'flash',
  salaries: 'account-group',
  office_supplies: 'printer',
  travel: 'car',
  marketing: 'bullhorn',
  professional_services: 'briefcase',
  equipment: 'tools',
  software: 'laptop',
  maintenance: 'wrench',
  insurance: 'shield-check',
  taxes: 'calculator',
  miscellaneous: 'dots-horizontal',
  other: 'help-circle',
};

function ExpenseSkeleton() {
  const theme = useTheme();
  return (
    <Surface style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View style={styles.skeletonContent}>
        <SkeletonLoader width={40} height={40} borderRadius={10} />
        <View style={styles.skeletonInfo}>
          <SkeletonLoader width={140} height={16} />
          <SkeletonLoader width={90} height={12} marginTop={6} />
        </View>
        <SkeletonLoader width={70} height={18} />
      </View>
    </Surface>
  );
}

export default function ExpenseListScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { expenses, isLoading, fetchExpenses, deleteExpense } = useExpenses();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [expenseToDelete, setExpenseToDelete] = useState<Expense | null>(null);

  const expenseTypeKeys = Object.keys(EXPENSE_TYPE_LABELS) as Array<keyof typeof EXPENSE_TYPE_LABELS>;

  const monthlySummary = useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const monthly = expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
    });
    return {
      total: monthly.reduce((sum, e) => sum + e.amount, 0),
      count: monthly.length,
    };
  }, [expenses]);

  const filteredExpenses = useMemo(() => {
    let result = [...expenses];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (e) =>
          e.description.toLowerCase().includes(q) ||
          e.vendorName?.toLowerCase().includes(q) ||
          e.invoiceNumber?.toLowerCase().includes(q) ||
          e.expenseNumber.toLowerCase().includes(q)
      );
    }

    if (selectedCategory) {
      result = result.filter((e) => {
        const expenseType = e.description ? (e as any).expenseType : null;
        return expenseType === selectedCategory;
      });
    }

    result.sort((a, b) => new Date(b.expenseDate).getTime() - new Date(a.expenseDate).getTime());
    return result;
  }, [expenses, searchQuery, selectedCategory]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchExpenses();
    setRefreshing(false);
  }, [fetchExpenses]);

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleDeletePress = (expense: Expense) => {
    setExpenseToDelete(expense);
    setDeleteModalVisible(true);
  };

  const handleDeleteConfirm = async () => {
    if (expenseToDelete) {
      try {
        await deleteExpense(expenseToDelete.id);
      } catch {}
    }
    setDeleteModalVisible(false);
    setExpenseToDelete(null);
  };

  const renderExpenseItem = ({ item }: { item: Expense }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
      activeOpacity={0.7}
    >
      <Surface style={[styles.expenseCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={[styles.iconContainer, { backgroundColor: theme.colors.warningContainer }]}>
          <Icon
            name={EXPENSE_ICONS[(item as any).expenseType] || 'cash'}
            size={20}
            color={theme.colors.warning}
          />
        </View>
        <View style={styles.cardInfo}>
          <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
            {item.description}
          </AppText>
          <AppText variant="caption" color="textTertiary">
            {(item as any).expenseType
              ? EXPENSE_TYPE_LABELS[(item as any).expenseType as keyof typeof EXPENSE_TYPE_LABELS] || (item as any).expenseType
              : 'Expense'}{' '}
            · {formatDate(item.expenseDate)}
          </AppText>
          {item.vendorName && (
            <AppText variant="caption" color="textTertiary">
              {item.vendorName}
            </AppText>
          )}
        </View>
        <View style={styles.cardRight}>
          <AppText variant="price" color="textPrimary">
            {CURRENCY_SYMBOL}{item.amount.toLocaleString('en-IN')}
          </AppText>
          <TouchableOpacity
            onPress={() => handleDeletePress(item)}
            style={styles.deleteButton}
          >
            <Icon name="delete-outline" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </Surface>
    </TouchableOpacity>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.summaryRow}>
        <StatCard
          icon="receipt"
          value={`${CURRENCY_SYMBOL}${monthlySummary.total.toLocaleString('en-IN')}`}
          label={`This Month (${monthlySummary.count} expenses)`}
          color={theme.colors.warning}
        />
      </View>

      <SearchBar
        value={searchQuery}
        onChangeText={setSearchQuery}
        onSearch={setSearchQuery}
        placeholder="Search expenses..."
      />

      <View style={styles.categoryChips}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <TouchableOpacity
            onPress={() => setSelectedCategory(null)}
            style={[
              styles.categoryChip,
              {
                backgroundColor: !selectedCategory
                  ? theme.colors.primaryContainer
                  : theme.colors.surfaceVariant,
                borderColor: !selectedCategory ? theme.colors.primary : theme.colors.border,
              },
            ]}
          >
            <AppText
              variant="labelMedium"
              color={!selectedCategory ? 'primary' : 'textSecondary'}
            >
              All
            </AppText>
          </TouchableOpacity>
          {expenseTypeKeys.map((key) => (
            <TouchableOpacity
              key={key}
              onPress={() => setSelectedCategory(selectedCategory === key ? null : key)}
              style={[
                styles.categoryChip,
                {
                  backgroundColor: selectedCategory === key
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                  borderColor: selectedCategory === key ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <Icon
                name={EXPENSE_ICONS[key] || 'dots-horizontal'}
                size={14}
                color={selectedCategory === key ? theme.colors.primary : theme.colors.textTertiary}
                style={styles.categoryChipIcon}
              />
              <AppText
                variant="labelMedium"
                color={selectedCategory === key ? 'primary' : 'textSecondary'}
              >
                {EXPENSE_TYPE_LABELS[key]}
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.resultInfo}>
        <AppText variant="caption" color="textTertiary">
          {filteredExpenses.length} expense{filteredExpenses.length !== 1 ? 's' : ''}
        </AppText>
      </View>
    </View>
  );

  const renderLoadingSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {renderHeader()}
      {[1, 2, 3, 4, 5].map((i) => (
        <ExpenseSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmpty = () => {
    if (searchQuery.trim()) {
      return (
        <EmptyState
          icon="magnify-close"
          title="No Results Found"
          subtitle={`No expenses match "${searchQuery}". Try a different search term.`}
          actionLabel="Clear Search"
          onAction={() => setSearchQuery('')}
        />
      );
    }
    return (
      <EmptyState
        icon="receipt"
        title="No Expenses Yet"
        subtitle="Track your business expenses by adding your first expense"
        actionLabel="Add Expense"
        onAction={() => navigation.navigate('Expenses')}
      />
    );
  };

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
        data={filteredExpenses}
        keyExtractor={(item) => item.id}
        renderItem={renderExpenseItem}
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
        icon="plus"
        onPress={() => navigation.navigate('Expenses')}
      />

      <ConfirmModal
        visible={deleteModalVisible}
        title="Delete Expense"
        message={`Are you sure you want to delete "${expenseToDelete?.description}"? This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => {
          setDeleteModalVisible(false);
          setExpenseToDelete(null);
        }}
        destructive
        icon="receipt"
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
  categoryChips: {
    marginTop: 12,
  },
  categoryChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    marginRight: 8,
  },
  categoryChipIcon: {
    marginRight: 4,
  },
  resultInfo: {
    marginTop: 8,
  },
  expenseCard: {
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
  cardRight: {
    alignItems: 'flex-end',
  },
  deleteButton: {
    marginTop: 8,
    padding: 4,
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
