import React from 'react';
import { createMaterialTopTabNavigator, MaterialTopTabNavigationOptions } from '@react-navigation/material-top-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '@/constants/colors';
import { ROUTES } from '@/constants/routes';

import { ClientStack } from './ClientStack';
import { InventoryStack } from './InventoryStack';
import { InvoiceStack } from './InvoiceStack';
import { ExpenseStack } from './ExpenseStack';
import DashboardScreen from '@/screens/app/DashboardScreen';
import { SettingsStack } from './SettingsStack';

export type AppTabsParamList = {
  [ROUTES.DASHBOARD]: undefined;
  [ROUTES.CLIENTS_STACK]: undefined;
  [ROUTES.INVENTORY_STACK]: undefined;
  [ROUTES.INVOICES_STACK]: undefined;
  [ROUTES.EXPENSES_STACK]: undefined;
  [ROUTES.SETTINGS_STACK]: undefined;
};

const Tab = createMaterialTopTabNavigator<AppTabsParamList>();

const AppTabs: React.FC = () => {
  const insets = useSafeAreaInsets();

  const screenOptions: MaterialTopTabNavigationOptions = {
    tabBarLabelStyle: { fontSize: 9, fontWeight: '500', textTransform: 'uppercase', textAlign: 'center' },
    tabBarItemStyle: { flex: 1, paddingHorizontal: 6 },
    tabBarIndicatorStyle: { backgroundColor: colors.primary },
    tabBarActiveTintColor: colors.primary,
    tabBarInactiveTintColor: colors.textSecondary,
    tabBarStyle: {
      backgroundColor: colors.surface,
      paddingTop: insets.top,
    },
    tabBarScrollEnabled: false,
  };

  return (
    <Tab.Navigator
      initialRouteName={ROUTES.DASHBOARD}
      screenOptions={({ route }) => ({
        ...screenOptions,
        tabBarIcon: ({ focused, color }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'ellipse-outline';
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
          return <Ionicons name={iconName} size={20} color={color} />;
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