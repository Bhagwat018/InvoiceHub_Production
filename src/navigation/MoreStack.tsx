import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { MoreStackParamList } from './types';

const Stack = createNativeStackNavigator<MoreStackParamList>();

export default function MoreStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="Settings"
        component={React.lazy(() => import('../screens/settings/SettingsScreen'))}
      />
      <Stack.Screen
        name="Expenses"
        component={React.lazy(() => import('../screens/expenses/ExpenseListScreen'))}
      />
      <Stack.Screen
        name="Payments"
        component={React.lazy(() => import('../screens/payments/PaymentListScreen'))}
      />
      <Stack.Screen
        name="Ledger"
        component={React.lazy(() => import('../screens/ledger/LedgerScreen'))}
      />
      <Stack.Screen
        name="Backup"
        component={React.lazy(() => import('../screens/settings/BackupScreen'))}
      />
      <Stack.Screen
        name="BusinessProfile"
        component={React.lazy(() => import('../screens/settings/BusinessProfileScreen'))}
      />
      <Stack.Screen
        name="TaxSettings"
        component={React.lazy(() => import('../screens/settings/TaxSettingsScreen'))}
      />
      <Stack.Screen
        name="About"
        component={React.lazy(() => import('../screens/settings/AboutScreen'))}
      />
    </Stack.Navigator>
  );
}
