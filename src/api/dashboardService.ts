import { supabase } from '@/config/supabase';

// Generic type for RPC responses that are expected to return a single numeric value or count
type NumericRpcResponse = number | null;

// Type for RPC responses that return a name and a value (e.g., top selling item)
export interface NameValueRpcResponse {
  name: string;
  value: number;
  // Add any other relevant fields if your RPC returns more details
}

const handleRpcCall = async <T>(functionName: string, params: object): Promise<T | null> => {
  const { data, error } = await supabase.rpc(functionName, params);
  if (error) {
    console.error(`Error calling RPC ${functionName}:`, error);
    // Consider how to propagate this error to the UI - throw, return specific error object, etc.
    return null;
  }
  // Supabase RPC calls often return the value directly, not nested under a property.
  // If the RPC returns a single value (e.g., a count or sum), it might be returned as is.
  // If it returns a row (e.g. from a SELECT in the function), it would be an object or array of objects.
  // We cast to T, assuming the caller knows the expected structure.
  return data as T;
};

// 1. Total Revenue
export const getTotalRevenue = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_total_revenue', { _user_id: userId });
};

// 2. Total Expenses
export const getTotalExpenses = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_total_expenses', { _user_id: userId });
};

// 3. Net Profit/Loss
export const getNetProfitLoss = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_net_profit_loss', { _user_id: userId });
};

// 4. Average Invoice Value
export const getAverageInvoiceValue = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_average_invoice_value', { _user_id: userId });
};

// 5. Total Clients Count
export const getTotalClientsCount = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_total_clients_count', { _user_id: userId });
};

// 6. Total Inventory Value
export const getTotalInventoryValue = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_total_inventory_value', { _user_id: userId });
};

// 7. Total Outstanding Receivables
export const getTotalOutstandingReceivables = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_total_outstanding_receivables', { _user_id: userId });
};

// 8. New Invoices This Month Count
export const getNewInvoicesCurrentMonthCount = async (userId: string): Promise<NumericRpcResponse> => {
  return handleRpcCall<NumericRpcResponse>('get_new_invoices_current_month_count', { _user_id: userId });
}; 