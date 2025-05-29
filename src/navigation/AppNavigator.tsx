import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppTabs from './AppTabs';
import PublicNavigator from './PublicNavigator'; // Assuming LandingScreen is the entry
import LoadingIndicator from '@/components/common/LoadingIndicator'; // A simple loading spinner
import { ROUTES } from '@/constants/routes';

const linking = {
  prefixes: ['featherlitebooks://', 'exp://'], // Add your app's custom scheme
  config: {
    screens: {
      // Map your route names to URL paths
      // Public routes
      Landing: 'landing',
      // Auth routes
      Login: 'login',
      Signup: 'signup',
      // AppTab routes (nested)
      AppTabs: {
        path: 'app',
        screens: {
          Dashboard: 'dashboard',
          InventoryStack: {
            path: 'inventory',
            screens: {
              InventoryList: '',
              InventoryForm: 'form/:itemId?',
              InventoryDetail: 'detail/:itemId',
            },
          },
          InvoicesStack: {
            path: 'invoices',
            screens: {
              InvoiceList: '',
              InvoiceForm: 'form/:invoiceId?',
              InvoiceDetail: 'detail/:invoiceId',
            },
          },
          ExpensesStack: {
            path: 'expenses',
            screens: {
              ExpenseList: '',
              ExpenseForm: 'form/:expenseId?',
              ExpenseDetail: 'detail/:expenseId',
            },
          },
          Reports: 'reports',
          SettingsTabStack: {
            path: 'settings',
            screens: {
                Settings: '',
                Profile: 'profile'
            }
          }
        },
      },
      NotFound: '*', // Catch-all for unmatched routes
    },
  },
};

const AppNavigator = () => {
  const { session, loadingInitial, user } = useAuth();

  if (loadingInitial) {
    // Show a loading screen while checking auth state, possibly with your app logo
    // This prevents a flash of the login screen or public screen before auth state is known.
    return <LoadingIndicator fullScreen={true} text="Initializing FeatherLiteBooks..." />;
  }

  // Simple logic: If no session, but user might exist (e.g. during OAuth redirect or just after signup before session is fully set by listener)
  // you might want to show a loading screen or a specific intermediate screen.
  // For this boilerplate, we directly go to Auth or App.

  // The PublicNavigator is the outermost layer if you want a landing page accessible to all.
  // From the LandingScreen, users would typically navigate to Login or Signup, which are part of AuthNavigator.
  // If a session exists, we bypass Public/Auth navigators and go straight to AppTabs.

  return (
    <NavigationContainer linking={linking} fallback={<LoadingIndicator fullScreen={true} />}>
      {session && user ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 