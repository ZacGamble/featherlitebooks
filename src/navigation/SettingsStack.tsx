import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import SettingsScreen from '@/screens/app/SettingsScreen';
import ProfileScreen from '@/screens/app/ProfileScreen';
import { colors } from '@/constants/colors';

export type SettingsStackParamList = {
  [ROUTES.SETTINGS]: undefined;
  [ROUTES.PROFILE]: undefined;
};

const Stack = createNativeStackNavigator<SettingsStackParamList>();

export const SettingsStack = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.background },
        headerTintColor: colors.text,
        headerTitleStyle: { fontWeight: 'bold' },
      }}
    >
      <Stack.Screen 
        name={ROUTES.SETTINGS} 
        component={SettingsScreen} 
        options={{ title: 'Settings' }} 
      />
      <Stack.Screen 
        name={ROUTES.PROFILE} 
        component={ProfileScreen} 
        options={{ title: 'Profile' }} 
      />
    </Stack.Navigator>
  );
}; 