import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';
import { CURRENCY_SYMBOL, PAYMENT_MODE_LABELS } from '../../constants';
import type { Payment } from '../../types';

interface PaymentCardProps {
  payment: Payment;
  customerName?: string;
  onPress: () => void;
}

const PAYMENT_ICONS: Record<string, string> = {
  cash: 'cash',
  upi: 'cellphone',
  bank_transfer: 'bank',
  cheque: 'checkbook',
  card: 'credit-card',
  net_banking: 'laptop',
  demand_draft: 'file-document',
  credit: 'clock-outline',
  other: 'help-circle',
};

export default function PaymentCard({
  payment,
  customerName,
  onPress,
}: PaymentCardProps) {
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
        <View
          style={[
            styles.iconContainer,
            { backgroundColor: theme.colors.successContainer },
          ]}
        >
          <Icon
            name={PAYMENT_ICONS[payment.paymentMode] || 'cash'}
            size={20}
            color={theme.colors.success}
          />
        </View>
        <View style={styles.info}>
          <AppText variant="bodyMedium" color="textPrimary">
            {customerName || payment.paymentNumber}
          </AppText>
          <AppText variant="caption" color="textTertiary">
            {PAYMENT_MODE_LABELS[payment.paymentMode]} · {formatDate(payment.paymentDate)}
          </AppText>
        </View>
        <AppText variant="price" color="success">
          +{CURRENCY_SYMBOL}{payment.amount.toLocaleString('en-IN')}
        </AppText>
      </Surface>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
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
  info: {
    flex: 1,
    marginLeft: 12,
  },
});
