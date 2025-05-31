import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import { InventoryListScreen } from '@/screens/app/inventory/InventoryListScreen';
import { InventoryItemFormScreen } from '@/screens/app/inventory/InventoryItemFormScreen';
import { InventoryItemDetailScreen } from '@/screens/app/inventory/InventoryItemDetailScreen';

export type InventoryStackParamList = {
  [ROUTES.INVENTORY_LIST]: undefined;
  [ROUTES.INVENTORY_ITEM_FORM]: { itemId?: string };
  [ROUTES.INVENTORY_ITEM_DETAIL]: { itemId: string };
};

const Stack = createNativeStackNavigator<InventoryStackParamList>();

export const InventoryStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={ROUTES.INVENTORY_LIST}
    >
      <Stack.Screen name={ROUTES.INVENTORY_LIST} component={InventoryListScreen} />
      <Stack.Screen name={ROUTES.INVENTORY_ITEM_FORM} component={InventoryItemFormScreen} />
      <Stack.Screen name={ROUTES.INVENTORY_ITEM_DETAIL} component={InventoryItemDetailScreen} />
    </Stack.Navigator>
  );
}; 