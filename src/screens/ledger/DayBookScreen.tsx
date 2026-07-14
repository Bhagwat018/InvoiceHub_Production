import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Platform,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import DateTimePicker from '../../stubs/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { useCustomers } from '../../hooks/useCustomers';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL } from '../../constants';

interface DayTransaction {
  id: string;
  type: 'income' | 'expense' | 'payment';
  description: string;
  amount: number;
  date: Date;
  reference?: string;
}

function DayBookSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonDateRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonLoader key={i} width={70} height={32} borderRadius={16} />
        ))}
      </View>
      <View style={styles.skeletonStats}>
        {[1, 2, 3].map((i) => (
          <Surface key={i} style={[styles.skeletonStatCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={36} height={36} borderRadius={10} />
            <SkeletonLoader width={80} height={16} marginTop={8} />
          </Surface>
        ))}
      </View>
      {[1, 2, 3, 4].map((i) => (
        <Surface key={i} style={[styles.skeletonEntry, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.skeletonEntryContent}>
            <SkeletonLoader width={32} height={32} borderRadius={16} />
            <View style={styles.skeletonEntryInfo}>
              <SkeletonLoader width={140} height={14} />
              <SkeletonLoader width={80} height={10} marginTop={4} />
            </View>
            <SkeletonLoader width={60} height={14} />
          </View>
        </Surface>
      ))}
    </View>
  );
}

export default function DayBookScreen() {
  const theme = useTheme();

  const { payments, isLoading: paymentsLoading } = usePayments();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { customers } = useCustomers();

  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const isLoading = paymentsLoading || expensesLoading;

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [customers]);

  const dayPayments = useMemo(() => {
    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);
    return payments.filter((p) => {
      const d = new Date(p.paymentDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target.getTime();
    });
  }, [payments, selectedDate]);

  const dayExpenses = useMemo(() => {
    const target = new Date(selectedDate);
    target.setHours(0, 0, 0, 0);
    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === target.getTime();
    });
  }, [expenses, selectedDate]);

  const transactions = useMemo((): DayTransaction[] => {
    const txns: DayTransaction[] = [];

    dayPayments.forEach((p) => {
      txns.push({
        id: `pay-${p.id}`,
        type: 'payment',
        description: `Payment from ${customerMap[p.customer?.id] || 'Customer'}`,
        amount: p.amount,
        date: new Date(p.paymentDate),
        reference: p.paymentNumber,
      });
    });

    dayExpenses.forEach((e) => {
      txns.push({
        id: `exp-${e.id}`,
        type: 'expense',
        description: e.description,
        amount: e.amount,
        date: new Date(e.expenseDate),
        reference: e.expenseNumber,
      });
    });

    txns.sort((a, b) => b.date.getTime() - a.date.getTime());
    return txns;
  }, [dayPayments, dayExpenses, customerMap]);

  const dailyIncome = dayPayments.reduce((s, p) => s + p.amount, 0);
  const dailyExpense = dayExpenses.reduce((s, e) => s + e.amount, 0);
  const dailyBalance = dailyIncome - dailyExpense;

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const handleDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') {
      setShowDatePicker(false);
    }
    if (date) {
      setSelectedDate(date);
    }
  };

  const setSelectedDay = (daysOffset: number) => {
    const d = new Date();
    d.setDate(d.getDate() + daysOffset);
    setSelectedDate(d);
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const formatTime = (date: Date) =>
    new Date(date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });

  const isToday = useMemo(() => {
    const today = new Date();
    const sel = new Date(selectedDate);
    return (
      today.getDate() === sel.getDate() &&
      today.getMonth() === sel.getMonth() &&
      today.getFullYear() === sel.getFullYear()
    );
  }, [selectedDate]);

  const renderTransactionItem = ({ item }: { item: DayTransaction }) => (
    <Surface style={[styles.entryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View
        style={[
          styles.entryIcon,
          {
            backgroundColor:
              item.type === 'payment' ? theme.colors.successContainer : theme.colors.errorContainer,
          },
        ]}
      >
        <Icon
          name={item.type === 'payment' ? 'arrow-bottom-left' : 'arrow-top-right'}
          size={18}
          color={item.type === 'payment' ? theme.colors.success : theme.colors.error}
        />
      </View>
      <View style={styles.entryInfo}>
        <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
          {item.description}
        </AppText>
        <AppText variant="caption" color="textTertiary">
          {item.type === 'payment' ? 'Income' : 'Expense'} · {formatTime(item.date)}
          {item.reference ? ` · ${item.reference}` : ''}
        </AppText>
      </View>
      <AppText variant="price" color={item.type === 'payment' ? 'success' : 'error'}>
        {item.type === 'payment' ? '+' : '-'}{CURRENCY_SYMBOL}{item.amount.toLocaleString('en-IN')}
      </AppText>
    </Surface>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <View style={styles.dateRow}>
        <TouchableOpacity
          onPress={() => setSelectedDay(-1)}
          style={[styles.dateQuickButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <AppText variant="labelMedium" color="textSecondary">Yesterday</AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setSelectedDay(0)}
          style={[
            styles.dateQuickButton,
            {
              backgroundColor: isToday ? theme.colors.primaryContainer : theme.colors.surfaceVariant,
              borderColor: isToday ? theme.colors.primary : 'transparent',
            },
          ]}
        >
          <AppText
            variant="labelMedium"
            color={isToday ? 'primary' : 'textSecondary'}
          >
            Today
          </AppText>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setShowDatePicker(true)}
          style={[styles.dateQuickButton, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Icon name="calendar" size={16} color={theme.colors.textSecondary} />
          <AppText variant="labelMedium" color="textSecondary" style={styles.customDateText}>
            {formatDate(selectedDate)}
          </AppText>
        </TouchableOpacity>
      </View>

      {showDatePicker && (
        <DateTimePicker
          value={selectedDate}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={handleDateChange}
        />
      )}

      <View style={styles.summaryRow}>
        <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.colors.successContainer }]}>
            <Icon name="arrow-bottom-left" size={18} color={theme.colors.success} />
          </View>
          <AppText variant="caption" color="textTertiary">Income</AppText>
          <AppText variant="price" color="success">
            {CURRENCY_SYMBOL}{dailyIncome.toLocaleString('en-IN')}
          </AppText>
        </Surface>
        <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.summaryIcon, { backgroundColor: theme.colors.errorContainer }]}>
            <Icon name="arrow-top-right" size={18} color={theme.colors.error} />
          </View>
          <AppText variant="caption" color="textTertiary">Expenses</AppText>
          <AppText variant="price" color="error">
            {CURRENCY_SYMBOL}{dailyExpense.toLocaleString('en-IN')}
          </AppText>
        </Surface>
        <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View
            style={[
              styles.summaryIcon,
              { backgroundColor: dailyBalance >= 0 ? theme.colors.successContainer : theme.colors.errorContainer },
            ]}
          >
            <Icon
              name="cash"
              size={18}
              color={dailyBalance >= 0 ? theme.colors.success : theme.colors.error}
            />
          </View>
          <AppText variant="caption" color="textTertiary">Balance</AppText>
          <AppText variant="price" color={dailyBalance >= 0 ? 'success' : 'error'}>
            {CURRENCY_SYMBOL}{Math.abs(dailyBalance).toLocaleString('en-IN')}
          </AppText>
        </Surface>
      </View>

      <View style={styles.transactionHeader}>
        <AppText variant="labelLarge" color="textPrimary">
          Transactions ({transactions.length})
        </AppText>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="calendar-blank"
      title="No Transactions"
      subtitle={`No transactions found for ${formatDate(selectedDate)}`}
    />
  );

  const renderDailySummary = () => (
    <Surface style={[styles.dailySummary, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <AppText variant="labelLarge" color="textPrimary" style={styles.summaryTitle}>
        Daily Summary
      </AppText>
      <View style={styles.summaryRow}>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color="textTertiary">Transactions</AppText>
          <AppText variant="h4" color="textPrimary">{transactions.length}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color="textTertiary">Income</AppText>
          <AppText variant="h4" color="success">{dayPayments.length}</AppText>
        </View>
        <View style={styles.summaryItem}>
          <AppText variant="caption" color="textTertiary">Expenses</AppText>
          <AppText variant="h4" color="error">{dayExpenses.length}</AppText>
        </View>
      </View>
    </Surface>
  );

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Day Book" />
        <DayBookSkeleton />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer>
      <ScreenHeader title="Day Book" />

      <FlatList
        data={transactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        ListFooterComponent={transactions.length > 0 ? renderDailySummary : null}
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
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  dateQuickButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  customDateText: {
    marginLeft: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  summaryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  transactionHeader: {
    marginBottom: 8,
  },
  entryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  entryIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  entryInfo: {
    flex: 1,
    marginLeft: 12,
  },
  dailySummary: {
    padding: 16,
    borderRadius: 12,
    marginTop: 8,
  },
  summaryTitle: {
    marginBottom: 12,
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonDateRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  skeletonStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  skeletonEntry: {
    padding: 14,
    borderRadius: 12,
    marginBottom: 10,
  },
  skeletonEntryContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonEntryInfo: {
    flex: 1,
    marginLeft: 12,
  },
});
