import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useExpenses } from '../../hooks/useExpenses';
import { useCustomers } from '../../hooks/useCustomers';
import { useReports } from '../../hooks/useReports';
import AppText from '../../components/common/AppText';
import EmptyState from '../../components/common/EmptyState';
import StatCard from '../../components/cards/StatCard';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL } from '../../constants';
import type { MoreStackParamList } from '../../navigation/types';
import type { Payment } from '../../types';
import type { Expense } from '../../types';

type NavigationProp = NativeStackNavigationProp<MoreStackParamList, 'Ledger'>;
type TabType = 'daybook' | 'customers' | 'cashbook' | 'pnl';

const TABS: { key: TabType; label: string; icon: string }[] = [
  { key: 'daybook', label: 'Day Book', icon: 'calendar-today' },
  { key: 'customers', label: 'Customers', icon: 'account-group' },
  { key: 'cashbook', label: 'Cash Book', icon: 'cash' },
  { key: 'pnl', label: 'P&L', icon: 'chart-line' },
];

function LedgerSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonTabs}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonLoader key={i} width={70} height={32} borderRadius={16} />
        ))}
      </View>
      <View style={styles.skeletonStats}>
        {[1, 2, 3].map((i) => (
          <Surface key={i} style={[styles.skeletonStatCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={36} height={36} borderRadius={10} />
            <SkeletonLoader width={80} height={18} marginTop={8} />
            <SkeletonLoader width={60} height={12} marginTop={4} />
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

export default function LedgerScreen() {
  const theme = useTheme();
  const navigation = useNavigation<NavigationProp>();

  const { payments, isLoading: paymentsLoading } = usePayments();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { customers } = useCustomers();
  const { getRevenueSummary, isLoading: reportsLoading } = useReports();

  const [activeTab, setActiveTab] = useState<TabType>('daybook');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [revenueSummary, setRevenueSummary] = useState<any>(null);

  const isLoading = paymentsLoading || expensesLoading || reportsLoading;

  useEffect(() => {
    getRevenueSummary().then(setRevenueSummary).catch(() => {});
  }, [getRevenueSummary]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await getRevenueSummary().then(setRevenueSummary);
    } catch {}
    setRefreshing(false);
  }, [getRevenueSummary]);

  const todayPayments = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return payments.filter((p) => {
      const d = new Date(p.paymentDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }, [payments]);

  const todayExpenses = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      d.setHours(0, 0, 0, 0);
      return d.getTime() === today.getTime();
    });
  }, [expenses]);

  const dailyIncome = todayPayments.reduce((sum, p) => sum + p.amount, 0);
  const dailyExpense = todayExpenses.reduce((sum, e) => sum + e.amount, 0);
  const dailyBalance = dailyIncome - dailyExpense;

  const customerMap = useMemo(() => {
    const map: Record<string, string> = {};
    customers.forEach((c) => { map[c.id] = c.name; });
    return map;
  }, [customers]);

  const allTransactions = useMemo(() => {
    const txns: Array<{
      id: string;
      type: string;
      description: string;
      amount: number;
      date: Date;
      isIncome: boolean;
    }> = [];

    todayPayments.forEach((p) => {
      txns.push({
        id: p.id,
        type: 'payment',
        description: `Payment from ${customerMap[p.customer?.id] || 'Customer'}`,
        amount: p.amount,
        date: new Date(p.paymentDate),
        isIncome: true,
      });
    });

    todayExpenses.forEach((e) => {
      txns.push({
        id: e.id,
        type: 'expense',
        description: e.description,
        amount: e.amount,
        date: new Date(e.expenseDate),
        isIncome: false,
      });
    });

    txns.sort((a, b) => b.date.getTime() - a.date.getTime());
    return txns;
  }, [todayPayments, todayExpenses, customerMap]);

  const cashPayments = useMemo(
    () => payments.filter((p) => p.paymentMode === 'cash'),
    [payments]
  );

  const cashExpenses = useMemo(
    () => expenses.filter((e) => e.paymentMode === 'cash'),
    [expenses]
  );

  const totalIncome = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netProfit = totalIncome - totalExpense;

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const renderTransactionItem = ({ item }: { item: typeof allTransactions[0] }) => (
    <Surface style={[styles.entryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <View
        style={[
          styles.entryIcon,
          { backgroundColor: item.isIncome ? theme.colors.successContainer : theme.colors.errorContainer },
        ]}
      >
        <Icon
          name={item.isIncome ? 'arrow-bottom-left' : 'arrow-top-right'}
          size={18}
          color={item.isIncome ? theme.colors.success : theme.colors.error}
        />
      </View>
      <View style={styles.entryInfo}>
        <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
          {item.description}
        </AppText>
        <AppText variant="caption" color="textTertiary">
          {item.type === 'payment' ? 'Income' : 'Expense'} · {formatDate(item.date)}
        </AppText>
      </View>
      <AppText variant="price" color={item.isIncome ? 'success' : 'error'}>
        {item.isIncome ? '+' : '-'}{CURRENCY_SYMBOL}{item.amount.toLocaleString('en-IN')}
      </AppText>
    </Surface>
  );

  const renderDayBook = () => (
    <>
      <View style={styles.summaryRow}>
        <StatCard
          icon="arrow-bottom-left"
          value={`${CURRENCY_SYMBOL}${dailyIncome.toLocaleString('en-IN')}`}
          label="Income Today"
          color={theme.colors.success}
        />
        <StatCard
          icon="arrow-top-right"
          value={`${CURRENCY_SYMBOL}${dailyExpense.toLocaleString('en-IN')}`}
          label="Expenses Today"
          color={theme.colors.error}
        />
        <StatCard
          icon="cash"
          value={`${CURRENCY_SYMBOL}${dailyBalance.toLocaleString('en-IN')}`}
          label="Balance"
          color={dailyBalance >= 0 ? theme.colors.success : theme.colors.error}
        />
      </View>
      <FlatList
        data={allTransactions}
        keyExtractor={(item) => item.id}
        renderItem={renderTransactionItem}
        ListEmptyComponent={
          <EmptyState
            icon="calendar-today"
            title="No Transactions Today"
            subtitle="Transactions for today will appear here"
          />
        }
        scrollEnabled={false}
      />
    </>
  );

  const renderCustomerLedger = () => (
    <>
      <View style={styles.summaryRow}>
        <StatCard
          icon="account-group"
          value={customers.length}
          label="Total Customers"
          color={theme.colors.primary}
        />
      </View>
      {customers
        .filter((c) => (c as any).outstandingAmount > 0)
        .map((customer) => (
          <TouchableOpacity
            key={customer.id}
            onPress={() => navigation.navigate('Ledger')}
            activeOpacity={0.7}
          >
            <Surface style={[styles.entryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <View style={[styles.entryIcon, { backgroundColor: theme.colors.primaryContainer }]}>
                <Icon name="account" size={18} color={theme.colors.primary} />
              </View>
              <View style={styles.entryInfo}>
                <AppText variant="bodyMedium" color="textPrimary">
                  {customer.name}
                </AppText>
                <AppText variant="caption" color="textTertiary">
                  Outstanding balance
                </AppText>
              </View>
              <AppText variant="price" color="error">
                {CURRENCY_SYMBOL}{((customer as any).outstandingAmount || 0).toLocaleString('en-IN')}
              </AppText>
            </Surface>
          </TouchableOpacity>
        ))}
    </>
  );

  const renderCashBook = () => (
    <>
      <View style={styles.summaryRow}>
        <StatCard
          icon="cash"
          value={`${CURRENCY_SYMBOL}${cashPayments.reduce((s, p) => s + p.amount, 0).toLocaleString('en-IN')}`}
          label="Cash Received"
          color={theme.colors.success}
        />
        <StatCard
          icon="cash"
          value={`${CURRENCY_SYMBOL}${cashExpenses.reduce((s, e) => s + e.amount, 0).toLocaleString('en-IN')}`}
          label="Cash Spent"
          color={theme.colors.error}
        />
      </View>
      {cashPayments.map((p) => (
        <Surface key={p.id} style={[styles.entryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.entryIcon, { backgroundColor: theme.colors.successContainer }]}>
            <Icon name="arrow-bottom-left" size={18} color={theme.colors.success} />
          </View>
          <View style={styles.entryInfo}>
            <AppText variant="bodyMedium" color="textPrimary">
              Cash received - {customerMap[p.customer?.id] || 'Customer'}
            </AppText>
            <AppText variant="caption" color="textTertiary">
              {formatDate(new Date(p.paymentDate))}
            </AppText>
          </View>
          <AppText variant="price" color="success">
            +{CURRENCY_SYMBOL}{p.amount.toLocaleString('en-IN')}
          </AppText>
        </Surface>
      ))}
      {cashExpenses.map((e) => (
        <Surface key={e.id} style={[styles.entryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.entryIcon, { backgroundColor: theme.colors.errorContainer }]}>
            <Icon name="arrow-top-right" size={18} color={theme.colors.error} />
          </View>
          <View style={styles.entryInfo}>
            <AppText variant="bodyMedium" color="textPrimary">
              {e.description}
            </AppText>
            <AppText variant="caption" color="textTertiary">
              {formatDate(new Date(e.expenseDate))}
            </AppText>
          </View>
          <AppText variant="price" color="error">
            -{CURRENCY_SYMBOL}{e.amount.toLocaleString('en-IN')}
          </AppText>
        </Surface>
      ))}
    </>
  );

  const renderProfitLoss = () => (
    <>
      <Surface style={[styles.pnlCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h4" color="textPrimary" style={styles.pnlTitle}>
          Profit & Loss Summary
        </AppText>
        <View style={styles.pnlRow}>
          <View style={styles.pnlItem}>
            <AppText variant="caption" color="textTertiary">Total Revenue</AppText>
            <AppText variant="price" color="success">
              {CURRENCY_SYMBOL}{totalIncome.toLocaleString('en-IN')}
            </AppText>
          </View>
          <View style={styles.pnlItem}>
            <AppText variant="caption" color="textTertiary">Total Expenses</AppText>
            <AppText variant="price" color="error">
              {CURRENCY_SYMBOL}{totalExpense.toLocaleString('en-IN')}
            </AppText>
          </View>
        </View>
        <View style={[styles.netProfitRow, { backgroundColor: netProfit >= 0 ? theme.colors.successContainer : theme.colors.errorContainer }]}>
          <AppText variant="h4" color={netProfit >= 0 ? 'success' : 'error'}>
            Net {netProfit >= 0 ? 'Profit' : 'Loss'}: {CURRENCY_SYMBOL}{Math.abs(netProfit).toLocaleString('en-IN')}
          </AppText>
        </View>
      </Surface>

      <TouchableOpacity
        onPress={() => navigation.navigate('Ledger')}
        activeOpacity={0.7}
        style={styles.pnlLink}
      >
        <Surface style={[styles.entryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={[styles.entryIcon, { backgroundColor: theme.colors.infoContainer }]}>
            <Icon name="chart-line" size={18} color={theme.colors.info} />
          </View>
          <View style={styles.entryInfo}>
            <AppText variant="bodyMedium" color="textPrimary">Detailed P&L Report</AppText>
            <AppText variant="caption" color="textTertiary">View full breakdown with charts</AppText>
          </View>
          <Icon name="chevron-right" size={20} color={theme.colors.textTertiary} />
        </Surface>
      </TouchableOpacity>
    </>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'daybook':
        return renderDayBook();
      case 'customers':
        return renderCustomerLedger();
      case 'cashbook':
        return renderCashBook();
      case 'pnl':
        return renderProfitLoss();
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <LedgerSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={[]}
        renderItem={() => null}
        ListHeaderComponent={
          <>
            <View style={styles.tabsContainer}>
              <View style={styles.tabs}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <TouchableOpacity
                      key={tab.key}
                      onPress={() => setActiveTab(tab.key)}
                      style={[
                        styles.tab,
                        {
                          backgroundColor: isActive
                            ? theme.colors.primaryContainer
                            : 'transparent',
                        },
                      ]}
                    >
                      <Icon
                        name={tab.icon}
                        size={16}
                        color={isActive ? theme.colors.primary : theme.colors.textTertiary}
                      />
                      <AppText
                        variant="labelMedium"
                        color={isActive ? 'primary' : 'textTertiary'}
                        style={styles.tabLabel}
                      >
                        {tab.label}
                      </AppText>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
            {renderTabContent()}
          </>
        }
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[theme.colors.primary]}
            tintColor={theme.colors.primary}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 16,
    paddingBottom: 32,
  },
  tabsContainer: {
    marginBottom: 16,
  },
  tabs: {
    flexDirection: 'row',
    gap: 8,
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 20,
  },
  tabLabel: {
    marginLeft: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
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
  pnlCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  pnlTitle: {
    marginBottom: 16,
  },
  pnlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  pnlItem: {
    flex: 1,
  },
  netProfitRow: {
    padding: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  pnlLink: {
    marginBottom: 10,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonTabs: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  skeletonStats: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  skeletonStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
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
