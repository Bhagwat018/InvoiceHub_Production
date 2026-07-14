import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import type { DashboardStackParamList } from './types';

const Stack = createNativeStackNavigator<DashboardStackParamList>();

export default function DashboardStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen
        name="DashboardMain"
        component={React.lazy(() => import('../screens/dashboard/DashboardScreen'))}
      />
      <Stack.Screen
        name="Reports"
        component={React.lazy(() => import('../screens/dashboard/ReportsScreen'))}
      />
      <Stack.Screen
        name="ReportDetail"
        component={React.lazy(() => import('../screens/dashboard/ReportDetailScreen'))}
      />
    </Stack.Navigator>
  );
}
