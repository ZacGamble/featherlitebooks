import { supabase } from '@/config/supabase';

type NumericRpcResponse = number | null;

export interface NameValueRpcResponse {
  name: string;
  value: number;
}

// 1. Total Revenue
export const getTotalRevenue = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_revenue', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('user_id', userId)
    .eq('status', 'paid');

  if (error) {
    console.error('Error fetching total revenue:', error);
    return null;
  }
  return data ? data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0) : 0;
};

// 2. Total Expenses
export const getTotalExpenses = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_expenses', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const { data, error } = await supabase
    .from('expenses')
    .select('amount')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching total expenses:', error);
    return null;
  }
  return data ? data.reduce((sum, item) => sum + (Number(item.amount) || 0), 0) : 0;
};

// 3. Net Profit/Loss
export const getNetProfitLoss = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_net_profit_loss', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Calculate from revenue and expenses
  const rev = await getTotalRevenue(userId);
  const exp = await getTotalExpenses(userId);
  if (rev === null || exp === null) {
    return null;
  }
  return rev - exp;
};

// 4. Average Invoice Value
export const getAverageInvoiceValue = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_average_invoice_value', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching average invoice value:', error);
    return null;
  }
  if (!data || data.length === 0) return 0;
  const total = data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0);
  return total / data.length;
};

// 5. Total Clients Count
export const getTotalClientsCount = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_clients_count', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const { count, error } = await supabase
    .from('clients')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching total clients count:', error);
    return null;
  }
  return count ?? 0;
};

// 6. Total Inventory Value
export const getTotalInventoryValue = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_inventory_value', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const { data, error } = await supabase
    .from('inventory_items')
    .select('quantity_on_hand, unit_price')
    .eq('user_id', userId);

  if (error) {
    console.error('Error fetching total inventory value:', error);
    return null;
  }
  return data
    ? data.reduce((sum, item) => sum + (Number(item.quantity_on_hand) || 0) * (Number(item.unit_price) || 0), 0)
    : 0;
};

// 7. Total Outstanding Receivables
export const getTotalOutstandingReceivables = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_total_outstanding_receivables', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const { data, error } = await supabase
    .from('invoices')
    .select('total_amount')
    .eq('user_id', userId)
    .in('status', ['sent', 'overdue']);

  if (error) {
    console.error('Error fetching total outstanding receivables:', error);
    return null;
  }
  return data ? data.reduce((sum, item) => sum + (Number(item.total_amount) || 0), 0) : 0;
};

// 8. New Invoices Current Month Count
export const getNewInvoicesCurrentMonthCount = async (userId: string): Promise<NumericRpcResponse> => {
  try {
    const { data: rpcData, error: rpcError } = await supabase.rpc('get_new_invoices_current_month_count', { _user_id: userId });
    if (!rpcError && rpcData !== null && typeof rpcData !== 'undefined') {
      return Number(rpcData);
    }
  } catch {
    // Continue to fallback
  }

  // Fallback: Query tables directly
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const startOfMonthStr = `${year}-${month}-01`;

  const { count, error } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .gte('invoice_date', startOfMonthStr);

  if (error) {
    console.error('Error fetching new invoices current month count:', error);
    return null;
  }
  return count ?? 0;
};