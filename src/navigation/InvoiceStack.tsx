import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { InvoiceStackParamList } from './types';

const Stack = createNativeStackNavigator<InvoiceStackParamList>();

export default function InvoiceStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="InvoiceList"
        component={React.lazy(() => import('../screens/invoices/InvoiceListScreen'))}
      />
      <Stack.Screen
        name="InvoiceDetail"
        component={React.lazy(() => import('../screens/invoices/InvoiceDetailScreen'))}
      />
      <Stack.Screen
        name="InvoiceForm"
        component={React.lazy(() => import('../screens/invoices/InvoiceFormScreen'))}
        options={{ presentation: 'modal' }}
      />
      <Stack.Screen
        name="InvoicePreview"
        component={React.lazy(() => import('../screens/invoices/InvoicePreviewScreen'))}
      />
    </Stack.Navigator>
  );
}
