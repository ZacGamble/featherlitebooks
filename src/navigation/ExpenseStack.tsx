import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import { ExpenseListScreen } from '@/screens/app/expenses/ExpenseListScreen';
import { ExpenseDetailScreen } from '@/screens/app/expenses/ExpenseDetailScreen';
import { ExpenseFormScreen } from '@/screens/app/expenses/ExpenseFormScreen';

// const PlaceholderScreen = () => null; // Remove placeholder

export type ExpenseStackParamList = {
  [ROUTES.EXPENSE_LIST]: undefined;
  [ROUTES.EXPENSE_DETAIL]: { expenseId: string };
  [ROUTES.EXPENSE_FORM]: { expenseId?: string };
};

const Stack = createNativeStackNavigator<ExpenseStackParamList>();

export const ExpenseStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
      }}
      initialRouteName={ROUTES.EXPENSE_LIST}
    >
      <Stack.Screen name={ROUTES.EXPENSE_LIST} component={ExpenseListScreen} /> 
      <Stack.Screen name={ROUTES.EXPENSE_DETAIL} component={ExpenseDetailScreen} />
      <Stack.Screen name={ROUTES.EXPENSE_FORM} component={ExpenseFormScreen} />
    </Stack.Navigator>
  );
}; 