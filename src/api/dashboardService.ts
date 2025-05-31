import { supabase } from '@/config/supabase';

type NumericRpcResponse = number | null;

export interface NameValueRpcResponse {
  name: string;
  value: number;
}

const handleRpcCall = async <T>(functionName: string, params: object): Promise<T | null> => {
  const { data, error } = await supabase.rpc(functionName, params);
  if (error) {
    console.error(`Error calling RPC ${functionName}:`, error);
    return null;
  }
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