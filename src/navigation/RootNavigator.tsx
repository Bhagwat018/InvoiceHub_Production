import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from 'react-native-paper';
import type { RootStackParamList } from './types';
import MainTabNavigator from './MainTabNavigator';

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function RootNavigator() {
  const theme = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        contentStyle: { backgroundColor: theme.colors.background },
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="Main" component={MainTabNavigator} />
      <Stack.Screen
        name="InvoiceDetail"
        component={React.lazy(() => import('../screens/invoices/InvoiceDetailScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="InvoiceCreate"
        component={React.lazy(() => import('../screens/invoices/InvoiceFormScreen'))}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="InvoiceEdit"
        component={React.lazy(() => import('../screens/invoices/InvoiceFormScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={React.lazy(() => import('../screens/customers/CustomerDetailScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="CustomerCreate"
        component={React.lazy(() => import('../screens/customers/CustomerFormScreen'))}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="CustomerEdit"
        component={React.lazy(() => import('../screens/customers/CustomerFormScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProductDetail"
        component={React.lazy(() => import('../screens/products/ProductDetailScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ProductCreate"
        component={React.lazy(() => import('../screens/products/ProductFormScreen'))}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ProductEdit"
        component={React.lazy(() => import('../screens/products/ProductFormScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="PaymentCreate"
        component={React.lazy(() => import('../screens/payments/PaymentFormScreen'))}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ExpenseDetail"
        component={React.lazy(() => import('../screens/expenses/ExpenseDetailScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="ExpenseCreate"
        component={React.lazy(() => import('../screens/expenses/ExpenseFormScreen'))}
        options={{ presentation: 'modal', animation: 'slide_from_bottom' }}
      />
      <Stack.Screen
        name="ExpenseEdit"
        component={React.lazy(() => import('../screens/expenses/ExpenseFormScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Reports"
        component={React.lazy(() => import('../screens/dashboard/ReportsScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Settings"
        component={React.lazy(() => import('../screens/settings/SettingsScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="BusinessProfile"
        component={React.lazy(() => import('../screens/settings/BusinessProfileScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="TaxSettings"
        component={React.lazy(() => import('../screens/settings/TaxSettingsScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="Backup"
        component={React.lazy(() => import('../screens/settings/BackupScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
      <Stack.Screen
        name="About"
        component={React.lazy(() => import('../screens/settings/AboutScreen'))}
        options={{ animation: 'slide_from_right' }}
      />
    </Stack.Navigator>
  );
}
