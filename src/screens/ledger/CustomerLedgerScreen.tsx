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
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { useCustomers } from '../../hooks/useCustomers';
import { usePayments } from '../../hooks/usePayments';
import { useInvoices } from '../../hooks/useInvoices';
import ScreenContainer from '../../components/common/ScreenContainer';
import AppText from '../../components/common/AppText';
import ScreenHeader from '../../components/headers/ScreenHeader';
import AppSelect from '../../components/inputs/AppSelect';
import EmptyState from '../../components/common/EmptyState';
import SkeletonLoader from '../../components/loading/SkeletonLoader';
import { CURRENCY_SYMBOL } from '../../constants';

interface LedgerEntry {
  id: string;
  date: Date;
  description: string;
  type: 'debit' | 'credit';
  amount: number;
  balance: number;
}

function LedgerSkeleton() {
  const theme = useTheme();
  return (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Surface key={i} style={[styles.skeletonEntry, { backgroundColor: theme.colors.surface }]} elevation={1}>
          <View style={styles.skeletonEntryContent}>
            <SkeletonLoader width={60} height={14} />
            <SkeletonLoader width={120} height={14} />
            <SkeletonLoader width={60} height={14} />
            <SkeletonLoader width={60} height={14} />
          </View>
        </Surface>
      ))}
    </View>
  );
}

export default function CustomerLedgerScreen() {
  const theme = useTheme();
  const navigation = useNavigation();

  const { customers } = useCustomers();
  const { payments } = usePayments();
  const { invoices } = useInvoices();

  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [refreshing, setRefreshing] = useState(false);

  const customerOptions = customers.map((c) => ({
    label: c.name,
    value: c.id,
  }));

  const customerInvoices = useMemo(() => {
    if (!selectedCustomerId) return [];
    return invoices.filter((inv) => inv.customer?.id === selectedCustomerId);
  }, [invoices, selectedCustomerId]);

  const customerPayments = useMemo(() => {
    if (!selectedCustomerId) return [];
    return payments.filter((p) => p.customer?.id === selectedCustomerId);
  }, [payments, selectedCustomerId]);

  const ledgerEntries = useMemo((): LedgerEntry[] => {
    if (!selectedCustomerId) return [];

    const entries: LedgerEntry[] = [];

    customerInvoices.forEach((inv) => {
      entries.push({
        id: `inv-${inv.id}`,
        date: new Date(inv.invoiceDate),
        description: `Invoice ${inv.invoiceNumber}`,
        type: 'debit',
        amount: inv.totalAmount,
        balance: 0,
      });
    });

    customerPayments.forEach((p) => {
      entries.push({
        id: `pay-${p.id}`,
        date: new Date(p.paymentDate),
        description: `Payment received (${p.paymentNumber})`,
        type: 'credit',
        amount: p.amount,
        balance: 0,
      });
    });

    entries.sort((a, b) => a.date.getTime() - b.date.getTime());

    let runningBalance = 0;
    entries.forEach((entry) => {
      if (entry.type === 'debit') {
        runningBalance += entry.amount;
      } else {
        runningBalance -= entry.amount;
      }
      entry.balance = runningBalance;
    });

    return entries;
  }, [customerInvoices, customerPayments, selectedCustomerId]);

  const openingBalance = useMemo(() => {
    if (ledgerEntries.length === 0) return 0;
    const first = ledgerEntries[0];
    return first.type === 'debit' ? -first.amount : first.amount;
  }, [ledgerEntries]);

  const closingBalance = useMemo(() => {
    if (ledgerEntries.length === 0) return 0;
    return ledgerEntries[ledgerEntries.length - 1].balance;
  }, [ledgerEntries]);

  const totalDebit = useMemo(
    () => ledgerEntries.filter((e) => e.type === 'debit').reduce((s, e) => s + e.amount, 0),
    [ledgerEntries]
  );

  const totalCredit = useMemo(
    () => ledgerEntries.filter((e) => e.type === 'credit').reduce((s, e) => s + e.amount, 0),
    [ledgerEntries]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  }, []);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });

  const renderEntryItem = ({ item, index }: { item: LedgerEntry; index: number }) => (
    <Surface style={[styles.entryRow, { backgroundColor: theme.colors.surface }]} elevation={1}>
      <AppText variant="caption" color="textTertiary" style={styles.dateCell}>
        {formatDate(item.date)}
      </AppText>
      <View style={styles.descriptionCell}>
        <View
          style={[
            styles.typeIndicator,
            {
              backgroundColor: item.type === 'debit' ? theme.colors.errorContainer : theme.colors.successContainer,
            },
          ]}
        />
        <AppText variant="bodySmall" color="textPrimary" numberOfLines={1}>
          {item.description}
        </AppText>
      </View>
      <AppText
        variant="bodySmall"
        color={item.type === 'debit' ? 'error' : 'textDisabled'}
        style={styles.amountCell}
      >
        {item.type === 'debit' ? `${CURRENCY_SYMBOL}${item.amount.toLocaleString('en-IN')}` : ''}
      </AppText>
      <AppText
        variant="bodySmall"
        color={item.type === 'credit' ? 'success' : 'textDisabled'}
        style={styles.amountCell}
      >
        {item.type === 'credit' ? `${CURRENCY_SYMBOL}${item.amount.toLocaleString('en-IN')}` : ''}
      </AppText>
      <AppText variant="labelMedium" color="textPrimary" style={styles.balanceCell}>
        {CURRENCY_SYMBOL}{item.balance.toLocaleString('en-IN')}
      </AppText>
    </Surface>
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <AppSelect
        label="Customer"
        value={selectedCustomerId}
        options={customerOptions}
        placeholder="Select customer to view ledger"
        onSelect={setSelectedCustomerId}
      />

      {selectedCustomerId && (
        <>
          <View style={styles.summaryCards}>
            <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <AppText variant="caption" color="textTertiary">Total Invoiced</AppText>
              <AppText variant="price" color="error">
                {CURRENCY_SYMBOL}{totalDebit.toLocaleString('en-IN')}
              </AppText>
            </Surface>
            <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <AppText variant="caption" color="textTertiary">Total Paid</AppText>
              <AppText variant="price" color="success">
                {CURRENCY_SYMBOL}{totalCredit.toLocaleString('en-IN')}
              </AppText>
            </Surface>
            <Surface style={[styles.summaryCard, { backgroundColor: theme.colors.surface }]} elevation={1}>
              <AppText variant="caption" color="textTertiary">Balance</AppText>
              <AppText variant="price" color={closingBalance > 0 ? 'error' : 'success'}>
                {CURRENCY_SYMBOL}{Math.abs(closingBalance).toLocaleString('en-IN')}
              </AppText>
            </Surface>
          </View>

          <View style={[styles.tableHeader, { borderBottomColor: theme.colors.border }]}>
            <AppText variant="labelSmall" color="textTertiary" style={styles.dateCell}>
              Date
            </AppText>
            <AppText variant="labelSmall" color="textTertiary" style={styles.descriptionCell}>
              Description
            </AppText>
            <AppText variant="labelSmall" color="textTertiary" style={styles.amountCell}>
              Debit
            </AppText>
            <AppText variant="labelSmall" color="textTertiary" style={styles.amountCell}>
              Credit
            </AppText>
            <AppText variant="labelSmall" color="textTertiary" style={styles.balanceCell}>
              Balance
            </AppText>
          </View>
        </>
      )}
    </View>
  );

  const renderEmpty = () => {
    if (!selectedCustomerId) {
      return (
        <EmptyState
          icon="book-open-variant"
          title="Customer Ledger"
          subtitle="Select a customer to view their ledger"
        />
      );
    }
    return (
      <EmptyState
        icon="book-open-variant"
        title="No Entries"
        subtitle="No ledger entries found for this customer"
      />
    );
  };

  return (
    <ScreenContainer>
      <ScreenHeader title="Customer Ledger" />

      <FlatList
        data={ledgerEntries}
        keyExtractor={(item) => item.id}
        renderItem={renderEntryItem}
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
  summaryCards: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
  },
  summaryCard: {
    flex: 1,
    padding: 12,
    borderRadius: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    marginBottom: 4,
  },
  dateCell: {
    width: 70,
  },
  descriptionCell: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  typeIndicator: {
    width: 4,
    height: 20,
    borderRadius: 2,
    marginRight: 8,
  },
  amountCell: {
    width: 75,
    textAlign: 'right',
  },
  balanceCell: {
    width: 80,
    textAlign: 'right',
  },
  entryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    marginBottom: 6,
  },
  skeletonContainer: {
    padding: 16,
  },
  skeletonEntry: {
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  skeletonEntryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
