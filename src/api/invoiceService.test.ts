import {
  getInvoices,
  getInvoiceById,
  createInvoice,
  updateInvoice,
  deleteInvoice,
  addLineItems,
  updateLineItem,
  deleteLineItem,
  getLineItemsForInvoice,
} from './invoiceService';
import { Invoice, InvoiceLineItem, Client } from '@/types';

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

const mockUserId = 'user-invoice-id';

const mockClientData: Client = {
  id: 'client-abc',
  user_id: mockUserId,
  name: 'Mock Client Inc.',
  email: 'client@example.com',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockInvoiceLineItemData: InvoiceLineItem = {
  id: 'li-1',
  invoice_id: 'inv-123',
  user_id: mockUserId,
  description: 'Test Line Item',
  quantity: 2,
  unit_price: 50,
  line_total: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

const mockInvoiceData: Invoice = {
  id: 'inv-123',
  user_id: mockUserId,
  client_id: mockClientData.id,
  invoice_number: 'INV-001',
  invoice_date: new Date().toISOString().split('T')[0],
  due_date: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0],
  status: 'draft',
  subtotal: 100,
  total_amount: 100,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
  client: { id: mockClientData.id, name: mockClientData.name } as any, // Simplified for getInvoices
  line_items: [mockInvoiceLineItemData],
};


describe('invoiceService', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Default mock implementations (can be overridden in specific tests)
    mockFrom.mockImplementation(() => ({
      select: mockSelect,
      insert: mockInsert,
      update: mockUpdate,
      delete: mockDelete,
    }));
    mockSelect.mockImplementation(() => ({
      eq: mockEq,
      order: mockOrder,
      single: mockSingle,
    }));
    mockInsert.mockImplementation(() => ({
      select: mockSelect, // General case, used by addLineItems
    }));
    mockUpdate.mockImplementation(() => ({ 
        eq: mockEq 
    }));
    mockDelete.mockImplementation(() => ({ 
        eq: mockEq 
    }));
    mockEq.mockImplementation(() => ({
      select: mockSelect,
      single: mockSingle,
      order: mockOrder, // Though less common directly after eq for these services
      // For delete operations, .eq() is often terminal or followed by nothing that returns data
      // It will resolve with { error } or { data, error }
    }));
    mockOrder.mockImplementation(() => ({})); // Resolves with {data, error} as it is terminal for getInvoices
    mockSingle.mockImplementation(() => ({})); // Resolves with {data, error}
  });

  describe('getInvoices', () => {
    it('should fetch invoices successfully', async () => {
      const expectedSelectArg = `\n      *,
      client:clients (id, name)\n    `;
      mockFrom.mockReturnValueOnce({ select: mockSelect });
      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ order: mockOrder });
      mockOrder.mockResolvedValueOnce({ data: [mockInvoiceData], error: null });

      const result = await getInvoices(mockUserId);
      expect(mockFrom).toHaveBeenCalledWith('invoices');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('client:clients (id, name)'));
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockOrder).toHaveBeenCalledWith('invoice_date', { ascending: false });
      expect(result.data).toEqual([mockInvoiceData]);
      expect(result.error).toBeNull();
    });
    it('should return error if fetching invoices fails', async () => {
        mockOrder.mockResolvedValueOnce({ data: null, error: {message: 'Fetch error'} as any});
        const result = await getInvoices(mockUserId);
        expect(result.error).not.toBeNull();
    });
  });

  describe('getInvoiceById', () => {
    it('should fetch an invoice by ID successfully', async () => {
      const expectedSelectArg = `\n      *,
      client:clients (*),
      line_items:invoice_line_items (*)\n    `;
      mockFrom.mockReturnValueOnce({ select: mockSelect });
      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ single: mockSingle });
      mockSingle.mockResolvedValueOnce({ data: mockInvoiceData, error: null });
      
      const result = await getInvoiceById('inv-123');
      expect(mockFrom).toHaveBeenCalledWith('invoices');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('client:clients (*)'));
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('line_items:invoice_line_items (*)'));
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-123');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockInvoiceData);
      expect(result.error).toBeNull();
    });
    it('should return error if fetching invoice by id fails', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: {message: 'Fetch by ID error'} as any});
        const result = await getInvoiceById('inv-123');
        expect(result.error).not.toBeNull();
    });
  });

  describe('createInvoice', () => {
    const newInvoicePayload = { user_id: mockUserId, client_id: 'client-abc', invoice_number: 'INV-002', invoice_date: '2023-01-15', due_date: '2023-02-15', status: 'draft', subtotal: 200, total_amount: 200 } as Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'client' | 'line_items'>;
    const newLineItemsPayload = [{ user_id: mockUserId, description: 'Service X', quantity: 1, unit_price: 200, line_total: 200 }] as Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at' | 'inventory_item'>[];

    it('should create an invoice with line items successfully', async () => {
      const createdInvoiceId = 'inv-new-id';
      const createdInvoiceData = { ...newInvoicePayload, id: createdInvoiceId, created_at: 'date', updated_at: 'date' };
      const createdLineItemData = { ...newLineItemsPayload[0], id: 'li-new-id', invoice_id: createdInvoiceId, created_at: 'date', updated_at: 'date' };
      
      // Mock for invoice creation: from().insert().select().single()
      mockFrom.mockImplementation((table: string) => {
        if (table === 'invoices') {
            return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValueOnce({ data: createdInvoiceData, error: null }) }) }) };
        }
        // Mock for line item creation: from().insert().select()
        if (table === 'invoice_line_items') {
            return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValueOnce({ data: [createdLineItemData], error: null }) }) };
        }
        return { select: mockSelect, insert: mockInsert }; // Default
      });

      const result = await createInvoice(newInvoicePayload, newLineItemsPayload);

      expect(mockFrom).toHaveBeenCalledWith('invoices');
      expect(mockFrom).toHaveBeenCalledWith('invoice_line_items');
      expect(result.data?.id).toBe(createdInvoiceId);
      expect(result.data?.line_items).toEqual([createdLineItemData]);
      expect(result.error).toBeNull();
    });

    it('should create an invoice successfully without line items', async () => {
      const createdInvoiceId = 'inv-new-no-lines';
      const createdInvoiceData = { ...newInvoicePayload, id: createdInvoiceId, created_at: 'date', updated_at: 'date' };
      
      mockFrom.mockImplementation((table: string) => {
        if (table === 'invoices') {
            return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValueOnce({ data: createdInvoiceData, error: null }) }) }) };
        }
        // No call to invoice_line_items expected
        return { select: mockSelect, insert: mockInsert }; 
      });

      const result = await createInvoice(newInvoicePayload, []); // Pass empty array for line items

      expect(mockFrom).toHaveBeenCalledWith('invoices');
      expect(mockFrom).not.toHaveBeenCalledWith('invoice_line_items'); // Ensure line items table not called
      expect(result.data?.id).toBe(createdInvoiceId);
      expect(result.data?.line_items).toEqual([]); // Expect empty array for line items
      expect(result.error).toBeNull();
    });

    it('should return error if invoice creation fails', async () => {
        mockFrom.mockImplementation((table: string) => {
            if (table === 'invoices') {
                return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValueOnce({ data: null, error: {message: 'Invoice creation error'} as any }) }) }) };
            }
            return { select: mockSelect, insert: mockInsert };
          });
        const result = await createInvoice(newInvoicePayload, newLineItemsPayload);
        expect(result.error).not.toBeNull();
    });

    it('should return error if line item creation fails', async () => {
        const createdInvoiceId = 'inv-new-id-2';
        const createdInvoiceData = { ...newInvoicePayload, id: createdInvoiceId, created_at: 'date', updated_at: 'date' };
        mockFrom.mockImplementation((table: string) => {
            if (table === 'invoices') {
                return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValueOnce({ data: createdInvoiceData, error: null }) }) }) };
            }
            if (table === 'invoice_line_items') {
                return { insert: jest.fn().mockReturnValue({ select: jest.fn().mockResolvedValueOnce({ data: null, error: {message: 'Line item creation error'} as any }) }) };
            }
            return { select: mockSelect, insert: mockInsert };
          });
        const result = await createInvoice(newInvoicePayload, newLineItemsPayload);
        expect(result.error).not.toBeNull();
    });
  });

  describe('updateInvoice', () => {
    const updates = { notes: 'Updated notes' };
    it('should update an invoice successfully', async () => {
      const updatedInvoiceData = { ...mockInvoiceData, ...updates };
      mockFrom.mockReturnValueOnce({ update: mockUpdate });
      mockUpdate.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ select: mockSelect });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockSingle.mockResolvedValueOnce({ data: updatedInvoiceData, error: null });

      const result = await updateInvoice('inv-123', updates);
      expect(mockFrom).toHaveBeenCalledWith('invoices');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'inv-123');
      expect(mockSelect).toHaveBeenCalledWith(expect.stringContaining('client:clients (*)'));
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedInvoiceData);
      expect(result.error).toBeNull();
    });
    it('should return error if update fails', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: {message: 'Update error'} as any});
        const result = await updateInvoice('inv-123', updates);
        expect(result.error).not.toBeNull();
    });
  });

  describe('deleteInvoice', () => {
    it('should delete an invoice and its line items successfully', async () => {
        // Mock for line item deletion: from().delete().eq()
        // Mock for invoice deletion: from().delete().eq()
        mockFrom.mockImplementation((table: string) => {
            if (table === 'invoice_line_items') {
              return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValueOnce({ error: null }) }) };
            }
            if (table === 'invoices') {
              return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValueOnce({ error: null }) }) };
            }
            return { delete: mockDelete }; // Default
          });

      const result = await deleteInvoice('inv-123');
      expect(mockFrom).toHaveBeenCalledWith('invoice_line_items');
      expect(mockFrom).toHaveBeenCalledWith('invoices');
      expect(result.error).toBeNull();
    });

    it('should return error if line item deletion fails', async () => {
        mockFrom.mockImplementation((table: string) => {
            if (table === 'invoice_line_items') {
              return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValueOnce({ error: {message: 'Line item delete error'} as any }) }) };
            }
            return { delete: mockDelete };
          });
        const result = await deleteInvoice('inv-123');
        expect(result.error).not.toBeNull();
    });
    
    it('should return error if invoice deletion fails (after line items deleted)', async () => {
        mockFrom.mockImplementation((table: string) => {
            if (table === 'invoice_line_items') {
              return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValueOnce({ error: null }) }) };
            }
            if (table === 'invoices') {
              return { delete: jest.fn().mockReturnValue({ eq: jest.fn().mockResolvedValueOnce({ error: {message: 'Invoice delete error'} as any }) }) };
            }
            return { delete: mockDelete };
          });
        const result = await deleteInvoice('inv-123');
        expect(result.error).not.toBeNull();
    });
  });

  describe('addLineItems', () => {
    const newLineItems = [{ description: 'New Service', quantity: 1, unit_price: 50, line_total: 50 }] as Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'user_id' | 'created_at' | 'updated_at' | 'inventory_item'>[];
    it('should add line items successfully', async () => {
      const addedItems = [{...newLineItems[0], id: 'li-new', invoice_id: 'inv-123', user_id: mockUserId }];
      mockFrom.mockReturnValueOnce({ insert: mockInsert });
      mockInsert.mockReturnValueOnce({ select: mockSelect });
      mockSelect.mockResolvedValueOnce({ data: addedItems, error: null });

      const result = await addLineItems('inv-123', mockUserId, newLineItems);
      expect(mockFrom).toHaveBeenCalledWith('invoice_line_items');
      expect(mockInsert).toHaveBeenCalledWith(expect.arrayContaining([expect.objectContaining({invoice_id: 'inv-123'})]));
      expect(mockSelect).toHaveBeenCalledWith(); // select() is called without arguments
      expect(result.data).toEqual(addedItems);
      expect(result.error).toBeNull();
    });
    it('should return error if adding line items fails', async () => {
        mockSelect.mockResolvedValueOnce({ data: null, error: {message: 'Add line items error'} as any});
        const result = await addLineItems('inv-123', mockUserId, newLineItems);
        expect(result.error).not.toBeNull();
    });
  });

  describe('updateLineItem', () => {
    const updates = { quantity: 3, line_total: 150 };
    it('should update a line item successfully', async () => {
      const updatedLineItem = { ...mockInvoiceLineItemData, ...updates };
      mockFrom.mockReturnValueOnce({ update: mockUpdate });
      mockUpdate.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockReturnValueOnce({ select: mockSelect });
      mockSelect.mockReturnValueOnce({ single: mockSingle });
      mockSingle.mockResolvedValueOnce({ data: updatedLineItem, error: null });

      const result = await updateLineItem('li-1', updates);
      expect(mockFrom).toHaveBeenCalledWith('invoice_line_items');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', 'li-1');
      expect(mockSelect).toHaveBeenCalledWith();
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedLineItem);
      expect(result.error).toBeNull();
    });
    it('should return error if update fails', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: {message: 'Update line item error'} as any});
        const result = await updateLineItem('li-1', updates);
        expect(result.error).not.toBeNull();
    });
  });

  describe('deleteLineItem', () => {
    it('should delete a line item successfully', async () => {
      mockFrom.mockReturnValueOnce({ delete: mockDelete });
      mockDelete.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockResolvedValueOnce({ error: null }); // Delete often just returns error

      const result = await deleteLineItem('li-1');
      expect(mockFrom).toHaveBeenCalledWith('invoice_line_items');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', 'li-1');
      expect(result.error).toBeNull();
    });
    it('should return error if delete fails', async () => {
        mockEq.mockResolvedValueOnce({ error: {message: 'Delete line item error'} as any });
        const result = await deleteLineItem('li-1');
        expect(result.error).not.toBeNull();
    });
  });

  describe('getLineItemsForInvoice', () => {
    it('should fetch line items for an invoice successfully', async () => {
      mockFrom.mockReturnValueOnce({ select: mockSelect });
      mockSelect.mockReturnValueOnce({ eq: mockEq });
      mockEq.mockResolvedValueOnce({ data: [mockInvoiceLineItemData], error: null });

      const result = await getLineItemsForInvoice('inv-123');
      expect(mockFrom).toHaveBeenCalledWith('invoice_line_items');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('invoice_id', 'inv-123');
      expect(result.data).toEqual([mockInvoiceLineItemData]);
      expect(result.error).toBeNull();
    });
    it('should return error if fetching line items fails', async () => {
        mockEq.mockResolvedValueOnce({ data: null, error: {message: 'Fetch line items error'} as any});
        const result = await getLineItemsForInvoice('inv-123');
        expect(result.error).not.toBeNull();
    });
  });
}); 