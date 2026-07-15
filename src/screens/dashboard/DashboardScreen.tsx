import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useDashboardStore } from '../../storage/stores/dashboardStore';
import { useSettingsStore } from '../../storage/stores/settingsStore';
import { useInvoices } from '../../hooks/useInvoices';
import { useReports } from '../../hooks/useReports';
import { useTheme as useAppTheme } from '../../hooks/useTheme';
import AppText from '../../components/common/AppText';
import Avatar from '../../components/common/Avatar';
import EmptyState from '../../components/common/EmptyState';
import FloatingActionButton from '../../components/common/FloatingActionButton';
import StatCard from '../../components/cards/StatCard';
import InvoiceCard from '../../components/cards/InvoiceCard';
import LineChart from '../../components/charts/LineChart';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import InvoiceSkeleton from '../../components/loading/InvoiceSkeleton';
import { CURRENCY_SYMBOL } from '../../constants';
import type { DashboardStackParamList } from '../../navigation/types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

type NavigationProp = NativeStackNavigationProp<DashboardStackParamList, 'DashboardMain'>;

interface QuickAction {
  icon: string;
  label: string;
  color: string;
  onPress: () => void;
}

function DashboardSkeleton() {
  const theme = useTheme();

  return (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <View style={styles.skeletonHeaderLeft}>
          <SkeletonLoader width={48} height={48} borderRadius={24} />
          <View style={styles.skeletonHeaderText}>
            <SkeletonLoader width={120} height={14} />
            <SkeletonLoader width={180} height={20} marginTop={6} />
          </View>
        </View>
        <SkeletonLoader width={40} height={40} borderRadius={20} />
      </View>

      <View style={styles.statsGrid}>
        {[1, 2, 3, 4].map((i) => (
          <Surface key={i} style={[styles.skeletonStatCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
            <SkeletonLoader width={40} height={40} borderRadius={12} />
            <SkeletonLoader width={80} height={22} marginTop={12} />
            <SkeletonLoader width={60} height={12} marginTop={6} />
          </Surface>
        ))}
      </View>

      <Surface style={[styles.skeletonChart, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <SkeletonLoader width={120} height={18} />
        <SkeletonLoader width="100%" height={180} marginTop={16} borderRadius={8} />
      </Surface>

      <View style={styles.skeletonQuickActions}>
        {[1, 2, 3, 4].map((i) => (
          <View key={i} style={styles.skeletonQuickAction}>
            <SkeletonLoader width={52} height={52} borderRadius={26} />
            <SkeletonLoader width={50} height={10} marginTop={8} />
          </View>
        ))}
      </View>

      {[1, 2, 3].map((i) => (
        <InvoiceSkeleton key={i} />
      ))}
    </View>
  );
}

export default function DashboardScreen() {
  const theme = useTheme();
  const { colors, spacing } = useAppTheme();
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const business = useSettingsStore((s) => s.business);
  const stats = useDashboardStore((s) => s.stats);
  const storeLoading = useDashboardStore((s) => s.isLoading);
  const { invoices, isLoading: invoicesLoading } = useInvoices();
  const { refreshDashboard, isLoading: reportsLoading } = useReports();
  const [refreshing, setRefreshing] = useState(false);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  const isLoading = storeLoading || reportsLoading;

  useEffect(() => {
    if (isInitialLoad) {
      refreshDashboard()
        .catch(() => {})
        .finally(() => setIsInitialLoad(false));
    }
  }, [isInitialLoad, refreshDashboard]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refreshDashboard();
    } catch {}
    setRefreshing(false);
  }, [refreshDashboard]);

  const recentInvoices = invoices.slice(0, 5);

  const revenueTrend = stats.totalRevenue > 0
    ? { value: 12, isPositive: true }
    : undefined;

  const pendingTrend = stats.totalPending > 0
    ? { value: 5, isPositive: false }
    : undefined;

  const todaySales = recentInvoices
    .filter((inv) => {
      const today = new Date().toDateString();
      return new Date(inv.createdAt).toDateString() === today;
    })
    .reduce((sum, inv) => sum + inv.totalAmount, 0);

  const monthlyRevenue = stats.monthlyRevenue.length > 0
    ? stats.monthlyRevenue.reduce((sum, m) => sum + m.amount, 0)
    : stats.totalRevenue;

  const chartData = stats.monthlyRevenue.length > 0
    ? stats.monthlyRevenue.slice(-7).map((m) => ({
        label: m.month,
        value: m.amount,
      }))
    : [
        { label: 'Mon', value: 0 },
        { label: 'Tue', value: 0 },
        { label: 'Wed', value: 0 },
        { label: 'Thu', value: 0 },
        { label: 'Fri', value: 0 },
        { label: 'Sat', value: 0 },
        { label: 'Sun', value: 0 },
      ];

  const quickActions: QuickAction[] = [
    {
      icon: 'file-plus-outline',
      label: 'Invoice',
      color: theme.colors.primary,
      onPress: () => navigation.navigate('InvoiceCreate' as any),
    },
    {
      icon: 'account-plus-outline',
      label: 'Customer',
      color: theme.colors.secondary,
      onPress: () => navigation.navigate('CustomerCreate' as any),
    },
    {
      icon: 'cash-plus',
      label: 'Expense',
      color: theme.colors.warning,
      onPress: () => navigation.navigate('ExpenseCreate' as any),
    },
    {
      icon: 'chart-box-outline',
      label: 'Reports',
      color: theme.colors.accent,
      onPress: () => navigation.navigate('Reports'),
    },
  ];

  const formatCurrency = (amount: number) => {
    return `${CURRENCY_SYMBOL}${amount.toLocaleString('en-IN')}`;
  };

  const renderHeader = () => (
    <View style={styles.headerSection}>
      <View style={styles.welcomeRow}>
        <View style={styles.welcomeLeft}>
          <Avatar
            name={business.name || 'Business'}
            image={null}
            size="medium"
          />
          <View style={styles.welcomeText}>
            <AppText variant="bodySmall" color="textTertiary">
              Welcome back
            </AppText>
            <AppText variant="h4" color="textPrimary" numberOfLines={1}>
              {business.name || 'Your Business'}
            </AppText>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => {}}
          style={[styles.notificationBtn, { backgroundColor: theme.colors.surfaceVariant }]}
        >
          <Icon name="bell-outline" size={22} color={theme.colors.textSecondary} />
        </TouchableOpacity>
      </View>

      <View style={styles.statsGrid}>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon="cash-multiple"
            value={formatCurrency(stats.totalRevenue)}
            label="Total Revenue"
            trend={revenueTrend}
            color={theme.colors.primary}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon="clock-outline"
            value={formatCurrency(stats.totalPending)}
            label="Pending Amount"
            trend={pendingTrend}
            color={theme.colors.warning}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon="calendar-today"
            value={formatCurrency(todaySales)}
            label="Today's Sales"
            color={theme.colors.secondary}
          />
        </View>
        <View style={styles.statCardWrapper}>
          <StatCard
            icon="chart-line"
            value={formatCurrency(monthlyRevenue)}
            label="Monthly Revenue"
            color={theme.colors.accent}
          />
        </View>
      </View>

      <Surface style={[styles.chartCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
        <View style={styles.chartHeader}>
          <AppText variant="h5" color="textPrimary">
            Revenue Overview
          </AppText>
          <AppText variant="caption" color="textTertiary">
            Last 7 periods
          </AppText>
        </View>
        <LineChart
          data={chartData}
          lineColor={theme.colors.primary}
          dotColor={theme.colors.primary}
          height={180}
        />
      </Surface>

      <View style={styles.quickActionsHeader}>
        <AppText variant="h5" color="textPrimary">
          Quick Actions
        </AppText>
      </View>
      <View style={styles.quickActionsGrid}>
        {quickActions.map((action) => (
          <TouchableOpacity
            key={action.label}
            style={styles.quickActionItem}
            onPress={action.onPress}
            activeOpacity={0.7}
          >
            <View
              style={[
                styles.quickActionIcon,
                { backgroundColor: `${action.color}15` },
              ]}
            >
              <Icon name={action.icon} size={24} color={action.color} />
            </View>
            <AppText variant="caption" color="textSecondary" align="center">
              {action.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.sectionHeader}>
        <AppText variant="h5" color="textPrimary">
          Recent Invoices
        </AppText>
        <TouchableOpacity onPress={() => {}}>
          <AppText variant="labelMedium" color="primary">
            View All
          </AppText>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <EmptyState
      icon="file-document-outline"
      title="No Invoices Yet"
      subtitle="Create your first invoice to get started with InvoiceHub"
      actionLabel="Create Invoice"
      onAction={() => navigation.navigate('InvoiceCreate' as any)}
    />
  );

  const renderInvoiceItem = ({ item }: { item: any }) => (
    <InvoiceCard
      invoice={item}
      onPress={() => navigation.navigate('InvoiceDetail' as any, { invoiceId: item.id })}
    />
  );

  if (isInitialLoad && (invoicesLoading || storeLoading)) {
    return (
      <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
        <DashboardSkeleton />
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background }]}>
      <FlatList
        data={recentInvoices}
        keyExtractor={(item) => item.id}
        renderItem={renderInvoiceItem}
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

      <FloatingActionButton
        icon="plus"
        onPress={() => navigation.navigate('InvoiceCreate' as any)}
        animated
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
  headerSection: {
    marginBottom: 8,
  },
  welcomeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  welcomeLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  welcomeText: {
    marginLeft: 12,
    flex: 1,
  },
  notificationBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  statCardWrapper: {
    width: '47.5%',
  },
  chartCard: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  chartHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionsHeader: {
    marginBottom: 12,
  },
  quickActionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  quickActionItem: {
    alignItems: 'center',
    width: '22%',
  },
  quickActionIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  skeletonHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  skeletonHeaderText: {
    marginLeft: 12,
    gap: 4,
  },
  skeletonStatCard: {
    width: '47.5%',
    padding: 16,
    borderRadius: 16,
  },
  skeletonChart: {
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  skeletonQuickActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  skeletonQuickAction: {
    alignItems: 'center',
  },
});
