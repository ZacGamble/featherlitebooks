import { useAuth as useAuthFromContext } from '@/auth/AuthContext';

/**
 * Custom hook to access the AuthContext.
 * This provides a clear separation for components to import auth-related functionalities.
 * It simply re-exports `useAuth` from `AuthContext` for structural consistency in the hooks directory.
 */
export const useAuth = useAuthFromContext; 