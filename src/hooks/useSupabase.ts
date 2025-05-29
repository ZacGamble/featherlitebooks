import { supabase } from '@/config/supabase';

/**
 * Custom hook to easily access the Supabase client instance.
 * This can be useful if you need direct access to the Supabase client
 * outside of specifically designed service functions or the AuthContext.
 */
export const useSupabase = () => {
  return supabase;
}; 