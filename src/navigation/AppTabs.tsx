import React from 'react';
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';

// Import Stacks
import { ClientStack } from './ClientStack'; // Assuming ClientStackParamList is not directly needed here
import { InventoryStack } from './InventoryStack';
import { InvoiceStack } from './InvoiceStack';
import { ExpenseStack } from './ExpenseStack'; // Added ExpenseStack import
import DashboardScreen from '@/screens/app/DashboardScreen'; // Uncommented and corrected import
// import { ReportsScreen } from '@/screens/app/ReportsScreen'; // Reports still commented out
import { SettingsStack } from './SettingsStack'; // Uncommented and corrected import (named)

// Placeholder/Example for other stacks/screens if needed
// import { DashboardScreen } from '@/screens/app/DashboardScreen';
// import { ReportsScreen } from '@/screens/app/ReportsScreen';
// import { SettingsStack } from './SettingsStack';

// Define ParamLists for each stack that might be needed by the Tab Navigator directly
// If the stacks manage their own params internally and the tab only navigates to the stack itself,
// explicit param lists here might not be necessary beyond `undefined` or NavigatorScreenParams.
// For simplicity, if AppTabs only routes to the *Stack* and not specific screens *within* the stack,
// we can simplify. However, if we need to pass params *to* the stack or its initial screen from AppTabs,
// then we'd use NavigatorScreenParams<ClientStackParamList> etc.

export type AppTabsParamList = {
  [ROUTES.DASHBOARD]: undefined; // Uncommented
  [ROUTES.CLIENTS_STACK]: undefined; // Navigates to the ClientStack navigator
  [ROUTES.INVENTORY_STACK]: undefined; // Navigates to the InventoryStack navigator
  [ROUTES.INVOICES_STACK]: undefined; // Navigates to the InvoiceStack navigator
  [ROUTES.EXPENSES_STACK]: undefined; // Navigates to the ExpenseStack navigator
  // [ROUTES.REPORTS]: undefined; // Reports still commented out
  [ROUTES.SETTINGS_STACK]: undefined; // Uncommented
};

const Tab = createMaterialTopTabNavigator<AppTabsParamList>();

const AppTabs: React.FC = () => {
  const insets = useSafeAreaInsets();

  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarLabelStyle: { fontSize: 10, fontWeight: '500', textTransform: 'uppercase', textAlign: 'center' },
    tabBarItemStyle: { flex: 1 }, // Ensure tabs take equal width
    tabBarIndicatorStyle: { backgroundColor: colors.primary },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.surface,
      paddingTop: insets.top, // Adjust for status bar
    },
    tabBarScrollEnabled: false, // Ensure all tabs are visible
  };

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.DASHBOARD} // Changed default to Dashboard
      screenOptions={({ route }) => ({
        ...screenOptions, // Apply the base screenOptions
        tabBarIcon: ({ focused, color }) => {
          // Simplified icon logic for debugging
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline'; // Default icon
          if (route.name === ROUTES.DASHBOARD) {
            iconName = focused ? 'speedometer' : 'speedometer-outline';
          } else if (route.name === ROUTES.CLIENTS_STACK) {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === ROUTES.INVENTORY_STACK) {
            iconName = focused ? 'cube' : 'cube-outline';
          } else if (route.name === ROUTES.INVOICES_STACK) {
            iconName = focused ? 'document-text' : 'document-text-outline';
          } else if (route.name === ROUTES.EXPENSES_STACK) {
            iconName = focused ? 'wallet' : 'wallet-outline';
          } else if (route.name === ROUTES.SETTINGS_STACK) {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          return <Ionicons name={iconName} size={22} color={color} />;
        },
      })}
    >
      <Tab.Screen name={ROUTES.DASHBOARD} component={DashboardScreen} options={{ title: 'Dashboard' }} />
      <Tab.Screen name={ROUTES.CLIENTS_STACK} component={ClientStack} options={{ title: 'Clients' }} />
      <Tab.Screen name={ROUTES.INVENTORY_STACK} component={InventoryStack} options={{ title: 'Inventory' }} />
      <Tab.Screen name={ROUTES.INVOICES_STACK} component={InvoiceStack} options={{ title: 'Invoices' }} />
      <Tab.Screen name={ROUTES.EXPENSES_STACK} component={ExpenseStack} options={{ title: 'Expenses' }} />
      <Tab.Screen name={ROUTES.SETTINGS_STACK} component={SettingsStack} options={{ title: 'Settings' }} />
    </Tab.Navigator>
  );
};

export default AppTabs; 