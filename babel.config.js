module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // Needs to be listed last
      // 'expo-router/babel', // Removed as per SDK 50 deprecation
      [
        'babel-plugin-transform-inline-environment-variables',
        {
          include: ['EXPO_PUBLIC_SUPABASE_URL', 'EXPO_PUBLIC_SUPABASE_ANON_KEY'],
        },
      ],
      [
        'module-resolver',
        {
          root: ['./src'],
          alias: {
            '@/api': './src/api',
            '@/assets': './src/assets',
            '@/auth': './src/auth',
            '@/components': './src/components',
            '@/config': './src/config',
            '@/constants': './src/constants',
            '@/hooks': './src/hooks',
            '@/navigation': './src/navigation',
            '@/screens': './src/screens',
            '@/services': './src/services',
            '@/state': './src/state',
            '@/types': './src/types',
            '@/utils': './src/utils',
          },
          extensions: ['.js', '.jsx', '.ts', '.tsx'],
        },
      ],
    ],
  };
}; 