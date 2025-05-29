import { ExpoConfig, ConfigContext } from 'expo/config';

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'FeatherLiteBooks',
  slug: 'feather-lite-books',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'light',
  splash: {
    image: './assets/splash.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.zac.featherlitebooks',
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
      backgroundColor: '#ffffff',
    },
    package: 'com.zac.featherlitebooks',
  },
  web: {
    favicon: './assets/favicon.png',
    bundler: 'metro',
  },
  plugins: [
    'expo-router',
    [
      'expo-font',
      {
        fonts: [
          // Add custom fonts here if needed
          // e.g. './assets/fonts/SpaceMono-Regular.ttf'
        ],
      },
    ],
  ],
  extra: {
    eas: {
      projectId: 'YOUR_EAS_PROJECT_ID', // Replace if using EAS Build
    },
    // Environment variables are typically not placed directly here for security
    // but are accessed via process.env after being loaded by babel-plugin-transform-inline-environment-variables
    // See babel.config.js and .env.example
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
  },
  owner: 'zac', // Corresponds to Author Name/Organization for Expo account
}); 