import React from 'react';
import { createNativeStackNavigator, NativeStackNavigationOptions } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import { ClientListScreen } from '@/screens/app/clients/ClientListScreen';
import { ClientDetailScreen } from '@/screens/app/clients/ClientDetailScreen';
import { ClientFormScreen } from '@/screens/app/clients/ClientFormScreen';

export type ClientStackParamList = {
  [ROUTES.CLIENT_LIST]: undefined;
  [ROUTES.CLIENT_DETAIL]: { clientId: string };
  [ROUTES.CLIENT_FORM]: { clientId?: string };
};

const Stack = createNativeStackNavigator<ClientStackParamList>();

const defaultStackScreenOptions: NativeStackNavigationOptions = {
  headerShown: false,
};

export const ClientStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={defaultStackScreenOptions}
      initialRouteName={ROUTES.CLIENT_LIST}
    >
      <Stack.Screen name={ROUTES.CLIENT_LIST} component={ClientListScreen} />
      <Stack.Screen name={ROUTES.CLIENT_DETAIL} component={ClientDetailScreen} />
      <Stack.Screen name={ROUTES.CLIENT_FORM} component={ClientFormScreen} />
    </Stack.Navigator>
  );
}; 