import {
  getTotalRevenue,
  getTotalExpenses,
  getNetProfitLoss,
  getTotalClientsCount,
  getAverageInvoiceValue,
  getTotalInventoryValue,
  getTotalOutstandingReceivables,
  getNewInvoicesCurrentMonthCount,
} from './dashboardService';

const mockRpc = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/config/supabase', () => ({
  supabase: {
    rpc: (...args: any[]) => mockRpc(...args),
    from: (...args: any[]) => mockFrom(...args),
  },
}));

const mockUserId = 'user-test-id';

const createQueryMock = (result: { data?: any; count?: number | null; error?: any }) => {
  const chain: any = {
    select: jest.fn(() => chain),
    eq: jest.fn(() => chain),
    in: jest.fn(() => chain),
    gte: jest.fn(() => chain),
    then: (onfulfilled?: any, onrejected?: any) => Promise.resolve(result).then(onfulfilled, onrejected),
  };
  return chain;
};

describe('dashboardService', () => {
  beforeEach(() => {
    mockRpc.mockClear();
    mockFrom.mockClear();
  });

  describe('getTotalRevenue', () => {
    it('should fetch total revenue via RPC successfully', async () => {
      const expectedRevenue = 5000;
      mockRpc.mockResolvedValueOnce({ data: expectedRevenue, error: null });
      const revenue = await getTotalRevenue(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_revenue', { _user_id: mockUserId });
      expect(revenue).toBe(expectedRevenue);
    });

    it('should fallback to direct table query when RPC fails and calculate revenue', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: [{ total_amount: 3000 }, { total_amount: 2000 }], error: null }));

      const revenue = await getTotalRevenue(mockUserId);
      expect(revenue).toBe(5000);
      expect(mockFrom).toHaveBeenCalledWith('invoices');
    });

    it('should return null if both RPC and fallback table query fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: null, error: { message: 'Table error' } }));

      const revenue = await getTotalRevenue(mockUserId);
      expect(revenue).toBeNull();
    });
  });

  describe('getTotalExpenses', () => {
    it('should fetch total expenses via RPC successfully', async () => {
      const expectedExpenses = 1500;
      mockRpc.mockResolvedValueOnce({ data: expectedExpenses, error: null });
      const expenses = await getTotalExpenses(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_expenses', { _user_id: mockUserId });
      expect(expenses).toBe(expectedExpenses);
    });

    it('should fallback to direct table query when RPC fails and calculate expenses', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: [{ amount: 1000 }, { amount: 500 }], error: null }));

      const expenses = await getTotalExpenses(mockUserId);
      expect(expenses).toBe(1500);
      expect(mockFrom).toHaveBeenCalledWith('expenses');
    });

    it('should return null if both RPC and fallback table query fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: null, error: { message: 'Table error' } }));

      const expenses = await getTotalExpenses(mockUserId);
      expect(expenses).toBeNull();
    });
  });

  describe('getNetProfitLoss', () => {
    it('should fetch net profit/loss via RPC successfully', async () => {
      const expectedNetProfit = 3500;
      mockRpc.mockResolvedValueOnce({ data: expectedNetProfit, error: null });
      const netProfit = await getNetProfitLoss(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_net_profit_loss', { _user_id: mockUserId });
      expect(netProfit).toBe(expectedNetProfit);
    });

    it('should calculate net profit/loss via fallback when RPC fails', async () => {
      // Net Profit RPC fails
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      // Revenue RPC fails, fallback succeeds (5000)
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: [{ total_amount: 5000 }], error: null }));
      // Expense RPC fails, fallback succeeds (1500)
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: [{ amount: 1500 }], error: null }));

      const netProfit = await getNetProfitLoss(mockUserId);
      expect(netProfit).toBe(3500);
    });

    it('should return null if RPC and fallbacks fail', async () => {
      mockRpc.mockResolvedValue({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValue(createQueryMock({ data: null, error: { message: 'Table error' } }));

      const netProfit = await getNetProfitLoss(mockUserId);
      expect(netProfit).toBeNull();
    });
  });

  describe('getTotalClientsCount', () => {
    it('should fetch total clients count via RPC successfully', async () => {
      const expectedCount = 10;
      mockRpc.mockResolvedValueOnce({ data: expectedCount, error: null });
      const count = await getTotalClientsCount(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_clients_count', { _user_id: mockUserId });
      expect(count).toBe(expectedCount);
    });

    it('should fallback to direct table query count when RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ count: 10, error: null }));

      const count = await getTotalClientsCount(mockUserId);
      expect(count).toBe(10);
      expect(mockFrom).toHaveBeenCalledWith('clients');
    });

    it('should return null if RPC and fallback fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ count: null, error: { message: 'Table error' } }));

      const count = await getTotalClientsCount(mockUserId);
      expect(count).toBeNull();
    });
  });

  describe('getAverageInvoiceValue', () => {
    it('should fetch average invoice value via RPC successfully', async () => {
      const expectedValue = 250.75;
      mockRpc.mockResolvedValueOnce({ data: expectedValue, error: null });
      const value = await getAverageInvoiceValue(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_average_invoice_value', { _user_id: mockUserId });
      expect(value).toBe(expectedValue);
    });

    it('should calculate average invoice value via fallback when RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: [{ total_amount: 100 }, { total_amount: 300 }], error: null }));

      const value = await getAverageInvoiceValue(mockUserId);
      expect(value).toBe(200);
    });

    it('should return null if RPC and fallback fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: null, error: { message: 'Table error' } }));

      const value = await getAverageInvoiceValue(mockUserId);
      expect(value).toBeNull();
    });
  });

  describe('getTotalInventoryValue', () => {
    it('should fetch total inventory value via RPC successfully', async () => {
      const expectedValue = 12500.00;
      mockRpc.mockResolvedValueOnce({ data: expectedValue, error: null });
      const value = await getTotalInventoryValue(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_inventory_value', { _user_id: mockUserId });
      expect(value).toBe(expectedValue);
    });

    it('should calculate inventory value via fallback when RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(
        createQueryMock({
          data: [
            { quantity_on_hand: 10, unit_price: 100 },
            { quantity_on_hand: 5, unit_price: 200 },
          ],
          error: null,
        })
      );

      const value = await getTotalInventoryValue(mockUserId);
      expect(value).toBe(2000);
    });

    it('should return null if RPC and fallback fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: null, error: { message: 'Table error' } }));

      const value = await getTotalInventoryValue(mockUserId);
      expect(value).toBeNull();
    });
  });

  describe('getTotalOutstandingReceivables', () => {
    it('should fetch total outstanding receivables via RPC successfully', async () => {
      const expectedValue = 3200.50;
      mockRpc.mockResolvedValueOnce({ data: expectedValue, error: null });
      const value = await getTotalOutstandingReceivables(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_total_outstanding_receivables', { _user_id: mockUserId });
      expect(value).toBe(expectedValue);
    });

    it('should calculate outstanding receivables via fallback when RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: [{ total_amount: 1200 }, { total_amount: 2000.5 }], error: null }));

      const value = await getTotalOutstandingReceivables(mockUserId);
      expect(value).toBe(3200.5);
    });

    it('should return null if RPC and fallback fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ data: null, error: { message: 'Table error' } }));

      const value = await getTotalOutstandingReceivables(mockUserId);
      expect(value).toBeNull();
    });
  });

  describe('getNewInvoicesCurrentMonthCount', () => {
    it('should fetch new invoices current month count via RPC successfully', async () => {
      const expectedCount = 5;
      mockRpc.mockResolvedValueOnce({ data: expectedCount, error: null });
      const count = await getNewInvoicesCurrentMonthCount(mockUserId);
      expect(mockRpc).toHaveBeenCalledWith('get_new_invoices_current_month_count', { _user_id: mockUserId });
      expect(count).toBe(expectedCount);
    });

    it('should calculate new invoices count via fallback when RPC fails', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ count: 5, error: null }));

      const count = await getNewInvoicesCurrentMonthCount(mockUserId);
      expect(count).toBe(5);
    });

    it('should return null if RPC and fallback fail', async () => {
      mockRpc.mockResolvedValueOnce({ data: null, error: { message: 'RPC error' } as any });
      mockFrom.mockReturnValueOnce(createQueryMock({ count: null, error: { message: 'Table error' } }));

      const count = await getNewInvoicesCurrentMonthCount(mockUserId);
      expect(count).toBeNull();
    });
  });
});