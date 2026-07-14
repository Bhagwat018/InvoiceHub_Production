import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from './types';
import CustomTabBar from './CustomTabBar';
import DashboardStack from './DashboardStack';
import CustomerStack from './CustomerStack';
import InvoiceStack from './InvoiceStack';
import MoreStack from './MoreStack';

const Tab = createBottomTabNavigator<MainTabParamList>();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardStack}
        options={{ tabBarLabel: 'Home' }}
      />
      <Tab.Screen
        name="Customers"
        component={CustomerStack}
        options={{ tabBarLabel: 'Customers' }}
      />
      <Tab.Screen
        name="CreateInvoice"
        component={InvoiceStack}
        options={{ tabBarLabel: 'Create' }}
      />
      <Tab.Screen
        name="Invoices"
        component={InvoiceStack}
        options={{ tabBarLabel: 'Invoices' }}
      />
      <Tab.Screen
        name="More"
        component={MoreStack}
        options={{ tabBarLabel: 'More' }}
      />
    </Tab.Navigator>
  );
}
