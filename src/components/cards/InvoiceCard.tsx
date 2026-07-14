import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import AppText from '../common/AppText';
import Badge from '../common/Badge';
import { CURRENCY_SYMBOL } from '../../constants';
import type { Invoice, InvoiceStatus } from '../../types';

interface InvoiceCardProps {
  invoice: Invoice;
  onPress: () => void;
}

export default function InvoiceCard({ invoice, onPress }: InvoiceCardProps) {
  const theme = useTheme();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <View style={styles.header}>
          <AppText variant="invoiceNumber" color="textPrimary">
            {invoice.invoiceNumber}
          </AppText>
          <Badge status={invoice.status as InvoiceStatus} />
        </View>
        <AppText variant="bodyMedium" color="textSecondary" style={styles.customer}>
          {invoice.customer.name}
        </AppText>
        <View style={styles.footer}>
          <AppText variant="price" color="textPrimary">
            {CURRENCY_SYMBOL}{invoice.totalAmount.toLocaleString('en-IN')}
          </AppText>
          <AppText variant="bodySmall" color="textTertiary">
            {formatDate(invoice.invoiceDate)}
          </AppText>
        </View>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  customer: {
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
