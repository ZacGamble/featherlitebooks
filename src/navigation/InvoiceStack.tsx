import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { ROUTES } from '@/constants/routes';
import { InvoiceListScreen } from '@/screens/app/invoices/InvoiceListScreen';
import { InvoiceDetailScreen } from '@/screens/app/invoices/InvoiceDetailScreen';
import { InvoiceFormScreen } from '@/screens/app/invoices/InvoiceFormScreen';

// Define ParamList for the Invoice stack
export type InvoiceStackParamList = {
  [ROUTES.INVOICE_LIST]: undefined;
  [ROUTES.INVOICE_DETAIL]: { invoiceId: string };
  [ROUTES.INVOICE_FORM]: { invoiceId?: string }; // Optional invoiceId for editing
  // Add other invoice-related screens here if needed
};

const Stack = createNativeStackNavigator<InvoiceStackParamList>();

export const InvoiceStack: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false, // Headers can be managed by individual screens or a main app header
      }}
      initialRouteName={ROUTES.INVOICE_LIST}
    >
      <Stack.Screen name={ROUTES.INVOICE_LIST} component={InvoiceListScreen} />
      <Stack.Screen name={ROUTES.INVOICE_DETAIL} component={InvoiceDetailScreen} />
      {/* Placeholder for Detail screen until it's created */}
      {/* <Stack.Screen name={ROUTES.INVOICE_DETAIL} component={() => null} /> */}
      <Stack.Screen name={ROUTES.INVOICE_FORM} component={InvoiceFormScreen} />
    </Stack.Navigator>
  );
}; 