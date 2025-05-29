import 'react-native-url-polyfill/auto'; // Required for Supabase to work with React Native
import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from '@/auth/AuthContext';
import AppNavigator from '@/navigation/AppNavigator';
// import * as SplashScreen from 'expo-splash-screen';
// import { useFonts } from 'expo-font'; // If you have custom fonts

// Keep the splash screen visible while we fetch resources
// SplashScreen.preventAutoHideAsync(); // Uncomment if using custom fonts or other async setup

export default function App() {
  // Example of loading custom fonts, uncomment and configure in app.config.ts & assets/fonts
  /*
  const [fontsLoaded, fontError] = useFonts({
    'YourFont-Regular': require('./src/assets/fonts/YourFont-Regular.ttf'),
    'YourFont-Bold': require('./src/assets/fonts/YourFont-Bold.ttf'),
  });

  React.useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  if (!fontsLoaded && !fontError) {
    return null; // Keep splash screen visible
  }
  */

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <AppNavigator />
        <StatusBar style="auto" />
      </AuthProvider>
    </SafeAreaProvider>
  );
} 