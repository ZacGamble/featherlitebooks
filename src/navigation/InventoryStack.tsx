import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import { InventoryListScreen } from '@/screens/app/inventory/InventoryListScreen';
import { InventoryItemFormScreen } from '@/screens/app/inventory/InventoryItemFormScreen';
import { InventoryItemDetailScreen } from '@/screens/app/inventory/InventoryItemDetailScreen';
// import { InventoryItem } from '@/types'; // Not directly needed for param list if only using IDs

export type InventoryStackParamList = {
  [ROUTES.INVENTORY_LIST]: undefined;
  [ROUTES.INVENTORY_ITEM_FORM]: { itemId?: string }; // Optional itemId for editing
  [ROUTES.INVENTORY_ITEM_DETAIL]: { itemId: string }; // Required itemId for viewing details
  // Add other inventory-related screens here if needed
};

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export const InventoryStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Headers will be handled by individual screens or a main app header
      }}
      initialRouteName={ROUTES.INVENTORY_LIST}
    >
      <Stack.Screen name={ROUTES.INVENTORY_LIST} component={InventoryListScreen} />
      <Stack.Screen name={ROUTES.INVENTORY_ITEM_FORM} component={InventoryItemFormScreen} />
      <Stack.Screen name={ROUTES.INVENTORY_ITEM_DETAIL} component={InventoryItemDetailScreen} />
    </Stack.Navigator>
  );
}; 