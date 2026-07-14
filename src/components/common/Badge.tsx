import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useTheme } from 'react-native-paper';
import AppText from './AppText';

type BadgeStatus =
  | 'paid'
  | 'pending'
  | 'overdue'
  | 'draft'
  | 'cancelled'
  | 'refunded'
  | 'partially_paid'
  | 'sent'
  | 'completed'
  | 'failed'
  | 'info'
  | 'success'
  | 'warning'
  | 'error';

interface BadgeProps {
  status: BadgeStatus;
  label?: string;
  size?: 'small' | 'medium';
}

const STATUS_CONFIG: Record<BadgeStatus, { bg: string; text: string; label: string }> = {
  paid: { bg: '#E8F5E9', text: '#2E7D32', label: 'Paid' },
  pending: { bg: '#FFF3E0', text: '#E65100', label: 'Pending' },
  overdue: { bg: '#FFEBEE', text: '#C62828', label: 'Overdue' },
  draft: { bg: '#F5F5F5', text: '#616161', label: 'Draft' },
  cancelled: { bg: '#F5F5F5', text: '#757575', label: 'Cancelled' },
  refunded: { bg: '#E0F2F1', text: '#00695C', label: 'Refunded' },
  partially_paid: { bg: '#E3F2FD', text: '#1565C0', label: 'Partial' },
  sent: { bg: '#E3F2FD', text: '#1565C0', label: 'Sent' },
  completed: { bg: '#E8F5E9', text: '#2E7D32', label: 'Completed' },
  failed: { bg: '#FFEBEE', text: '#C62828', label: 'Failed' },
  info: { bg: '#E3F2FD', text: '#1565C0', label: 'Info' },
  success: { bg: '#E8F5E9', text: '#2E7D32', label: 'Success' },
  warning: { bg: '#FFF3E0', text: '#E65100', label: 'Warning' },
  error: { bg: '#FFEBEE', text: '#C62828', label: 'Error' },
};

export default function Badge({ status, label, size = 'small' }: BadgeProps) {
  const config = STATUS_CONFIG[status];
  const displayLabel = label || config.label;

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: config.bg,
          paddingHorizontal: size === 'small' ? 8 : 12,
          paddingVertical: size === 'small' ? 2 : 4,
        },
      ]}
    >
      <AppText
        variant="labelSmall"
        style={{ color: config.text, fontSize: size === 'small' ? 10 : 12 }}
      >
        {displayLabel}
      </AppText>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
    borderRadius: 12,
  },
});
