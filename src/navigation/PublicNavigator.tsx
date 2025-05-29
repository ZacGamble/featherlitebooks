import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import LandingScreen from '@/screens/public/LandingScreen';
// Import other public screens if you add them, e.g., AboutScreen, ContactScreen

export type PublicStackParamList = {
  [ROUTES.LANDING]: undefined;
  // Add other public screens here
};

const Stack = createNativeStackNavigator<PublicStackParamList>();

const PublicNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={ROUTES.LANDING} component={LandingScreen} />
      {/* This navigator leads to the AuthNavigator or AppNavigator 
          based on auth state, which is handled in AppNavigator.tsx */}
    </Stack.Navigator>
  );
};

export default PublicNavigator; 