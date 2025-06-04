import React, { ReactNode } from 'react';
import { render, act, waitFor, fireEvent } from '@testing-library/react-native';
import {
  Session, 
  User, 
  AuthError,
  Provider,
  OAuthResponse
} from '@supabase/supabase-js';
import { AuthProvider, useAuth } from './AuthContext';
import { UserProfile } from '@/types';

// --- Mocks ---
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignInWithOAuth = jest.fn();
const mockSignOut = jest.fn();
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockInsert = jest.fn();

const mockInsertChainedSelect = jest.fn();
const mockInsertChainedSingle = jest.fn();

jest.mock('@/config/supabase', () => ({
  supabase: {
    auth: {
      getSession: (...args: any[]) => mockGetSession(...args),
      onAuthStateChange: (...args: any[]) => mockOnAuthStateChange(...args),
      signInWithPassword: (...args: any[]) => mockSignInWithPassword(...args),
      signUp: (...args: any[]) => mockSignUp(...args),
      signInWithOAuth: (...args: any[]) => mockSignInWithOAuth(...args),
      signOut: (...args: any[]) => mockSignOut(...args),
    },
    from: (...args: any[]) => mockFrom(...args),
  },
}));

mockFrom.mockImplementation(() => ({
  select: mockSelect,
  insert: mockInsert,
}));

mockSelect.mockImplementation(() => ({
  eq: mockEq,
}));
mockEq.mockImplementation(() => ({
  single: mockSingle,
}));

mockInsert.mockImplementation(() => ({
  select: mockInsertChainedSelect.mockImplementation(() => ({
    single: mockInsertChainedSingle,
  })),
})); 


const mockUser: User = {
  id: 'user-id-123',
  app_metadata: { provider: 'email', providers: ['email'] },
  user_metadata: { name: 'Test User' },
  aud: 'authenticated',
  created_at: new Date().toISOString(),
  email: 'test@example.com', 
  phone: ''
};

const mockSession: Session = {
  access_token: 'mock-access-token',
  refresh_token: 'mock-refresh-token',
  user: mockUser,
  token_type: 'bearer',
  expires_in: 3600,
  expires_at: Math.floor(Date.now() / 1000) + 3600,
};

const mockUserProfile: UserProfile = {
  id: mockUser.id,
  username: 'testuser',
  full_name: 'Test User Full Name',
  avatar_url: null,
  website: null,
  business_name: 'Test Business',
  default_currency: 'USD',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockAuthError = {
  name: 'AuthError',
  message: 'Something went wrong',
  status: 400,
} as AuthError;

import { View, Text, Button } from 'react-native';

const TestConsumerComponent = () => {
  const auth = useAuth();
  return (
    <View>
      <Text testID="loadingInitial">{auth.loadingInitial.toString()}</Text>
      <Text testID="loading">{auth.loading.toString()}</Text>
      <Text testID="user">{JSON.stringify(auth.user)}</Text>
      <Text testID="session">{JSON.stringify(auth.session)}</Text>
      <Text testID="profile">{JSON.stringify(auth.profile)}</Text>
      <Text testID="error">{JSON.stringify(auth.error)}</Text>
      <Button title="SignIn" onPress={() => auth.signInWithPassword({ email: 'test@example.com', password: 'password' })} testID="signInButton"/>
      <Button title="SignUp" onPress={() => auth.signUpNewUser({ email: 'test@example.com', password: 'password' })} testID="signUpButton" />
      <Button title="SignInOAuth" onPress={async () => await auth.signInWithOAuth({ provider: 'google' as Provider })} testID="signInOAuthButton" />
      <Button title="SignOut" onPress={auth.signOut} testID="signOutButton" />
      <Button title="ClearError" onPress={auth.clearError} testID="clearErrorButton" />
    </View>
  );
};

const renderWithAuthProvider = (ui: ReactNode) => {
  return render(<AuthProvider>{ui}</AuthProvider>);
};

describe('AuthContext', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetSession.mockResolvedValue({ data: { session: null }, error: null });
    mockOnAuthStateChange.mockReturnValue({ data: { subscription: { unsubscribe: jest.fn() } } });
    mockSingle.mockResolvedValue({ data: null, error: null, status: 406 });
    mockInsertChainedSingle.mockReset();
  });

  describe('Initial State and Session Loading', () => {
    it('should have correct initial state and load session, then profile', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
      mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 });

      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);

      expect(getByTestId('loadingInitial').props.children).toBe('true');
      expect(getByTestId('user').props.children).toBe(JSON.stringify(null));
      expect(getByTestId('profile').props.children).toBe(JSON.stringify(null));

      await waitFor(() => expect(getByTestId('loadingInitial').props.children).toBe('false'));
      
      expect(mockGetSession).toHaveBeenCalledTimes(1);
      expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession));
      expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser));

      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith('id, username, full_name, avatar_url, website, business_name, default_currency, created_at, updated_at');
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id);
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });

    it('should handle no initial session', async () => {
      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      
      await waitFor(() => expect(getByTestId('loadingInitial').props.children).toBe('false'));
      
      expect(getByTestId('session').props.children).toBe(JSON.stringify(null));
      expect(getByTestId('user').props.children).toBe(JSON.stringify(null));
      expect(getByTestId('profile').props.children).toBe(JSON.stringify(null));
      expect(mockSingle).not.toHaveBeenCalled();
    });

    it('should set error if getSession fails', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: mockAuthError });
      
      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      
      await waitFor(() => expect(getByTestId('loadingInitial').props.children).toBe('false'));
      
      expect(getByTestId('error').props.children).toBe(JSON.stringify(mockAuthError));
    });
  });

  describe('onAuthStateChange Handling', () => {
    it('should update session and user on auth state change, then fetch profile', async () => {
      let capturedAuthStateChangeCallback: (event: string, session: Session | null) => Promise<void> = async () => {};
      mockOnAuthStateChange.mockImplementationOnce((cb) => {
        capturedAuthStateChangeCallback = cb;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });
      
      mockGetSession.mockResolvedValueOnce({ data: { session: null }, error: null });
      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      
      await waitFor(() => expect(getByTestId('session').props.children).toBe(JSON.stringify(null)));
      await waitFor(() => expect(getByTestId('user').props.children).toBe(JSON.stringify(null)));
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(null)));

      mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 });

      await act(async () => {
        await capturedAuthStateChangeCallback('SIGNED_IN', mockSession);
      });

      expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession));
      expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser));
      
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));
      expect(mockSingle).toHaveBeenCalledTimes(1);
    });

    it('should clear session and user when auth state changes to signed out', async () => {
      let authStateChangeCallback: (event: string, session: Session | null) => Promise<void> = async () => {};
      
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
      mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 });
      mockOnAuthStateChange.mockImplementationOnce((callback) => {
        authStateChangeCallback = callback;
        return { data: { subscription: { unsubscribe: jest.fn() } } };
      });

      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      
      await waitFor(() => expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession)));
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));

      await act(async () => {
        await authStateChangeCallback('SIGNED_OUT', null);
      });

      expect(getByTestId('session').props.children).toBe(JSON.stringify(null));
      expect(getByTestId('user').props.children).toBe(JSON.stringify(null));
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(null)));
    });
  });

  describe('Profile Fetching and Creation', () => {
    it('should fetch profile when user becomes available', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
      mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 });

      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      await waitFor(() => expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser)));
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));
      
      expect(mockFrom).toHaveBeenCalledWith('profiles');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('business_name'));
      expect(mockEq).toHaveBeenCalledWith('id', mockUser.id);
    });

    it('should set profile to null if profile fetch fails (non-406 error)', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
      
      const dbError = { name: 'DBError', message: 'Fetch failed', details: '', hint: '', code: 'PGRST116' };
      mockSingle.mockResolvedValueOnce({ data: null, error: dbError, status: 500 });

      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      
      await waitFor(() => expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser)));
      
      await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(null)));
      
      expect(mockSingle).toHaveBeenCalledTimes(1);
      
      expect(getByTestId('error').props.children).toBe(JSON.stringify(null));
    });

    it('should create profile if not found (status 406) and set default currency', async () => {
      const profileDataFromDbInsert = { ...mockUserProfile, default_currency: undefined };
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
      
      mockInsertChainedSingle.mockResolvedValueOnce({ data: profileDataFromDbInsert, error: null, status: 200 });

      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      
      await waitFor(() => expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser)));
      
      await waitFor(() => expect(mockInsert).toHaveBeenCalledTimes(1));
      expect(mockInsert).toHaveBeenCalledWith(expect.objectContaining({
        id: mockUser.id,
        default_currency: 'USD'
      }));
      
      await waitFor(() => expect(mockInsertChainedSingle).toHaveBeenCalledTimes(1));

      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(profileDataFromDbInsert)));
    });

    it('should handle profile creation failure', async () => {
      mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
      mockSingle.mockResolvedValueOnce({ data: null, error: null, status: 406 });
      mockInsert.mockImplementationOnce(() => ({
        select: jest.fn().mockImplementationOnce(() => ({ 
          single: jest.fn().mockResolvedValueOnce({ data: null, error: { name: 'DBError', message: 'Insert failed' } as any, status: 500 })
        }))
      }));

      const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
      await waitFor(() => expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser)));
      await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(null)));
    });

    it('should set default_currency to USD if fetched profile is missing it', async () => {
        const profileMissingCurrency = { ...mockUserProfile, id: mockUser.id, default_currency: null };
        const expectedProfile = { ...profileMissingCurrency, default_currency: 'USD' };
  
        mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
        mockSingle.mockResolvedValueOnce({ data: profileMissingCurrency, error: null, status: 200 });
  
        const { getByTestId } = renderWithAuthProvider(<TestConsumerComponent />);
        await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(expectedProfile)));
      });
  });

  describe('Authentication Operations', () => {
    describe('signInWithPassword', () => {
      it('should sign in successfully, update session/user via onAuthStateChange, then fetch profile', async () => {
        let capturedAuthStateChangeCallback: (event: string, session: Session | null) => Promise<void> = async () => {};
        mockOnAuthStateChange.mockImplementationOnce((cb) => {
          capturedAuthStateChangeCallback = cb;
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        });

        mockSignInWithPassword.mockResolvedValueOnce({ 
          data: { session: mockSession, user: mockUser },
          error: null 
        });
        mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 });

        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        
        fireEvent.press(getByText('SignIn'));
        
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(mockSignInWithPassword).toHaveBeenCalledTimes(1);
        expect(getByTestId('error').props.children).toBe(JSON.stringify(null));

        await act(async () => {
          await capturedAuthStateChangeCallback('SIGNED_IN', mockSession);
        });

        expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession));
        expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser));
        await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));
        expect(mockSingle).toHaveBeenCalledTimes(1);
      });

      it('should set error if sign in fails', async () => {
        mockSignInWithPassword.mockResolvedValueOnce({ data: { session: null, user: null }, error: mockAuthError });
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        act(() => {
          fireEvent.press(getByText('SignIn'));
        });
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(getByTestId('error').props.children).toBe(JSON.stringify(mockAuthError));
        expect(getByTestId('session').props.children).toBe(JSON.stringify(null));
      });
    });

    describe('signUpNewUser', () => {
      it('should sign up successfully, update session/user via onAuthStateChange, then fetch profile', async () => {
        let capturedAuthStateChangeCallback: (event: string, session: Session | null) => Promise<void> = async () => {};
        mockOnAuthStateChange.mockImplementationOnce((cb) => {
          capturedAuthStateChangeCallback = cb;
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        });

        mockSignUp.mockResolvedValueOnce({ 
          data: { session: mockSession, user: mockUser },
          error: null 
        });
        mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 });

        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        fireEvent.press(getByText('SignUp'));
        
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(mockSignUp).toHaveBeenCalledTimes(1);
        expect(getByTestId('error').props.children).toBe(JSON.stringify(null));

        await act(async () => {
          await capturedAuthStateChangeCallback('SIGNED_IN', mockSession);
        });

        expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession));
        expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser));
        await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));
        expect(mockSingle).toHaveBeenCalledTimes(1);
      });

      it('should set error if sign up fails', async () => {
        mockSignUp.mockResolvedValueOnce({ data: { session: null, user: null }, error: mockAuthError });
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        act(() => {
          fireEvent.press(getByText('SignUp'));
        });
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(getByTestId('error').props.children).toBe(JSON.stringify(mockAuthError));
      });
    });

    describe('signInWithOAuth', () => {
      it('should call signInWithOAuth and update loading/error state correctly on success', async () => {
        mockSignInWithOAuth.mockResolvedValueOnce({ data: { provider: 'google' as Provider, url: 'http://localhost/oauth' }, error: null });
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        
        fireEvent.press(getByText('SignInOAuth'));

        expect(getByTestId('loading').props.children).toBe('true'); 
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(mockSignInWithOAuth).toHaveBeenCalledWith({ provider: 'google' });
        expect(getByTestId('error').props.children).toBe(JSON.stringify(null));
      });

      it('should set context error if signInWithOAuth fails internally', async () => {
        mockSignInWithOAuth.mockResolvedValueOnce({ data: null, error: mockAuthError });
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        
        fireEvent.press(getByText('SignInOAuth'));

        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(getByTestId('error').props.children).toBe(JSON.stringify(mockAuthError));
      });
    });

    describe('signOut', () => {
      it('should establish initial session via getSession, then sign out and clear states via onAuthStateChange', async () => {
        mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
        mockSingle.mockResolvedValueOnce({ data: mockUserProfile, error: null, status: 200 }); 

        let capturedAuthStateChangeCallback: (event: string, session: Session | null) => Promise<void> = async () => {};
        mockOnAuthStateChange.mockImplementationOnce((cb) => {
          capturedAuthStateChangeCallback = cb;
          return { data: { subscription: { unsubscribe: jest.fn() } } };
        });
        
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);

        await waitFor(() => expect(getByTestId('loadingInitial').props.children).toBe('false'));
        await waitFor(() => expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession)));
        await waitFor(() => expect(getByTestId('user').props.children).toBe(JSON.stringify(mockUser)));
        await waitFor(() => expect(getByTestId('profile').props.children).toBe(JSON.stringify(mockUserProfile)));

        mockSignOut.mockResolvedValueOnce({ error: null });

        fireEvent.press(getByText('SignOut'));
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(mockSignOut).toHaveBeenCalledTimes(1);

        await act(async () => {
          if (typeof capturedAuthStateChangeCallback === 'function') {
            await capturedAuthStateChangeCallback('SIGNED_OUT', null);
          } else {
            throw new Error('onAuthStateChange callback was not captured');
          }
        });

        expect(getByTestId('session').props.children).toBe(JSON.stringify(null));
        expect(getByTestId('user').props.children).toBe(JSON.stringify(null));
        expect(getByTestId('profile').props.children).toBe(JSON.stringify(null)); 
        expect(getByTestId('error').props.children).toBe(JSON.stringify(null));
      });

      it('should set error if sign out fails', async () => {
        mockGetSession.mockResolvedValueOnce({ data: { session: mockSession }, error: null });
        mockSignOut.mockResolvedValueOnce({ error: mockAuthError });
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);
        await waitFor(() => expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession)));
        act(() => {
          fireEvent.press(getByText('SignOut'));
        });
        await waitFor(() => expect(getByTestId('loading').props.children).toBe('false'));
        expect(getByTestId('error').props.children).toBe(JSON.stringify(mockAuthError));
        expect(getByTestId('session').props.children).toBe(JSON.stringify(mockSession));
      });
    });

    describe('clearError', () => {
      it('should clear the error state', async () => {
        mockGetSession.mockResolvedValueOnce({ data: {session: null }, error: mockAuthError });
        const { getByTestId, getByText } = renderWithAuthProvider(<TestConsumerComponent />);        
        await waitFor(() => expect(getByTestId('error').props.children).toBe(JSON.stringify(mockAuthError)));
        act(() => {
          fireEvent.press(getByText('ClearError'));
        });
        expect(getByTestId('error').props.children).toBe(JSON.stringify(null));
      });
    });
  });
}); 