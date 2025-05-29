import React from 'react';
// import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'; // Changed
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs'; // Added
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import DashboardScreen from '@/screens/app/DashboardScreen';
import ReportsScreen from '@/screens/app/ReportsScreen';
import SettingsScreen from '@/screens/app/SettingsScreen';
import ProfileScreen from '@/screens/app/ProfileScreen';

import InventoryListScreen from '@/screens/app/inventory/InventoryListScreen';
import InventoryFormScreen from '@/screens/app/inventory/InventoryFormScreen';
import InventoryDetailScreen from '@/screens/app/inventory/InventoryDetailScreen';

import { InvoiceListScreen, InvoiceDetailScreen, InvoiceFormScreen } from '@/screens/app/invoices';
import ExpenseListScreen from '@/screens/app/expenses/ExpenseListScreen';
import ExpenseDetailScreen from '@/screens/app/expenses/ExpenseDetailScreen';
import ExpenseFormScreen from '@/screens/app/expenses/ExpenseFormScreen';

import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { ClientListScreen, ClientStackParamList } from '@/screens/app/clients/ClientListScreen';
import { ClientDetailScreen } from '@/screens/app/clients/ClientDetailScreen';
import { ClientFormScreen } from '@/screens/app/clients/ClientFormScreen';
import { NavigatorScreenParams } from '@react-navigation/native';

const defaultStackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

// Define ParamList for each stack within the tabs
export type InventoryStackParamList = {
  [ROUTES.INVENTORY_LIST]: undefined;
  [ROUTES.INVENTORY_FORM]: { itemId?: string };
  [ROUTES.INVENTORY_DETAIL]: { itemId: string };
};
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const InventoryStackNavigator = () => (
  <InventoryStack.Navigator screenOptions={defaultStackScreenOptions}>
    <InventoryStack.Screen name={ROUTES.INVENTORY_LIST} component={InventoryListScreen} />
    <InventoryStack.Screen name={ROUTES.INVENTORY_FORM} component={InventoryFormScreen} />
    <InventoryStack.Screen name={ROUTES.INVENTORY_DETAIL} component={InventoryDetailScreen} />
  </InventoryStack.Navigator>
);

export type InvoiceStackParamList = {
  [ROUTES.INVOICE_LIST]: undefined;
  [ROUTES.INVOICE_FORM]: { invoiceId?: string };
  [ROUTES.INVOICE_DETAIL]: { invoiceId: string };
};
const InvoiceStack = createNativeStackNavigator<InvoiceStackParamList>();
const InvoiceStackNavigator = () => (
  <InvoiceStack.Navigator screenOptions={defaultStackScreenOptions}>
    <InvoiceStack.Screen name={ROUTES.INVOICE_LIST} component={InvoiceListScreen} />
    <InvoiceStack.Screen name={ROUTES.INVOICE_FORM} component={InvoiceFormScreen} />
    <InvoiceStack.Screen name={ROUTES.INVOICE_DETAIL} component={InvoiceDetailScreen} />
  </InvoiceStack.Navigator>
);

export type ExpenseStackParamList = {
  [ROUTES.EXPENSE_LIST]: undefined;
  [ROUTES.EXPENSE_DETAIL]: { expenseId: string };
  [ROUTES.EXPENSE_FORM]: { expenseId?: string };
};
const ExpenseStack = createNativeStackNavigator<ExpenseStackParamList>();
const ExpenseStackNavigator = () => (
  <ExpenseStack.Navigator screenOptions={defaultStackScreenOptions}>
    <ExpenseStack.Screen name={ROUTES.EXPENSE_LIST} component={ExpenseListScreen} />
    <ExpenseStack.Screen name={ROUTES.EXPENSE_FORM} component={ExpenseFormScreen} />
    <ExpenseStack.Screen name={ROUTES.EXPENSE_DETAIL} component={ExpenseDetailScreen} />
  </ExpenseStack.Navigator>
);

export type SettingsStackParamList = {
    [ROUTES.SETTINGS]: undefined;
    [ROUTES.PROFILE]: undefined;
};
const SettingsNavigatorStack = createNativeStackNavigator<SettingsStackParamList>();
const SettingsStackNavigator = () => (
    <SettingsNavigatorStack.Navigator screenOptions={defaultStackScreenOptions}>
        <SettingsNavigatorStack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
        <SettingsNavigatorStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} />
    </SettingsNavigatorStack.Navigator>
);

const ClientStack = createNativeStackNavigator<ClientStackParamList>();
const ClientStackNavigator = () => (
  <ClientStack.Navigator screenOptions={defaultStackScreenOptions}>
    <ClientStack.Screen name={ROUTES.CLIENT_LIST} component={ClientListScreen} />
    <ClientStack.Screen name={ROUTES.CLIENT_DETAIL} component={ClientDetailScreen} />
    <ClientStack.Screen name={ROUTES.CLIENT_FORM} component={ClientFormScreen} />
  </ClientStack.Navigator>
);

export type AppTabParamList = {
  [ROUTES.DASHBOARD]: undefined;
  [ROUTES.INVENTORY_STACK]: NavigatorScreenParams<InventoryStackParamList>;
  [ROUTES.INVOICES_STACK]: NavigatorScreenParams<InvoiceStackParamList>;
  [ROUTES.EXPENSES_STACK]: NavigatorScreenParams<ExpenseStackParamList>;
  [ROUTES.CLIENTS_STACK]: NavigatorScreenParams<ClientStackParamList>;
  [ROUTES.REPORTS]: undefined;
  [ROUTES.SETTINGS_STACK]: NavigatorScreenParams<SettingsStackParamList>;
};

// const Tab = createBottomTabNavigator<AppTabParamList>(); // Changed
const Tab = createMaterialTopTabNavigator<AppTabParamList>(); // Added

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: colors.primary || '#007AFF',
        tabBarInactiveTintColor: colors.gray || '#8E8E93',
        tabBarStyle: { backgroundColor: colors.white || '#FFFFFF' },
        tabBarScrollEnabled: false, // Changed to false to prevent scrolling
        tabBarIndicatorStyle: { backgroundColor: colors.primary || '#007AFF' },
        tabBarItemStyle: { flex: 1 }, // Changed from width: 'auto' to flex: 1
        tabBarLabelStyle: { fontSize: 10, textTransform: 'none', textAlign: 'center' }, // Added textAlign: center
        // The following might help with centering if items don't fill width
        // but MaterialTopTabNavigator might handle distribution automatically when scroll is off.
        // tabBarContentContainerStyle: { alignItems: 'center', justifyContent: 'center' } 
      }}
    >
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} options={{ tabBarLabel: 'Dashboard' }} />
      <Tab.Screen name={ROUTES.INVENTORY_STACK} component={InventoryStackNavigator} options={{ tabBarLabel: 'Inventory' }} />
      <Tab.Screen name={ROUTES.INVOICES_STACK} component={InvoiceStackNavigator} options={{ tabBarLabel: 'Invoices' }} />
      <Tab.Screen
        name={ROUTES.EXPENSES_STACK}
        component={ExpenseStackNavigator}
        options={{ tabBarLabel: 'Expenses' }}
      />
      <Tab.Screen
        name={ROUTES.CLIENTS_STACK}
        component={ClientStackNavigator}
        options={{ tabBarLabel: 'Clients' }}
      />
      <Tab.Screen name={ROUTES.REPORTS} component={ReportsScreen} options={{ tabBarLabel: 'Reports' }} />
      <Tab.Screen name={ROUTES.SETTINGS_STACK} component={SettingsStackNavigator} options={{ tabBarLabel: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default AppTabs; 