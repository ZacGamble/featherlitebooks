import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import Constants from 'expo-constants';

const supabaseUrl = (process.env.EXPO_PUBLIC_SUPABASE_URL || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_URL) as string;
const supabaseAnonKey = (process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY || Constants.expoConfig?.extra?.EXPO_PUBLIC_SUPABASE_ANON_KEY) as string;

if (!supabaseUrl) {
  console.error(
    'ERROR: EXPO_PUBLIC_SUPABASE_URL is not set. Please check your .env file and babel.config.js. Did you forget to run `npm install` or `yarn` after updating dependencies?'
  );
}
if (!supabaseAnonKey) {
  console.error(
    'ERROR: EXPO_PUBLIC_SUPABASE_ANON_KEY is not set. Please check your .env file and babel.config.js. Did you forget to run `npm install` or `yarn` after updating dependencies?'
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

export const getSupabaseSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error('Error getting Supabase session:', error.message);
    return null;
  }
  return data.session;
}; 