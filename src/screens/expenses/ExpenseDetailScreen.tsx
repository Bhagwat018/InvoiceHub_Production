import React from 'react';
import {View, StyleSheet, ScrollView, TouchableOpacity, Alert} from 'react-native';
import {useTheme, Text, Card, Divider, Button} from 'react-native-paper';
import {SafeAreaView} from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import {useNavigation, useRoute} from '@react-navigation/native';

export default function ExpenseDetailScreen() {
  const theme = useTheme();
  const navigation = useNavigation();
  const route = useRoute<any>();

  const expense = route.params?.expense || {
    id: '1',
    amount: 2500,
    description: 'Office supplies purchase',
    category: {name: 'Office', icon: 'office-building', color: '#1E88E5'},
    date: '2026-07-14',
    paymentMode: 'Cash',
    vendorName: 'Stationery Mart',
    invoiceNumber: 'EXP-001',
    isRecurring: false,
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: 16,
    },
    headerLeft: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    backButton: {
      marginRight: 8,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.colors.onBackground,
    },
    content: {
      flex: 1,
      padding: 16,
    },
    amountCard: {
      borderRadius: 16,
      backgroundColor: theme.colors.errorContainer,
      padding: 24,
      alignItems: 'center',
      marginBottom: 16,
    },
    amountLabel: {
      fontSize: 14,
      color: theme.colors.onErrorContainer,
      opacity: 0.7,
    },
    amount: {
      fontSize: 36,
      fontWeight: 'bold',
      color: theme.colors.onErrorContainer,
      marginTop: 4,
    },
    card: {
      marginBottom: 16,
      borderRadius: 12,
      backgroundColor: theme.colors.surface,
    },
    cardTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.onSurface,
      marginBottom: 8,
    },
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 10,
    },
    rowLabel: {
      fontSize: 14,
      color: theme.colors.onSurfaceVariant,
    },
    rowValue: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.onSurface,
    },
    categoryBadge: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 20,
      backgroundColor: expense.category?.color + '20',
    },
    categoryText: {
      fontSize: 14,
      fontWeight: '500',
      color: expense.category?.color || theme.colors.primary,
    },
    actionButtons: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
    },
    actionButton: {
      flex: 1,
      borderRadius: 8,
    },
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}>
            <Icon name="arrow-left" size={24} color={theme.colors.onBackground} />
          </TouchableOpacity>
          <Text style={styles.title}>Expense Details</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate('ExpenseEdit' as never, {expenseId: expense.id} as never)}>
          <Icon name="pencil" size={22} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Amount */}
        <View style={styles.amountCard}>
          <Text style={styles.amountLabel}>Amount Spent</Text>
          <Text style={styles.amount}>₹{expense.amount.toLocaleString()}</Text>
        </View>

        {/* Category & Date */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Details</Text>
            <Divider style={{marginBottom: 8}} />
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Category</Text>
              <View style={styles.categoryBadge}>
                <Icon
                  name={expense.category?.icon || 'tag'}
                  size={16}
                  color={expense.category?.color || theme.colors.primary}
                />
                <Text style={styles.categoryText}>{expense.category?.name || 'Uncategorized'}</Text>
              </View>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Date</Text>
              <Text style={styles.rowValue}>{expense.date}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.rowLabel}>Payment Mode</Text>
              <Text style={styles.rowValue}>{expense.paymentMode}</Text>
            </View>
          </Card.Content>
        </Card>

        {/* Description */}
        <Card style={styles.card}>
          <Card.Content>
            <Text style={styles.cardTitle}>Description</Text>
            <Divider style={{marginBottom: 8}} />
            <Text style={[styles.rowValue, {lineHeight: 22}]}>
              {expense.description || 'No description'}
            </Text>
          </Card.Content>
        </Card>

        {/* Vendor */}
        {expense.vendorName && (
          <Card style={styles.card}>
            <Card.Content>
              <Text style={styles.cardTitle}>Vendor</Text>
              <Divider style={{marginBottom: 8}} />
              <View style={styles.row}>
                <Text style={styles.rowLabel}>Vendor Name</Text>
                <Text style={styles.rowValue}>{expense.vendorName}</Text>
              </View>
              {expense.invoiceNumber && (
                <View style={styles.row}>
                  <Text style={styles.rowLabel}>Invoice Number</Text>
                  <Text style={styles.rowValue}>{expense.invoiceNumber}</Text>
                </View>
              )}
            </Card.Content>
          </Card>
        )}

        {/* Recurring */}
        {expense.isRecurring && (
          <Card style={styles.card}>
            <Card.Content>
              <View style={styles.row}>
                <Text style={styles.cardTitle}>Recurring Expense</Text>
                <Icon name="repeat" size={20} color={theme.colors.primary} />
              </View>
            </Card.Content>
          </Card>
        )}

        {/* Actions */}
        <View style={styles.actionButtons}>
          <Button
            mode="outlined"
            icon="pencil"
            onPress={() => {}}
            style={styles.actionButton}>
            Edit
          </Button>
          <Button
            mode="outlined"
            icon="delete"
            textColor={theme.colors.error}
            onPress={() => {
              Alert.alert('Delete', 'Are you sure?', [
                {text: 'Cancel', style: 'cancel'},
                {text: 'Delete', style: 'destructive'},
              ]);
            }}
            style={[styles.actionButton, {borderColor: theme.colors.error}]}>
            Delete
          </Button>
        </View>

        <View style={{height: 40}} />
      </ScrollView>
    </SafeAreaView>
  );
}
