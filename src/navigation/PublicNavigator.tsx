import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import LandingScreen from '@/screens/public/LandingScreen';

export type PublicStackParamList = {
  [ROUTES.LANDING]: undefined;
};

const Stack = createNativeStackNavigator<PublicStackParamList>();

const PublicNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LANDING} component={LandingScreen} />
    </Stack.Navigator>
  );
};

export default PublicNavigator; 