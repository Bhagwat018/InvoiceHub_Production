import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme, Surface } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppText from '../common/AppText';
import { CURRENCY_SYMBOL, EXPENSE_TYPE_LABELS } from '../../constants';
import type { Expense } from '../../types';

interface ExpenseCardProps {
  expense: Expense;
  onPress: () => void;
}

const EXPENSE_ICONS: Record<string, string> = {
  office_rent: 'office-building',
  utilities: 'flash',
  salaries: 'account-group',
  office_supplies: 'printer',
  travel: 'car',
  marketing: 'bullhorn',
  professional_services: 'briefcase',
  equipment: 'tools',
  software: 'laptop',
  maintenance: 'wrench',
  insurance: 'shield-check',
  taxes: 'calculator',
  miscellaneous: 'dots-horizontal',
  other: 'help-circle',
};

export default function ExpenseCard({ expense, onPress }: ExpenseCardProps) {
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
            { backgroundColor: theme.colors.warningContainer },
          ]}
        >
          <Icon
            name={EXPENSE_ICONS[expense.expenseType] || 'cash'}
            size={20}
            color={theme.colors.warning}
          />
        </View>
        <View style={styles.info}>
          <AppText variant="bodyMedium" color="textPrimary" numberOfLines={1}>
            {expense.description}
          </AppText>
          <AppText variant="caption" color="textTertiary">
            {EXPENSE_TYPE_LABELS[expense.expenseType]} · {formatDate(expense.expenseDate)}
          </AppText>
        </View>
        <AppText variant="price" color="textPrimary">
          {CURRENCY_SYMBOL}{expense.amount.toLocaleString('en-IN')}
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
