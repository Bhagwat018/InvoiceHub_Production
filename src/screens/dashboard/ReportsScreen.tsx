import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { useTheme, Surface, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useReports } from '../../hooks/useReports';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import AppText from '../../components/common/AppText';
import StatCard from '../../components/cards/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import LoadingState from '../../components/common/LoadingState';
import { CURRENCY_SYMBOL, EXPENSE_TYPE_LABELS } from '../../constants';
import type { DashboardStackParamList } from '../../navigation/types';
import type { RevenueSummary, MonthlyRevenue, TopProduct, CategoryWiseExpense } from '../../database/repositories/ReportsRepository';

type NavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'Reports'>;

type DateRangeOption = 'week' | 'month' | 'quarter' | 'year' | 'custom';

const DATE_RANGE_OPTIONS: { label: string; value: DateRangeOption }[] = [
  { label: 'This Week', value: 'week' },
  { label: 'This Month', value: 'month' },
  { label: 'This Quarter', value: 'quarter' },
  { label: 'This Year', value: 'year' },
];

function ReportsSkeleton() {
  const theme = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      <SkeletonLoader width={140} height={24} />
      <View style={styles.skeletonChips}>
        {[1, 2, 3, 4].map((i) => (
          <SkeletonLoader key={i} width={80} height={32} borderRadius={16} />
        ))}
      </View>
      <View style={styles.skeletonStatsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Surface key={i} style={[styles.skeletonStatCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={36} height={36} borderRadius={10} />
            <SkeletonLoader width={70} height={18} marginTop={10} />
            <SkeletonLoader width={50} height={10} marginTop={4} />
          </Surface>
        ))}
      </View>
      <Surface style={[styles.skeletonChart, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <SkeletonLoader width={100} height={16} />
        <SkeletonLoader width="100%" height={180} marginTop={12} borderRadius={8} />
      </Surface>
      <Surface style={[styles.skeletonChart, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <SkeletonLoader width={120} height={16} />
        <SkeletonLoader width="100%" height={160} marginTop={12} borderRadius={8} />
      </Surface>
    </View>
  );
}

export default function ReportsScreen() {
  const theme = useTheme();
  const { colors } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const {
    getRevenueSummary,
    getMonthlyRevenue,
    getCustomerReceivables,
    getCategoryWiseExpenses,
    getTopProducts,
    isLoading,
  } = useReports();

  const [selectedRange, setSelectedRange] = useState<DateRangeOption>('month');
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<
    { customerId: string; customerName: string; totalInvoiced: number; outstanding: number }[]
  >([]);
  const [expenseData, setExpenseData] = useState<CategoryWiseExpense[]>([]);

  const fetchData = useCallback(async () => {
    try {
      const [
        summaryData,
        monthly,
        customers,
        expenses,
        products,
      ] = await Promise.all([
        getRevenueSummary(),
        getMonthlyRevenue(new Date().getFullYear()),
        getCustomerReceivables(),
        getCategoryWiseExpenses(),
        getTopProducts(5),
      ]);

      setSummary(summaryData);
      setMonthlyData(monthly);
      setTopCustomers(customers.slice(0, 5));
      setExpenseData(expenses);
      setTopProducts(products);
    } catch {}
  }, [getRevenueSummary, getMonthlyRevenue, getCustomerReceivables, getCategoryWiseExpenses, getTopProducts]);

  useEffect(() => {
    if (isInitialLoad) {
      fetchData().finally(() => setIsInitialLoad(false));
    }
  }, [isInitialLoad, fetchData]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  }, [fetchData]);

  const handleExport = (format: 'pdf' | 'csv' | 'excel') => {
    // TODO: implement export
  };

  const formatCurrency = (amount: number) =>
    `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;

  const getFilteredMonthlyData = () => {
    const now = new Date();
    const currentMonth = now.getMonth();

    switch (selectedRange) {
      case 'week': {
        const startOfWeek = now.getDate() - now.getDay();
        const weekData: { label: string; value: number }[] = [];
        for (let i = 0; i < 7; i++) {
          const day = new Date(now);
          day.setDate(startOfWeek + i);
          weekData.push({
            label: day.toLocaleDateString('en-IN', { weekday: 'short' }),
            value: monthlyData[currentMonth]?.revenue || 0,
          });
        }
        return weekData;
      }
      case 'quarter': {
        const quarterStart = Math.floor(currentMonth / 3) * 3;
        return monthlyData.slice(quarterStart, quarterStart + 3).map((m) => ({
          label: m.month,
          value: m.revenue,
        }));
      }
      case 'year':
        return monthlyData.map((m) => ({
          label: m.month,
          value: m.revenue,
        }));
      case 'month':
      default:
        return monthlyData.map((m) => ({
          label: m.month,
          value: m.revenue,
        }));
    }
  };

  const getFilteredExpenseData = () => {
    return expenseData.slice(0, 6).map((e) => ({
      label: EXPENSE_TYPE_LABELS[e.category as keyof typeof EXPENSE_TYPE_LABELS] || e.category,
      value: e.total,
    }));
  };

  const getPieData = () => {
    return expenseData.slice(0, 6).map((e) => ({
      label: EXPENSE_TYPE_LABELS[e.category as keyof typeof EXPENSE_TYPE_LABELS] || e.category,
      value: e.total,
    }));
  };

  if (isInitialLoad) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ReportsSkeleton />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
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
      <View style={styles.dateRangeRow}>
        {DATE_RANGE_OPTIONS.map((option) => (
          <TouchableOpacity
            key={option.value}
            onPress={() => setSelectedRange(option.value)}
            style={[
              styles.dateRangeChip,
              {
                backgroundColor:
                  selectedRange === option.value
                    ? theme.colors.primaryContainer
                    : theme.colors.surfaceVariant,
                borderColor:
                  selectedRange === option.value
                    ? theme.colors.primary
                    : theme.colors.border,
              },
            ]}
          >
            <AppText
              variant="labelMedium"
              color={selectedRange === option.value ? 'primary' : 'textSecondary'}
            >
              {option.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {summary && (
        <View style={styles.summaryGrid}>
          <View style={styles.summaryCardWrapper}>
            <StatCard
              icon="cash-multiple"
              value={formatCurrency(summary.totalRevenue)}
              label="Revenue"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.summaryCardWrapper}>
            <StatCard
              icon="receipt"
              value={formatCurrency(summary.totalExpenses)}
              label="Expenses"
              color={theme.colors.error}
            />
          </View>
          <View style={styles.summaryCardWrapper}>
            <StatCard
              icon="chart-line-variant"
              value={formatCurrency(summary.netProfit)}
              label="Profit"
              color={theme.colors.success}
            />
          </View>
          <View style={styles.summaryCardWrapper}>
            <StatCard
              icon="clock-outline"
              value={formatCurrency(summary.totalReceivable)}
              label="Outstanding"
              color={theme.colors.warning}
            />
          </View>
        </View>
      )}

      <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.chartHeader}>
          <AppText variant="h5" color="textPrimary">
            Revenue Chart
          </AppText>
          <TouchableOpacity
            onPress={() => navigation.navigate('ReportDetail', { reportType: 'revenue', title: 'Revenue Report' })}
          >
            <AppText variant="labelMedium" color="primary">
              Details
            </AppText>
          </TouchableOpacity>
        </View>
        {monthlyData.length > 0 ? (
          <LineChart
            data={getFilteredMonthlyData()}
            lineColor={theme.colors.primary}
            dotColor={theme.colors.primary}
            height={200}
          />
        ) : (
          <View style={styles.emptyChart}>
            <AppText variant="bodySmall" color="textTertiary">
              No revenue data available
            </AppText>
          </View>
        )}
      </Surface>

      {expenseData.length > 0 && (
        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.chartHeader}>
            <AppText variant="h5" color="textPrimary">
              Expense Breakdown
            </AppText>
          </View>
          <View style={styles.pieChartRow}>
            <PieChart data={getPieData()} size={160} />
          </View>
          <View style={styles.expenseBarContainer}>
            <BarChart
              data={getFilteredExpenseData()}
              barColor={theme.colors.error}
              height={160}
            />
          </View>
        </Surface>
      )}

      {topCustomers.length > 0 && (
        <Surface style={[styles.listCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.listHeader}>
            <AppText variant="h5" color="textPrimary">
              Top Customers
            </AppText>
          </View>
          {topCustomers.map((customer, index) => (
            <TouchableOpacity
              key={customer.customerId}
              style={[
                styles.listItem,
                index < topCustomers.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.divider,
                },
              ]}
              onPress={() =>
                navigation.navigate('CustomerDetail' as any, { customerId: customer.customerId })
              }
            >
              <View style={styles.listItemLeft}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: theme.colors.primaryContainer },
                  ]}
                >
                  <AppText variant="labelSmall" color="primary">
                    {index + 1}
                  </AppText>
                </View>
                <View style={styles.listItemText}>
                  <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
                    {customer.customerName}
                  </AppText>
                  <AppText variant="caption" color="textTertiary">
                    {formatCurrency(customer.totalInvoiced)} invoiced
                  </AppText>
                </View>
              </View>
              {customer.outstanding > 0 && (
                <AppText variant="price" color="error">
                  {formatCurrency(customer.outstanding)}
                </AppText>
              )}
            </TouchableOpacity>
          ))}
        </Surface>
      )}

      {topProducts.length > 0 && (
        <Surface style={[styles.listCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.listHeader}>
            <AppText variant="h5" color="textPrimary">
              Top Products
            </AppText>
          </View>
          {topProducts.map((product, index) => (
            <View
              key={product.productId}
              style={[
                styles.listItem,
                index < topProducts.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.divider,
                },
              ]}
            >
              <View style={styles.listItemLeft}>
                <View
                  style={[
                    styles.rankBadge,
                    { backgroundColor: theme.colors.secondaryContainer },
                  ]}
                >
                  <AppText variant="labelSmall" color="secondary">
                    {index + 1}
                  </AppText>
                </View>
                <View style={styles.listItemText}>
                  <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
                    {product.productName}
                  </AppText>
                  <AppText variant="caption" color="textTertiary">
                    {product.totalQuantity} units sold
                  </AppText>
                </View>
              </View>
              <AppText variant="price" color="textPrimary">
                {formatCurrency(product.totalRevenue)}
              </AppText>
            </View>
          ))}
        </Surface>
      )}

      <View style={styles.exportSection}>
        <AppText variant="h5" color="textPrimary" style={styles.exportTitle}>
          Export Report
        </AppText>
        <View style={styles.exportButtons}>
          <Button
            mode="outlined"
            icon="file-pdf-box"
            onPress={() => handleExport('pdf')}
            style={styles.exportButton}
          >
            PDF
          </Button>
          <Button
            mode="outlined"
            icon="file-delimited-outline"
            onPress={() => handleExport('csv')}
            style={styles.exportButton}
          >
            CSV
          </Button>
          <Button
            mode="outlined"
            icon="microsoft-excel"
            onPress={() => handleExport('excel')}
            style={styles.exportButton}
          >
            Excel
          </Button>
        </View>
      </View>

      <View style={{ height: 32 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
    flexWrap: 'wrap',
  },
  dateRangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  summaryGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  summaryCardWrapper: {
    width: '47.5%',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  emptyChart: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieChartRow: {
    alignItems: 'center',
    marginBottom: 16,
  },
  expenseBarContainer: {
    marginTop: 8,
  },
  listCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  listHeader: {
    marginBottom: 12,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
  },
  listItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  rankBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  listItemText: {
    flex: 1,
  },
  exportSection: {
    marginTop: 8,
  },
  exportTitle: {
    marginBottom: 12,
  },
  exportButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  exportButton: {
    flex: 1,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonChips: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 20,
  },
  skeletonStatsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  skeletonStatCard: {
    width: '47.5%',
    padding: 16,
    borderRadius: 16,
  },
  skeletonChart: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
});
