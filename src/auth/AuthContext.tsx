import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import {
  Session,
  User,
  AuthError,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  OAuthResponse,
  SignInWithOAuthCredentials,
  AuthResponse,
} from '@supabase/supabase-js';
import { supabase } from '@/config/supabase';
import { UserProfile } from '@/types';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  profile: UserProfile | null;
  loadingInitial: boolean;
  loading: boolean;
  error: AuthError | null;
  signInWithPassword: (credentials: SignInWithPasswordCredentials) => Promise<AuthError | null>;
  signUpNewUser: (credentials: SignUpWithPasswordCredentials) => Promise<AuthError | null>;
  signInWithOAuth: (credentials: SignInWithOAuthCredentials) => Promise<OAuthResponse>;
  signOut: () => Promise<void>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        setLoadingInitial(true);
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
        if (sessionError) {
          console.warn('AuthContext: Error fetching initial session:', sessionError.message);
          setError(sessionError);
        } else {
          setSession(currentSession);
          setUser(currentSession?.user ?? null);
        }
      } catch (e) {
        console.error('AuthContext: Unexpected error fetching session:', e);
        setError({ name: 'FetchSessionError', message: (e as Error).message } as AuthError);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchSession();

    const { data } = supabase.auth.onAuthStateChange(
      async (_event, newSession) => {
        setSession(newSession);
        setUser(newSession?.user ?? null);
        setError(null);
      }
    );
    
    // The `data` object from onAuthStateChange contains the subscription.
    const subscription = data?.subscription;

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (user) {
        try {
          setLoading(true);
          setError(null);
          const profileFieldsToSelect = 'id, username, full_name, avatar_url, website, business_name, default_currency, created_at, updated_at';
          const { data, error: profileError, status } = await supabase
            .from('profiles')
            .select(profileFieldsToSelect)
            .eq('id', user.id)
            .single();

          if (profileError && status !== 406) {
            throw profileError;
          }

          if (data) {
            // Ensure default_currency is set
            const loadedProfile = data as UserProfile;
            if (!loadedProfile.default_currency) {
              loadedProfile.default_currency = 'USD';
            }
            setProfile(loadedProfile);
          } else if (status === 406) {
            console.log('No profile found for user, attempting to create one...');
            const defaultUsername = user.email?.split('@')[0] || `user-${user.id.substring(0, 8)}`;
            const newProfileData: Partial<UserProfile> = { // Use Partial for initial creation
              id: user.id,
              username: defaultUsername,
              default_currency: 'USD', // Set default currency on creation
            };

            const { data: createdProfileData, error: createError } = await supabase
              .from('profiles')
              .insert(newProfileData)
              .select(profileFieldsToSelect)
              .single();

            if (createError) {
              console.error('Error creating profile:', createError.message);
              setProfile(null);
            } else if (createdProfileData) {
              console.log('Profile created successfully:', createdProfileData);
              // Ensure default_currency is set, though it should be from insert
              const newProfile = createdProfileData as UserProfile;
              if (!newProfile.default_currency) {
                newProfile.default_currency = 'USD';
              }
              setProfile(newProfile);
            } else {
              setProfile(null);
            }
          }
        } catch (profileErr) {
          console.error('Error fetching/creating user profile:', (profileErr as AuthError).message);
          setProfile(null);
        } finally {
          setLoading(false);
        }
      } else {
        setProfile(null);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Generic handler for auth operations to reduce boilerplate
  const handleAuthOperation = async (
    operation: () => Promise<Partial<AuthResponse>>
  ): Promise<AuthError | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await operation();
      const opError = response.error;
      if (opError) {
        setError(opError); // Still set context error
        return opError;   // Return error for local handling
      }
      return null; // Success
    } catch (e) {
      const caughtError = e as AuthError;
      console.error('Auth operation error:', caughtError.message);
      setError(caughtError);
      return caughtError; // Return caught error
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials): Promise<AuthError | null> => {
    return await handleAuthOperation(() => supabase.auth.signInWithPassword(credentials));
  };

  const signUpNewUser = async (credentials: SignUpWithPasswordCredentials): Promise<AuthError | null> => {
    // Note: Supabase by default sends a confirmation email for signUp.
    // Profile creation is typically handled via a database trigger on `auth.users` table insertion
    // or in a subsequent step after email confirmation.
    return await handleAuthOperation(() => supabase.auth.signUp(credentials));
  };

  const signInWithOAuth = async (credentials: SignInWithOAuthCredentials): Promise<OAuthResponse> => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabase.auth.signInWithOAuth(credentials);
      if (response.error) {
        throw response.error;
      }
      // On web, signInWithOAuth typically redirects. For mobile, it might return session data directly
      // or require handling a deep link. This example assumes the JS library handles it.
      return response;
    } catch (e) {
      console.error('OAuth sign-in error:', (e as AuthError).message);
      setError(e as AuthError);
      // Rethrow to allow calling component to handle OAuth specific flows or errors if necessary
      throw e; 
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await handleAuthOperation(() => supabase.auth.signOut());
    setProfile(null); // Clear profile on sign out
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        loadingInitial,
        loading,
        error,
        signInWithPassword,
        signUpNewUser,
        signInWithOAuth,
        signOut,
        clearError,
      }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}; 