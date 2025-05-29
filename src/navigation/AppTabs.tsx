import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
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

import { Ionicons } from '@expo/vector-icons'; // Example, choose your icon library
import { colors } from '@/constants/colors'; // Assuming you have a colors constant file
import { ClientListScreen, ClientStackParamList } from '@/screens/app/clients/ClientListScreen'; // Import ClientStackParamList from ClientListScreen
import { ClientDetailScreen } from '@/screens/app/clients/ClientDetailScreen'; // Corrected import
import { ClientFormScreen } from '@/screens/app/clients/ClientFormScreen'; // Corrected import

// Define ParamList for each stack within the tabs
export type InventoryStackParamList = {
  [ROUTES.INVENTORY_LIST]: undefined;
  [ROUTES.INVENTORY_FORM]: { itemId?: string }; // itemId is optional for edit, undefined for add
  [ROUTES.INVENTORY_DETAIL]: { itemId: string };
};
const InventoryStack = createNativeStackNavigator<InventoryStackParamList>();
const InventoryStackNavigator = () => (
  <InventoryStack.Navigator screenOptions={{ headerShown: true, headerTitle: 'Inventory' }}>
    <InventoryStack.Screen name={ROUTES.INVENTORY_LIST} component={InventoryListScreen} options={{ headerTitle: 'Inventory Items'}} />
    <InventoryStack.Screen name={ROUTES.INVENTORY_FORM} component={InventoryFormScreen} options={({ route }) => ({ headerTitle: route.params?.itemId ? 'Edit Item' : 'Add Item' })} />
    <InventoryStack.Screen name={ROUTES.INVENTORY_DETAIL} component={InventoryDetailScreen} options={{ headerTitle: 'Item Details'}}/>
  </InventoryStack.Navigator>
);

export type InvoiceStackParamList = {
  [ROUTES.INVOICE_LIST]: undefined;
  [ROUTES.INVOICE_FORM]: { invoiceId?: string };
  [ROUTES.INVOICE_DETAIL]: { invoiceId: string };
};
const InvoiceStack = createNativeStackNavigator<InvoiceStackParamList>();
const InvoiceStackNavigator = () => (
  <InvoiceStack.Navigator screenOptions={{ headerShown: true, headerTitle: 'Invoices' }}>
    <InvoiceStack.Screen name={ROUTES.INVOICE_LIST} component={InvoiceListScreen} options={{ headerTitle: 'All Invoices'}} />
    <InvoiceStack.Screen name={ROUTES.INVOICE_FORM} component={InvoiceFormScreen} options={({ route }) => ({ headerTitle: route.params?.invoiceId ? 'Edit Invoice' : 'New Invoice' })} />
    <InvoiceStack.Screen name={ROUTES.INVOICE_DETAIL} component={InvoiceDetailScreen} options={{ headerTitle: 'Invoice Details'}} />
  </InvoiceStack.Navigator>
);

export type ExpenseStackParamList = {
  [ROUTES.EXPENSE_LIST]: undefined;
  [ROUTES.EXPENSE_DETAIL]: { expenseId: string };
  [ROUTES.EXPENSE_FORM]: { expenseId?: string };
};
const ExpenseStack = createNativeStackNavigator<ExpenseStackParamList>();
const ExpenseStackNavigator = () => (
  <ExpenseStack.Navigator screenOptions={{ headerShown: true, headerTitle: 'Expenses' }}>
    <ExpenseStack.Screen name={ROUTES.EXPENSE_LIST} component={ExpenseListScreen} options={{ headerTitle: 'All Expenses'}} />
    <ExpenseStack.Screen name={ROUTES.EXPENSE_FORM} component={ExpenseFormScreen} options={({ route }) => ({ headerTitle: route.params?.expenseId ? 'Edit Expense' : 'New Expense' })} />
    <ExpenseStack.Screen name={ROUTES.EXPENSE_DETAIL} component={ExpenseDetailScreen} options={{ headerTitle: 'Expense Details'}} />
  </ExpenseStack.Navigator>
);

export type SettingsStackParamList = {
    [ROUTES.SETTINGS]: undefined;
    [ROUTES.PROFILE]: undefined;
};
const SettingsNavigatorStack = createNativeStackNavigator<SettingsStackParamList>();
const SettingsStackNavigator = () => (
    <SettingsNavigatorStack.Navigator screenOptions={{ headerShown: true, headerTitle: 'Settings' }}>
        <SettingsNavigatorStack.Screen name={ROUTES.SETTINGS} component={SettingsScreen} />
        <SettingsNavigatorStack.Screen name={ROUTES.PROFILE} component={ProfileScreen} options={{ headerTitle: 'My Profile'}}/>
    </SettingsNavigatorStack.Navigator>
);

// Client Stack Navigator (New)
const ClientStack = createNativeStackNavigator<ClientStackParamList>();
const ClientStackNavigator = () => (
  <ClientStack.Navigator screenOptions={{ headerShown: false }}>
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
  [ROUTES.CLIENTS_STACK]: NavigatorScreenParams<ClientStackParamList>; // Added Clients stack
  [ROUTES.REPORTS]: undefined;
  [ROUTES.SETTINGS_STACK]: NavigatorScreenParams<SettingsStackParamList>;
};

const Tab = createBottomTabNavigator<AppTabParamList>();

const AppTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        // Setting headerShown to false on Tab.Navigator means stacks will manage their own headers.
        headerShown: false, 
        tabBarActiveTintColor: colors.primary || '#007AFF', // Fallback color
        tabBarInactiveTintColor: colors.gray || '#8E8E93', // Fallback color
        tabBarStyle: { backgroundColor: colors.white || '#FFFFFF' }, // Optional: customize tab bar bg
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'alert-circle'; // Default icon

          if (route.name === ROUTES.DASHBOARD) {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === ROUTES.INVENTORY_STACK) {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === ROUTES.INVOICES_STACK) {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === ROUTES.EXPENSES_STACK) {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === ROUTES.REPORTS) {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === ROUTES.SETTINGS_STACK) {
            iconName = focused ? 'settings' : 'settings-outline';
          } else if (route.name === ROUTES.CLIENTS_STACK) {
            iconName = focused ? 'people' : 'people-outline';
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} options={{ headerTitle: 'Dashboard', headerShown: true }} />
      <Tab.Screen name={ROUTES.INVENTORY_STACK} component={InventoryStackNavigator} options={{ title: 'Inventory' }} />
      <Tab.Screen name={ROUTES.INVOICES_STACK} component={InvoiceStackNavigator} options={{ title: 'Invoices' }} />
      <Tab.Screen
        name={ROUTES.EXPENSES_STACK}
        component={ExpenseStackNavigator}
        options={{
          tabBarLabel: 'Expenses',
          tabBarIcon: ({ color, size }) => <Ionicons name="cash-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen
        name={ROUTES.CLIENTS_STACK}
        component={ClientStackNavigator}
        options={{
          tabBarLabel: 'Clients',
          tabBarIcon: ({ color, size }) => <Ionicons name="people-outline" color={color} size={size} />,
        }}
      />
      <Tab.Screen name={ROUTES.REPORTS} component={ReportsScreen} options={{ headerTitle: 'Reports', headerShown: true }} />
      <Tab.Screen name={ROUTES.SETTINGS_STACK} component={SettingsStackNavigator} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default AppTabs; 