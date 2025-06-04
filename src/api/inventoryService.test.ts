import {
  getInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
} from './inventoryService';
import { InventoryItem } from '@/types';

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
mockInsert.mockImplementation(() => ({ select: mockSelect })); // Changed to match service: insert(...).select(...).single()
mockUpdate.mockImplementation(() => ({ eq: mockEq }));
mockDelete.mockImplementation(() => ({ eq: mockEq }));
mockEq.mockImplementation(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));
mockOrder.mockImplementation(() => ({ select: mockSelect }));

const mockUserId = 'user-inv-id';
const mockInventoryItemData: InventoryItem = {
  id: 'inv-item-123',
  user_id: mockUserId,
  name: 'Test Item Alpha',
  sku: 'TIA-001',
  description: 'A test inventory item',
  quantity_on_hand: 100,
  unit_price: 19.99,
  low_stock_threshold: 10,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('inventoryService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockFrom.mockImplementation(() => ({
        select: mockSelect,
        insert: mockInsert,
        update: mockUpdate,
        delete: mockDelete,
      }));
    mockSelect.mockImplementation(() => ({ eq: mockEq, order: mockOrder, single: mockSingle }));
    // For create: from(...).insert(...).select(...).single()
    // For update: from(...).update(...).eq(...).select(...).single()
    // select() called after insert/update should return an object that has single()
    mockInsert.mockImplementation(() => ({ select: jest.fn().mockReturnValue({ single: mockSingle }) })); 
    mockUpdate.mockImplementation(() => ({ 
      eq: jest.fn().mockReturnValue({ 
        select: jest.fn().mockReturnValue({ single: mockSingle })
      })
    }));
    mockDelete.mockImplementation(() => ({ eq: mockEq }));
    mockEq.mockImplementation(() => ({ single: mockSingle, select: mockSelect, order: mockOrder }));
    mockOrder.mockImplementation(() => ({ select: mockSelect })); 
  });

  describe('getInventoryItems', () => {
    it('should fetch inventory items successfully', async () => {
      mockOrder.mockResolvedValueOnce({ data: [mockInventoryItemData], error: null });
      const result = await getInventoryItems(mockUserId);
      expect(mockFrom).toHaveBeenCalledWith('inventory_items');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      expect(result.data).toEqual([mockInventoryItemData]);
      expect(result.error).toBeNull();
    });

    it('should return an error if fetching items fails', async () => {
      const errorMessage = 'Failed to fetch items';
      mockOrder.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await getInventoryItems(mockUserId);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('getInventoryItemById', () => {
    it('should fetch an item by ID successfully', async () => {
      mockSingle.mockResolvedValueOnce({ data: mockInventoryItemData, error: null });
      const result = await getInventoryItemById('inv-item-123');
      expect(mockFrom).toHaveBeenCalledWith('inventory_items');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-item-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockInventoryItemData);
      expect(result.error).toBeNull();
    });

    it('should return null data if item not found', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: null });
        const result = await getInventoryItemById('inv-404');
        expect(result.data).toBeNull();
        expect(result.error).toBeNull();
    });

    it('should return an error if fetching item by ID fails', async () => {
      const errorMessage = 'Failed to fetch item by ID';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await getInventoryItemById('inv-item-123');
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('createInventoryItem', () => {
    const newItemPayload: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'> = {
      user_id: mockUserId,
      name: 'New Item Beta',
      quantity_on_hand: 50,
      unit_price: 9.99,
    };
    it('should create an item successfully', async () => {
      const createdItem = { ...newItemPayload, id: 'inv-new', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockSingle.mockResolvedValueOnce({ data: createdItem, error: null }); 
      const result = await createInventoryItem(newItemPayload);
      expect(mockFrom).toHaveBeenCalledWith('inventory_items');
      expect(mockInsert).toHaveBeenCalledWith(newItemPayload);
      // expect(mockInsert().select).toHaveBeenCalledWith('*'); // select is called with '*' by the service
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(createdItem);
      expect(result.error).toBeNull();
    });

    it('should return an error if creating item fails', async () => {
      const errorMessage = 'Failed to create item';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await createInventoryItem(newItemPayload);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('updateInventoryItem', () => {
    const updates: Partial<Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>> = {
      description: 'Updated Item Description',
      quantity_on_hand: 120,
    };
    it('should update an item successfully', async () => {
      const updatedItem = { ...mockInventoryItemData, ...updates };
      mockSingle.mockResolvedValueOnce({ data: updatedItem, error: null }); 
      const result = await updateInventoryItem('inv-item-123', updates);
      expect(mockFrom).toHaveBeenCalledWith('inventory_items');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      // expect(mockUpdate().eq).toHaveBeenCalledWith('id', 'inv-item-123');
      // expect(mockUpdate().eq().select).toHaveBeenCalledWith('*');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedItem);
      expect(result.error).toBeNull();
    });

    it('should return an error if updating item fails', async () => {
      const errorMessage = 'Failed to update item';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await updateInventoryItem('inv-item-123', updates);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('deleteInventoryItem', () => {
    it('should delete an item successfully', async () => {
      mockEq.mockResolvedValueOnce({ error: null, data: null }); 
      const result = await deleteInventoryItem('inv-item-123');
      expect(mockFrom).toHaveBeenCalledWith('inventory_items');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-item-123');
      expect(result.error).toBeNull();
    });

    it('should return an error if deleting item fails', async () => {
      const errorMessage = 'Failed to delete item';
      mockEq.mockResolvedValueOnce({ error: { message: errorMessage } as any, data: null });
      const result = await deleteInventoryItem('inv-item-123');
      expect(result.error?.message).toBe(errorMessage);
    });
  });
}); 