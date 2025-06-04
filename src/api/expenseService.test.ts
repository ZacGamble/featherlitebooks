import {
  getExpenses,
  getExpenseById,
  createExpense,
  updateExpense,
  deleteExpense,
} from './expenseService';
import { Expense } from '@/types';

// Mock the Supabase client
const mockFrom = jest.fn();
const mockSelect = jest.fn();
const mockInsert = jest.fn();
const mockUpdate = jest.fn();
const mockDelete = jest.fn();
const mockEq = jest.fn();
const mockSingle = jest.fn();
const mockOrder = jest.fn();

jest.mock('@/config/supabase', () => ({
  supabase: {
    from: (...args: any[]) => mockFrom(...args),
  },
}));

// Setup chainable mocks
mockFrom.mockImplementation(() => ({
  select: mockSelect,
  insert: mockInsert,
  update: mockUpdate,
  delete: mockDelete,
}));
mockSelect.mockImplementation(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
mockInsert.mockImplementation(() => ({ select: mockSelect })); 
mockUpdate.mockImplementation(() => ({ eq: mockEq }));
mockDelete.mockImplementation(() => ({ eq: mockEq }));
mockEq.mockImplementation(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));
mockOrder.mockImplementation(() => ({ select: mockSelect })); // order is typically followed by select or another modifier

const mockUserId = 'user-expense-id';
const mockExpenseData: Expense = {
  id: 'exp-123',
  user_id: mockUserId,
  date: new Date().toISOString().split('T')[0], // 'YYYY-MM-DD'
  category: 'Office Supplies',
  description: 'Test Expense Item',
  amount: 75.99,
  vendor_name: 'Supply Co.',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('expenseService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Re-establish default implementations for chainable mocks
    mockFrom.mockImplementation(() => ({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
      }));
    mockSelect.mockImplementation(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
    mockInsert.mockImplementation(() => ({ select: mockSelect }));
    mockUpdate.mockImplementation(() => ({ eq: mockEq }));
    mockDelete.mockImplementation(() => ({ eq: mockEq }));
    mockEq.mockImplementation(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));
    mockOrder.mockImplementation(() => ({ select: mockSelect })); 
  });

  describe('getExpenses', () => {
    it('should fetch expenses successfully', async () => {
      // supabase.from(...).select(...).eq(...).order(...)
      mockOrder.mockResolvedValueOnce({ data: [mockExpenseData], error: null });
      
      const result = await getExpenses(mockUserId);
      expect(mockFrom).toHaveBeenCalledWith('expenses');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockOrder).toHaveBeenCalledWith('expense_date', { ascending: false });
      expect(result.data).toEqual([mockExpenseData]);
      expect(result.error).toBeNull();
    });

    it('should return an error if fetching expenses fails', async () => {
      const errorMessage = 'Failed to fetch expenses';
      mockOrder.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await getExpenses(mockUserId);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('getExpenseById', () => {
    it('should fetch an expense by ID successfully', async () => {
      // from(...).select(...).eq(...).single()
      mockSingle.mockResolvedValueOnce({ data: mockExpenseData, error: null });
      const result = await getExpenseById('exp-123');
      expect(mockFrom).toHaveBeenCalledWith('expenses');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'exp-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockExpenseData);
      expect(result.error).toBeNull();
    });

    it('should return null data if expense not found', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: null });
        const result = await getExpenseById('exp-404');
        expect(result.data).toBeNull();
        expect(result.error).toBeNull();
    });

    it('should return an error if fetching expense by ID fails', async () => {
      const errorMessage = 'Failed to fetch expense by ID';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await getExpenseById('exp-123');
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('createExpense', () => {
    const newExpensePayload: Omit<Expense, 'id' | 'created_at' | 'updated_at'> = {
      user_id: mockUserId,
      date: new Date().toISOString().split('T')[0],
      category: 'Travel',
      description: 'Conference Trip',
      amount: 350.00,
    };
    it('should create an expense successfully', async () => {
      // from(...).insert(...).select(...).single()
      const createdExpense = { ...newExpensePayload, id: 'exp-new', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockSingle.mockResolvedValueOnce({ data: createdExpense, error: null }); 
      const result = await createExpense(newExpensePayload);
      expect(mockFrom).toHaveBeenCalledWith('expenses');
      expect(mockInsert).toHaveBeenCalledWith(newExpensePayload);
      expect(mockSelect).toHaveBeenCalledWith(); // .select() without args
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(createdExpense);
      expect(result.error).toBeNull();
    });

    it('should return an error if creating expense fails', async () => {
      const errorMessage = 'Failed to create expense';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await createExpense(newExpensePayload);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('updateExpense', () => {
    const updates: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
      description: 'Updated Expense Description',
      amount: 80.00,
    };
    it('should update an expense successfully', async () => {
      // from(...).update(...).eq(...).select(...).single()
      const updatedExpense = { ...mockExpenseData, ...updates };
      mockSingle.mockResolvedValueOnce({ data: updatedExpense, error: null }); 
      const result = await updateExpense('exp-123', updates);
      expect(mockFrom).toHaveBeenCalledWith('expenses');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'exp-123');
      expect(mockSelect).toHaveBeenCalledWith(); // .select() without args
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedExpense);
      expect(result.error).toBeNull();
    });

    it('should return an error if updating expense fails', async () => {
      const errorMessage = 'Failed to update expense';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await updateExpense('exp-123', updates);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense successfully', async () => {
      // from(...).delete().eq(...)
      mockEq.mockResolvedValueOnce({ error: null, data: null }); 
      const result = await deleteExpense('exp-123');
      expect(mockFrom).toHaveBeenCalledWith('expenses');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'exp-123');
      expect(result.error).toBeNull();
    });

    it('should return an error if deleting expense fails', async () => {
      const errorMessage = 'Failed to delete expense';
      mockEq.mockResolvedValueOnce({ error: { message: errorMessage } as any, data: null });
      const result = await deleteExpense('exp-123');
      expect(result.error?.message).toBe(errorMessage);
    });
  });
}); 