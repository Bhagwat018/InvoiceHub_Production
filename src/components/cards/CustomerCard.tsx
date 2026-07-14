import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import AppText from '../common/AppText';
import Avatar from '../common/Avatar';
import { CURRENCY_SYMBOL } from '../../constants';
import type { Customer } from '../../types';

interface CustomerCardProps {
  customer: Customer;
  outstanding?: number;
  onPress: () => void;
}

export default function CustomerCard({
  customer,
  outstanding,
  onPress,
}: CustomerCardProps) {
  const theme = useTheme();

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Surface
        style={[styles.container, { backgroundColor: theme.colors.surface }]}
        elevation={1}
      >
        <Avatar name={customer.name} image={null} size="medium" />
        <View style={styles.info}>
          <AppText variant="bodyLarge" color="textPrimary" numberOfLines={1}>
            {customer.name}
          </AppText>
          {customer.phone && (
            <AppText variant="bodySmall" color="textSecondary">
              {customer.phone}
            </AppText>
          )}
        </View>
        {outstanding !== undefined && outstanding > 0 && (
          <View style={styles.outstandingContainer}>
            <AppText variant="caption" color="textTertiary">
              Outstanding
            </AppText>
            <AppText variant="price" color="error">
              {CURRENCY_SYMBOL}{outstanding.toLocaleString('en-IN')}
            </AppText>
          </View>
        )}
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
  info: {
    flex: 1,
    marginLeft: 12,
  },
  outstandingContainer: {
    alignItems: 'flex-end',
  },
});
