import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import DateTimePicker from '../../stubs/datetimepicker';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { usePayments } from '../../hooks/usePayments';
import { useExpenses } from '../../hooks/useExpenses';
import { useReports } from '../../hooks/useReports';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import StatCard from '../../components/cards/StatCard';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL, EXPENSE_TYPE_LABELS } from '../../constants';

function PnLSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonDateRow}>
        {[1, 2, 3].map((i) => (
          <SkeletonLoader key={i} width={80} height={36} borderRadius={18} />
        ))}
      </View>
      <View style={styles.skeletonStats}>
        {[1, 2, 3].map((i) => (
          <Surface key={i} style={[styles.skeletonStatCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={40} height={40} borderRadius={12} />
            <SkeletonLoader width={90} height={20} marginTop={10} />
            <SkeletonLoader width={60} height={12} marginTop={4} />
          </Surface>
        ))}
      </View>
      <Surface style={[styles.skeletonChart, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <SkeletonLoader width={120} height={18} />
        <SkeletonLoader width="100%" height={200} marginTop={16} borderRadius={8} />
      </Surface>
    </View>
  );
}

export default function ProfitLossScreen() {
  const theme = useTheme();

  const { payments, isLoading: paymentsLoading } = usePayments();
  const { expenses, isLoading: expensesLoading } = useExpenses();
  const { getMonthlyRevenue, getCategoryWiseExpenses, isLoading: reportsLoading } = useReports();

  const [dateRange, setDateRange] = useState<'week' | 'month' | 'quarter' | 'year' | 'custom'>('month');
  const [startDate, setStartDate] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 1);
    return d;
  });
  const [endDate, setEndDate] = useState(new Date());
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [monthlyRevenue, setMonthlyRevenue] = useState<Array<{ month: string; amount: number }>>([]);
  const [categoryExpenses, setCategoryExpenses] = useState<Array<{ category: string; total: number }>>([]);

  const isLoading = paymentsLoading || expensesLoading || reportsLoading;

  const loadReportData = useCallback(async () => {
    try {
      const [monthly, catExpenses] = await Promise.all([
        getMonthlyRevenue(new Date().getFullYear()),
        getCategoryWiseExpenses(startDate, endDate),
      ]);
      setMonthlyRevenue(monthly.map((m) => ({ month: m.month, amount: m.revenue })));
      setCategoryExpenses(catExpenses.map((c) => ({ category: c.category, total: c.total })));
    } catch {}
  }, [getMonthlyRevenue, getCategoryWiseExpenses, startDate, endDate]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const filteredPayments = useMemo(() => {
    return payments.filter((p) => {
      const d = new Date(p.paymentDate);
      return d >= startDate && d <= endDate;
    });
  }, [payments, startDate, endDate]);

  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      const d = new Date(e.expenseDate);
      return d >= startDate && d <= endDate;
    });
  }, [expenses, startDate, endDate]);

  const totalRevenue = filteredPayments.reduce((s, p) => s + p.amount, 0);
  const totalExpenses = filteredExpenses.reduce((s, e) => s + e.amount, 0);
  const netProfit = totalRevenue - totalExpenses;
  const isProfit = netProfit >= 0;

  const expenseBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach((e) => {
      const type = (e as any).expenseType || 'other';
      const label = EXPENSE_TYPE_LABELS[type as keyof typeof EXPENSE_TYPE_LABELS] || type;
      map[label] = (map[label] || 0) + e.amount;
    });
    return Object.entries(map)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredExpenses]);

  const revenueBreakdown = useMemo(() => {
    const modeMap: Record<string, number> = {};
    filteredPayments.forEach((p) => {
      const mode = p.paymentMode || 'other';
      modeMap[mode] = (modeMap[mode] || 0) + p.amount;
    });
    return Object.entries(modeMap)
      .map(([category, total]) => ({ category, total }))
      .sort((a, b) => b.total - a.total);
  }, [filteredPayments]);

  const pieData = useMemo(() => {
    if (expenseBreakdown.length === 0) return [];
    return expenseBreakdown.slice(0, 6).map((item) => ({
      label: item.category,
      value: item.total,
    }));
  }, [expenseBreakdown]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadReportData();
    setRefreshing(false);
  }, [loadReportData]);

  const handleRangeSelect = (range: 'week' | 'month' | 'quarter' | 'year' | 'custom') => {
    setDateRange(range);
    const now = new Date();
    const start = new Date();
    switch (range) {
      case 'week':
        start.setDate(now.getDate() - 7);
        break;
      case 'month':
        start.setMonth(now.getMonth() - 1);
        break;
      case 'quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      case 'year':
        start.setFullYear(now.getFullYear() - 1);
        break;
      case 'custom':
        return;
    }
    setStartDate(start);
    setEndDate(now);
  };

  const handleStartDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowStartPicker(false);
    if (date) setStartDate(date);
  };

  const handleEndDateChange = (_: any, date?: Date) => {
    if (Platform.OS === 'android') setShowEndPicker(false);
    if (date) setEndDate(date);
  };

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  if (isLoading) {
    return (
      <ScreenContainer>
        <ScreenHeader title="Profit & Loss" />
        <PnLSkeleton />
      </ScreenContainer>
    );
  }

  return (
    <ScreenContainer scroll>
      <ScreenHeader title="Profit & Loss" />

      <View style={styles.content}>
        <View style={styles.dateRangeRow}>
          {(['week', 'month', 'quarter', 'year', 'custom'] as const).map((range) => (
            <View
              key={range}
              style={[
                styles.rangeChip,
                {
                  backgroundColor:
                    dateRange === range
                      ? theme.colors.primaryContainer
                      : theme.colors.surfaceVariant,
                  borderColor: dateRange === range ? theme.colors.primary : theme.colors.border,
                },
              ]}
            >
              <AppText
                variant="labelMedium"
                color={dateRange === range ? 'primary' : 'textSecondary'}
                onPress={() => handleRangeSelect(range)}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </AppText>
            </View>
          ))}
        </View>

        {dateRange === 'custom' && (
          <View style={styles.customDateRow}>
            <View style={styles.dateButton}>
              <AppText variant="caption" color="textTertiary">From</AppText>
              <Surface style={[styles.dateButtonInner, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <Icon name="calendar" size={16} color={theme.colors.textTertiary} />
                <AppText variant="bodySmall" color="textPrimary" onPress={() => setShowStartPicker(true)}>
                  {formatDate(startDate)}
                </AppText>
              </Surface>
            </View>
            <View style={styles.dateButton}>
              <AppText variant="caption" color="textTertiary">To</AppText>
              <Surface style={[styles.dateButtonInner, { backgroundColor: theme.colors.surface }]} elevation={1}>
                <Icon name="calendar" size={16} color={theme.colors.textTertiary} />
                <AppText variant="bodySmall" color="textPrimary" onPress={() => setShowEndPicker(true)}>
                  {formatDate(endDate)}
                </AppText>
              </Surface>
            </View>
          </View>
        )}

        {showStartPicker && (
          <DateTimePicker
            value={startDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleStartDateChange}
          />
        )}
        {showEndPicker && (
          <DateTimePicker
            value={endDate}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            onChange={handleEndDateChange}
          />
        )}

        <View style={styles.statsGrid}>
          <View style={styles.statHalf}>
            <StatCard
              icon="trending-up"
              value={`${CURRENCY_SYMBOL}${totalRevenue.toLocaleString('en-IN')}`}
              label="Total Revenue"
              color={theme.colors.success}
            />
          </View>
          <View style={styles.statHalf}>
            <StatCard
              icon="trending-down"
              value={`${CURRENCY_SYMBOL}${totalExpenses.toLocaleString('en-IN')}`}
              label="Total Expenses"
              color={theme.colors.error}
            />
          </View>
        </View>

        <Surface style={[styles.profitCard, { backgroundColor: isProfit ? theme.colors.successContainer : theme.colors.errorContainer }]} elevation={1}>
          <Icon
            name={isProfit ? 'trending-up' : 'trending-down'}
            size={32}
            color={isProfit ? theme.colors.success : theme.colors.error}
          />
          <View style={styles.profitInfo}>
            <AppText variant="h3" color={isProfit ? 'success' : 'error'}>
              Net {isProfit ? 'Profit' : 'Loss'}
            </AppText>
            <AppText variant="priceLarge" color={isProfit ? 'success' : 'error'}>
              {CURRENCY_SYMBOL}{Math.abs(netProfit).toLocaleString('en-IN')}
            </AppText>
          </View>
          <View style={styles.profitPercent}>
            <AppText variant="labelLarge" color={isProfit ? 'success' : 'error'}>
              {totalRevenue > 0 ? `${((Math.abs(netProfit) / totalRevenue) * 100).toFixed(1)}%` : '0%'}
            </AppText>
            <AppText variant="caption" color={isProfit ? 'success' : 'error'}>
              margin
            </AppText>
          </View>
        </Surface>

        {monthlyRevenue.length > 0 && (
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Monthly Revenue Trend
            </AppText>
            <BarChart
              data={monthlyRevenue.map((m) => ({ label: m.month, value: m.amount }))}
              barColor={theme.colors.primary}
              height={200}
            />
          </Surface>
        )}

        {expenseBreakdown.length > 0 && (
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
              Expense Breakdown
            </AppText>
            <PieChart data={pieData} size={200} />
          </Surface>
        )}

        <Surface style={[styles.breakdownCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
            Revenue by Payment Mode
          </AppText>
          {revenueBreakdown.map((item, index) => (
            <View key={index} style={styles.breakdownRow}>
              <View style={styles.breakdownInfo}>
                <View style={[styles.breakdownDot, { backgroundColor: theme.colors.primary }]} />
                <AppText variant="bodyMedium" color="textPrimary">{item.category}</AppText>
              </View>
              <AppText variant="bodyMedium" color="success">
                {CURRENCY_SYMBOL}{item.total.toLocaleString('en-IN')}
              </AppText>
            </View>
          ))}
        </Surface>

        <Surface style={[styles.breakdownCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.sectionTitle}>
            Expense by Category
          </AppText>
          {expenseBreakdown.map((item, index) => {
            const percentage = totalExpenses > 0 ? (item.total / totalExpenses) * 100 : 0;
            return (
              <View key={index} style={styles.breakdownRow}>
                <View style={styles.breakdownInfo}>
                  <View style={[styles.breakdownDot, { backgroundColor: theme.colors.error }]} />
                  <View style={styles.breakdownTextCol}>
                    <AppText variant="bodyMedium" color="textPrimary">{item.category}</AppText>
                    <AppText variant="caption" color="textTertiary">
                      {percentage.toFixed(1)}%
                    </AppText>
                  </View>
                </View>
                <AppText variant="bodyMedium" color="error">
                  {CURRENCY_SYMBOL}{item.total.toLocaleString('en-IN')}
                </AppText>
              </View>
            );
          })}
        </Surface>
      </View>
    </ScreenContainer>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
  },
  dateRangeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  rangeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  customDateRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  dateButton: {
    flex: 1,
  },
  dateButtonInner: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginTop: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  statHalf: {
    flex: 1,
  },
  profitCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
  },
  profitInfo: {
    flex: 1,
    marginLeft: 16,
  },
  profitPercent: {
    alignItems: 'flex-end',
  },
  chartCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  breakdownCard: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  sectionTitle: {
    marginBottom: 16,
  },
  breakdownRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: '#E0E0E0',
  },
  breakdownInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  breakdownDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  breakdownTextCol: {
    flex: 1,
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
    gap: 12,
    marginBottom: 16,
  },
  skeletonStatCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  skeletonChart: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
});
