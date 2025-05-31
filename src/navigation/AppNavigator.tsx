import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { useAuth } from '@/auth/AuthContext';
import AuthNavigator from './AuthNavigator';
import AppTabs from './AppTabs';
import LoadingIndicator from '@/components/common/LoadingIndicator';

const linking = {
  prefixes: ['featherlitebooks://', 'exp://'],
  config: {
    screens: {
      Landing: 'landing',
      Login: 'login',
      Signup: 'signup',
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
      NotFound: '*',
    },
  },
};

const AppNavigator = () => {
  const { session, loadingInitial, user } = useAuth();

  if (loadingInitial) {
    return <LoadingIndicator fullScreen={true} text="Initializing FeatherLiteBooks..." />;
  }

  return (
    <NavigationContainer linking={linking} fallback={<LoadingIndicator fullScreen={true} />}>
      {session && user ? <AppTabs /> : <AuthNavigator />}
    </NavigationContainer>
  );
};

export default AppNavigator; 