import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { CustomerStackParamList } from './types';

const Stack = createNativeStackNavigator<CustomerStackParamList>();

export default function CustomerStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="CustomerList"
        component={React.lazy(() => import('../screens/customers/CustomerListScreen'))}
      />
      <Stack.Screen
        name="CustomerDetail"
        component={React.lazy(() => import('../screens/customers/CustomerDetailScreen'))}
      />
      <Stack.Screen
        name="CustomerForm"
        component={React.lazy(() => import('../screens/customers/CustomerFormScreen'))}
        options={{ presentation: 'modal' }}
      />
    </Stack.Navigator>
  );
}
