import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import {
  Session,
  User,
  AuthError,
  SignInWithPasswordCredentials,
  SignUpWithPasswordCredentials,
  OAuthResponse,
  SignInWithOAuthCredentials,
  AuthResponse,
  Provider
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
  signInWithOAuth: (credentials: SignInWithOAuthCredentials) => Promise<AuthError | null>;
  signOut: () => Promise<void>;
  clearError: () => void;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loadingInitial, setLoadingInitial] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<AuthError | null>(null);

  const fetchProfile = useCallback(async (currentUser: User | null) => {
    if (currentUser) {
      try {
        setLoading(true);
        setError(null);
        const profileFieldsToSelect = 'id, username, full_name, avatar_url, website, business_name, default_currency, created_at, updated_at';
        const { data, error: profileError, status } = await supabase
          .from('profiles')
          .select(profileFieldsToSelect)
          .eq('id', currentUser.id)
          .single();

        if (profileError && status !== 406) {
          throw profileError;
        }

        if (data) {
          const loadedProfile = data as UserProfile;
          if (!loadedProfile.default_currency) {
            loadedProfile.default_currency = 'USD';
          }
          setProfile(loadedProfile);
        } else if (status === 406) {
          console.log('No profile found for user, attempting to create one...');
          const defaultUsername = currentUser.email?.split('@')[0] || `user-${currentUser.id.substring(0, 8)}`;
          const newProfileData: Partial<UserProfile> = {
            id: currentUser.id,
            username: defaultUsername,
            default_currency: 'USD',
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
  }, []);

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
        const currentUser = newSession?.user ?? null;
        setUser(currentUser);
        setError(null);
      }
    );
    
    const subscription = data?.subscription;

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  useEffect(() => {
    fetchProfile(user);
  }, [user, fetchProfile]);

  const handleAuthOperation = async (
    operation: () => Promise<Partial<AuthResponse>>
  ): Promise<AuthError | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await operation();
      const opError = response.error;
      if (opError) {
        setError(opError);
        return opError;
      }
      return null;
    } catch (e) {
      const caughtError = e as AuthError;
      console.error('Auth operation error:', caughtError.message);
      setError(caughtError);
      return caughtError;
    } finally {
      setLoading(false);
    }
  };

  const signInWithPassword = async (credentials: SignInWithPasswordCredentials): Promise<AuthError | null> => {
    return await handleAuthOperation(() => supabase.auth.signInWithPassword(credentials));
  };

  const signUpNewUser = async (credentials: SignUpWithPasswordCredentials): Promise<AuthError | null> => {
    return await handleAuthOperation(() => supabase.auth.signUp(credentials));
  };

  const signInWithOAuth = async (credentials: SignInWithOAuthCredentials): Promise<AuthError | null> => {
    setLoading(true);
    setError(null);
    try {
      const response = await supabase.auth.signInWithOAuth(credentials);
      if (response.error) {
        setError(response.error);
        return response.error;
      }
      return null;
    } catch (e) {
      const caughtError = e as AuthError;
      console.error('OAuth sign-in error:', caughtError.message);
      setError(caughtError);
      return caughtError;
    } finally {
      setLoading(false);
    }
  };

  const signOut = async () => {
    await handleAuthOperation(() => supabase.auth.signOut());
    setProfile(null);
  };

  const clearError = () => {
    setError(null);
  };

  const refreshProfile = useCallback(async () => {
    if (user) {
      await fetchProfile(user);
    }
  }, [user, fetchProfile]);

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
        refreshProfile,
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