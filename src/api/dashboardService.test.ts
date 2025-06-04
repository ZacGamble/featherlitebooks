// import { supabase } from '@/config/supabase'; // This line was likely causing the issue and is removed.
import {
  getTotalRevenue,
  getTotalExpenses,
  getNetProfitLoss,
  getTotalClientsCount,
  getAverageInvoiceValue, 
  getTotalInventoryValue, 
  getTotalOutstandingReceivables, 
  getNewInvoicesCurrentMonthCount
} from './dashboardService';
// No aggregate DashboardMetrics type is defined in @/types, each metric is standalone.

// Mock the Supabase client and its rpc method
const mockRpc = jest.fn();

jest.mock('@/config/supabase', () => ({
  // Ensure the mock exports a supabase object with an rpc method
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args), // Delegate to the mockRpc jest.fn()
  },
}));

const mockUserId = 'user-test-id';

describe('dashboardService', () => {
  beforeEach(() => {
    mockRpc.mockClear(); // Clear the mock before each test
  });

  describe('getTotalRevenue', () => {
    it('should fetch total revenue successfully', async () => {
      const expectedRevenue = 5000;
      mockRpc.mockResolvedValueOnce({ data: expectedRevenue, error: null });
      const revenue = await getTotalRevenue(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_revenue', { _user_id: mockUserId });
      expect(revenue).toBe(expectedRevenue);
    });

    it('should return null if RPC call for total revenue fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      const revenue = await getTotalRevenue(mockUserId);
      expect(revenue).toBeNull();
    });

    it('should return null if RPC call for total revenue returns null data', async () => {
        mockRpc.mockResolvedValueOnce({ data: null, error: null });
        const revenue = await getTotalRevenue(mockUserId);
        expect(revenue).toBeNull();
      });
  });

  describe('getTotalExpenses', () => {
    it('should fetch total expenses successfully', async () => {
      const expectedExpenses = 1500;
      mockRpc.mockResolvedValueOnce({ data: expectedExpenses, error: null });
      const expenses = await getTotalExpenses(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_expenses', { _user_id: mockUserId });
      expect(expenses).toBe(expectedExpenses);
    });

    it('should return null if RPC call for total expenses fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      const expenses = await getTotalExpenses(mockUserId);
      expect(expenses).toBeNull();
    });
  });

  describe('getNetProfitLoss', () => {
    it('should fetch net profit/loss successfully', async () => {
      const expectedNetProfit = 3500;
      mockRpc.mockResolvedValueOnce({ data: expectedNetProfit, error: null });
      const netProfit = await getNetProfitLoss(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_net_profit_loss', { _user_id: mockUserId });
      expect(netProfit).toBe(expectedNetProfit);
    });

    it('should return null if RPC call for net profit/loss fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      const netProfit = await getNetProfitLoss(mockUserId);
      expect(netProfit).toBeNull();
    });
  });

  describe('getTotalClientsCount', () => {
    it('should fetch total clients count successfully', async () => {
      const expectedCount = 10;
      mockRpc.mockResolvedValueOnce({ data: expectedCount, error: null });
      const count = await getTotalClientsCount(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_clients_count', { _user_id: mockUserId });
      expect(count).toBe(expectedCount);
    });

    it('should return null if RPC call for total clients count fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      const count = await getTotalClientsCount(mockUserId);
      expect(count).toBeNull();
    });
  });

  describe('getAverageInvoiceValue', () => {
    it('should fetch average invoice value successfully', async () => {
      const expectedValue = 250.75;
      mockRpc.mockResolvedValueOnce({ data: expectedValue, error: null });
      const value = await getAverageInvoiceValue(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_average_invoice_value', { _user_id: mockUserId });
      expect(value).toBe(expectedValue);
    });
    it('should return null if RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error'} as any });
      expect(await getAverageInvoiceValue(mockUserId)).toBeNull();
    });
  });

  describe('getTotalInventoryValue', () => {
    it('should fetch total inventory value successfully', async () => {
      const expectedValue = 12500.00;
      mockRpc.mockResolvedValueOnce({ data: expectedValue, error: null });
      const value = await getTotalInventoryValue(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_inventory_value', { _user_id: mockUserId });
      expect(value).toBe(expectedValue);
    });
    it('should return null if RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error'} as any });
      expect(await getTotalInventoryValue(mockUserId)).toBeNull();
    });
  });

  describe('getTotalOutstandingReceivables', () => {
    it('should fetch total outstanding receivables successfully', async () => {
      const expectedValue = 3200.50;
      mockRpc.mockResolvedValueOnce({ data: expectedValue, error: null });
      const value = await getTotalOutstandingReceivables(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_outstanding_receivables', { _user_id: mockUserId });
      expect(value).toBe(expectedValue);
    });
    it('should return null if RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error'} as any });
      expect(await getTotalOutstandingReceivables(mockUserId)).toBeNull();
    });
  });

  describe('getNewInvoicesCurrentMonthCount', () => {
    it('should fetch new invoices current month count successfully', async () => {
      const expectedCount = 5;
      mockRpc.mockResolvedValueOnce({ data: expectedCount, error: null });
      const count = await getNewInvoicesCurrentMonthCount(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_new_invoices_current_month_count', { _user_id: mockUserId });
      expect(count).toBe(expectedCount);
    });
    it('should return null if RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error'} as any });
      expect(await getNewInvoicesCurrentMonthCount(mockUserId)).toBeNull();
    });
  });
}); 