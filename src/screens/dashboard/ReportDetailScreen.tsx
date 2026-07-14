import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useReports } from '../../hooks/useReports';
import { useInvoices } from '../../hooks/useInvoices';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import StatCard from '../../components/cards/StatCard';
import LineChart from '../../components/charts/LineChart';
import BarChart from '../../components/charts/BarChart';
import PieChart from '../../components/charts/PieChart';
import Badge from '../../components/common/Badge';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL, INVOICE_STATUS_LABELS } from '../../constants';
import type { Invoice, InvoiceStatus } from '../../types';
import type {
  RevenueSummary,
  MonthlyRevenue,
  CustomerReceivable,
  CategoryWiseExpense,
  TopProduct,
} from '../../database/repositories/ReportsRepository';

interface RouteParams {
  reportType: string;
  title: string;
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

function DetailSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skeletonContainer}>
      <SkeletonLoader width={140} height={24} />
      <View style={styles.skeletonGrid}>
        {[1, 2].map((i) => (
          <Surface key={i} style={[styles.skeletonCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={36} height={36} borderRadius={10} />
            <SkeletonLoader width={80} height={18} marginTop={10} />
            <SkeletonLoader width={60} height={10} marginTop={4} />
          </Surface>
        ))}
      </View>
      <Surface style={[styles.skeletonChart, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <SkeletonLoader width="100%" height={220} borderRadius={8} />
      </Surface>
      <Surface style={[styles.skeletonTable, { backgroundColor: theme.colors.surface }]} elevation={1}>
        {[1, 2, 3, 4, 5].map((i) => (
          <View key={i} style={styles.skeletonRow}>
            <SkeletonLoader width="30%" height={14} />
            <SkeletonLoader width="20%" height={14} />
            <SkeletonLoader width="25%" height={14} />
          </View>
        ))}
      </Surface>
    </View>
  );
}

export default function ReportDetailScreen() {
  const theme = useTheme();
  const route = useRoute();
  const navigation = useNavigation();
  const { reportType, title } = route.params as RouteParams;

  const {
    getRevenueSummary,
    getMonthlyRevenue,
    getCustomerReceivables,
    getCategoryWiseExpenses,
    getTopProducts,
    getGstSummary,
  } = useReports();

  const { invoices } = useInvoices();

  const [isInitialLoad, setIsInitialLoad] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [summary, setSummary] = useState<RevenueSummary | null>(null);
  const [monthlyData, setMonthlyData] = useState<MonthlyRevenue[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [topCustomers, setTopCustomers] = useState<CustomerReceivable[]>([]);
  const [expenseData, setExpenseData] = useState<CategoryWiseExpense[]>([]);
  const [gstSummary, setGstSummary] = useState<{
    totalTaxable: number;
    totalCgst: number;
    totalSgst: number;
    totalIgst: number;
    totalTax: number;
  } | null>(null);

  const fetchData = useCallback(async () => {
    try {
      const [
        summaryData,
        monthly,
        customers,
        expenses,
        products,
        gst,
      ] = await Promise.all([
        getRevenueSummary(),
        getMonthlyRevenue(new Date().getFullYear()),
        getCustomerReceivables(),
        getCategoryWiseExpenses(),
        getTopProducts(10),
        getGstSummary(),
      ]);

      setSummary(summaryData);
      setMonthlyData(monthly);
      setTopCustomers(customers);
      setExpenseData(expenses);
      setTopProducts(products);
      setGstSummary(gst);
    } catch {}
  }, [getRevenueSummary, getMonthlyRevenue, getCustomerReceivables, getCategoryWiseExpenses, getTopProducts, getGstSummary]);

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

  const formatCurrency = (amount: number) =>
    `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const renderRevenueDetail = () => (
    <>
      {summary && (
        <View style={styles.statsGrid}>
          <View style={styles.statWrapper}>
            <StatCard
              icon="cash-multiple"
              value={formatCurrency(summary.totalRevenue)}
              label="Total Revenue"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              icon="cash-check"
              value={formatCurrency(summary.totalPaid)}
              label="Total Paid"
              color={theme.colors.success}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              icon="clock-outline"
              value={formatCurrency(summary.totalPending)}
              label="Pending"
              color={theme.colors.warning}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              icon="alert-circle-outline"
              value={formatCurrency(summary.totalOverdue)}
              label="Overdue"
              color={theme.colors.error}
            />
          </View>
        </View>
      )}

      <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
          Monthly Revenue Trend
        </AppText>
        {monthlyData.length > 0 ? (
          <LineChart
            data={monthlyData.map((m) => ({ label: m.month, value: m.revenue }))}
            lineColor={theme.colors.primary}
            height={220}
          />
        ) : (
          <View style={styles.emptyChart}>
            <AppText variant="bodySmall" color="textTertiary">
              No data available
            </AppText>
          </View>
        )}
      </Surface>

      {monthlyData.length > 0 && (
        <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
            Monthly Expenses
          </AppText>
          <BarChart
            data={monthlyData.map((m) => ({ label: m.month, value: m.expenses }))}
            barColor={theme.colors.error}
            height={200}
          />
        </Surface>
      )}

      <Surface style={[styles.dataCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
          Monthly Summary
        </AppText>
        <View style={styles.tableHeader}>
          <AppText variant="labelMedium" color="textSecondary" style={styles.tableCol}>
            Month
          </AppText>
          <AppText variant="labelMedium" color="textSecondary" style={styles.tableCol}>
            Revenue
          </AppText>
          <AppText variant="labelMedium" color="textSecondary" style={styles.tableCol}>
            Expenses
          </AppText>
          <AppText variant="labelMedium" color="textSecondary" style={styles.tableColRight}>
            Profit
          </AppText>
        </View>
        {monthlyData.map((month, index) => (
          <View
            key={month.month}
            style={[
              styles.tableRow,
              index < monthlyData.length - 1 && {
                borderBottomWidth: StyleSheet.hairlineWidth,
                borderBottomColor: theme.colors.divider,
              },
            ]}
          >
            <AppText variant="bodyMedium" color="textPrimary" style={styles.tableCol}>
              {month.month}
            </AppText>
            <AppText variant="bodyMedium" color="textPrimary" style={styles.tableCol}>
              {formatCurrency(month.revenue)}
            </AppText>
            <AppText variant="bodyMedium" color="textPrimary" style={styles.tableCol}>
              {formatCurrency(month.expenses)}
            </AppText>
            <AppText
              variant="bodyMedium"
              color={month.profit >= 0 ? 'success' : 'error'}
              style={styles.tableColRight}
            >
              {formatCurrency(month.profit)}
            </AppText>
          </View>
        ))}
      </Surface>
    </>
  );

  const renderCustomerDetail = () => (
    <>
      {topCustomers.length > 0 && (
        <Surface style={[styles.dataCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
            Customer Receivables
          </AppText>
          <View style={styles.tableHeader}>
            <AppText variant="labelMedium" color="textSecondary" style={styles.tableColLarge}>
              Customer
            </AppText>
            <AppText variant="labelMedium" color="textSecondary" style={styles.tableCol}>
              Invoiced
            </AppText>
            <AppText variant="labelMedium" color="textSecondary" style={styles.tableColRight}>
              Outstanding
            </AppText>
          </View>
          {topCustomers.map((customer, index) => (
            <View
              key={customer.customerId}
              style={[
                styles.tableRow,
                index < topCustomers.length - 1 && {
                  borderBottomWidth: StyleSheet.hairlineWidth,
                  borderBottomColor: theme.colors.divider,
                },
              ]}
            >
              <AppText
                variant="bodyMedium"
                color="textPrimary"
                style={styles.tableColLarge}
                numberOfLines={1}
              >
                {customer.customerName}
              </AppText>
              <AppText variant="bodyMedium" color="textPrimary" style={styles.tableCol}>
                {formatCurrency(customer.totalInvoiced)}
              </AppText>
              <AppText
                variant="bodyMedium"
                color={customer.outstanding > 0 ? 'error' : 'success'}
                style={styles.tableColRight}
              >
                {formatCurrency(customer.outstanding)}
              </AppText>
            </View>
          ))}
        </Surface>
      )}

      <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
          Top Customers by Revenue
        </AppText>
        {topCustomers.length > 0 ? (
          <BarChart
            data={topCustomers.slice(0, 8).map((c) => ({
              label: c.customerName.substring(0, 8),
              value: c.totalInvoiced,
            }))}
            barColor={theme.colors.primary}
            height={200}
          />
        ) : (
          <View style={styles.emptyChart}>
            <AppText variant="bodySmall" color="textTertiary">
              No customer data available
            </AppText>
          </View>
        )}
      </Surface>
    </>
  );

  const renderExpenseDetail = () => (
    <>
      {expenseData.length > 0 && (
        <>
          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
              Expense Distribution
            </AppText>
            <View style={styles.pieContainer}>
              <PieChart
                data={expenseData.map((e) => ({
                  label: e.category,
                  value: e.total,
                }))}
                size={200}
              />
            </View>
          </Surface>

          <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
              Expense by Category
            </AppText>
            <BarChart
              data={expenseData.map((e) => ({
                label: e.category.substring(0, 8),
                value: e.total,
              }))}
              barColor={theme.colors.error}
              height={200}
            />
          </Surface>

          <Surface style={[styles.dataCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
              Expense Details
            </AppText>
            <View style={styles.tableHeader}>
              <AppText variant="labelMedium" color="textSecondary" style={styles.tableColLarge}>
                Category
              </AppText>
              <AppText variant="labelMedium" color="textSecondary" style={styles.tableCol}>
                Count
              </AppText>
              <AppText variant="labelMedium" color="textSecondary" style={styles.tableColRight}>
                Total
              </AppText>
            </View>
            {expenseData.map((expense, index) => (
              <View
                key={expense.category}
                style={[
                  styles.tableRow,
                  index < expenseData.length - 1 && {
                    borderBottomWidth: StyleSheet.hairlineWidth,
                    borderBottomColor: theme.colors.divider,
                  },
                ]}
              >
                <AppText
                  variant="bodyMedium"
                  color="textPrimary"
                  style={styles.tableColLarge}
                  numberOfLines={1}
                >
                  {expense.category}
                </AppText>
                <AppText variant="bodyMedium" color="textPrimary" style={styles.tableCol}>
                  {expense.count}
                </AppText>
                <AppText variant="bodyMedium" color="error" style={styles.tableColRight}>
                  {formatCurrency(expense.total)}
                </AppText>
              </View>
            ))}
          </Surface>
        </>
      )}
    </>
  );

  const renderGstDetail = () => (
    <>
      {gstSummary && (
        <View style={styles.statsGrid}>
          <View style={styles.statWrapper}>
            <StatCard
              icon="calculator"
              value={formatCurrency(gstSummary.totalTaxable)}
              label="Taxable Amount"
              color={theme.colors.primary}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              icon="cash"
              value={formatCurrency(gstSummary.totalTax)}
              label="Total Tax"
              color={theme.colors.warning}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              icon="alpha-c-circle"
              value={formatCurrency(gstSummary.totalCgst)}
              label="CGST"
              color={theme.colors.secondary}
            />
          </View>
          <View style={styles.statWrapper}>
            <StatCard
              icon="alpha-s-circle"
              value={formatCurrency(gstSummary.totalSgst)}
              label="SGST"
              color={theme.colors.accent}
            />
          </View>
        </View>
      )}

      <Surface style={[styles.dataCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <AppText variant="h5" color="textPrimary" style={styles.chartTitle}>
          GST Summary
        </AppText>
        {gstSummary && (
          <>
            <View style={styles.summaryRow}>
              <AppText variant="bodyMedium" color="textSecondary">
                Total Taxable Amount
              </AppText>
              <AppText variant="price" color="textPrimary">
                {formatCurrency(gstSummary.totalTaxable)}
              </AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodyMedium" color="textSecondary">
                CGST
              </AppText>
              <AppText variant="price" color="textPrimary">
                {formatCurrency(gstSummary.totalCgst)}
              </AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodyMedium" color="textSecondary">
                SGST
              </AppText>
              <AppText variant="price" color="textPrimary">
                {formatCurrency(gstSummary.totalSgst)}
              </AppText>
            </View>
            <View style={styles.summaryRow}>
              <AppText variant="bodyMedium" color="textSecondary">
                IGST
              </AppText>
              <AppText variant="price" color="textPrimary">
                {formatCurrency(gstSummary.totalIgst)}
              </AppText>
            </View>
            <View
              style={[
                styles.summaryRow,
                { borderTopWidth: 1, borderTopColor: theme.colors.divider, paddingTop: 12 },
              ]}
            >
              <AppText variant="bodyLarge" color="textPrimary" style={{ fontWeight: '600' }}>
                Total Tax Collected
              </AppText>
              <AppText variant="priceLarge" color="primary">
                {formatCurrency(gstSummary.totalTax)}
              </AppText>
            </View>
          </>
        )}
      </Surface>
    </>
  );

  const renderContent = () => {
    switch (reportType) {
      case 'revenue':
        return renderRevenueDetail();
      case 'customer':
        return renderCustomerDetail();
      case 'expense':
        return renderExpenseDetail();
      case 'gst':
        return renderGstDetail();
      default:
        return renderRevenueDetail();
    }
  };

  if (isInitialLoad) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <ScreenHeader title={title} />
        <DetailSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <ScreenHeader title={title} />
      <ScrollView
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
        {renderContent()}
        <View style={{ height: 32 }} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
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
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  chartTitle: {
    marginBottom: 12,
  },
  emptyChart: {
    height: 180,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pieContainer: {
    alignItems: 'center',
  },
  dataCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
    marginBottom: 4,
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  tableCol: {
    flex: 1,
  },
  tableColLarge: {
    flex: 1.5,
  },
  tableColRight: {
    flex: 1,
    textAlign: 'right',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  skeletonCard: {
    width: '47.5%',
    padding: 16,
    borderRadius: 16,
  },
  skeletonChart: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonTable: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  skeletonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    gap: 16,
  },
});
