import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
} from './clientService';
import { Client } from '@/types';

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

const mockUserId = 'user-abc';
const mockClientData: Client = {
  id: '123',
  user_id: mockUserId,
  name: 'Test Client',
  email: 'test@example.com',
  phone: '1234567890',
  address_line1: '123 Test St',
  city: 'Testville',
  state_province: 'TS',
  postal_code: '12345',
  country: 'TC',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

describe('clientService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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

  describe('getClients', () => {
    it('should fetch clients successfully', async () => {
      mockOrder.mockResolvedValueOnce({ data: [mockClientData], error: null });
      
      const result = await getClients(mockUserId);
      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('user_id', mockUserId);
      expect(mockOrder).toHaveBeenCalledWith('name', { ascending: true });
      expect(result.data).toEqual([mockClientData]);
      expect(result.error).toBeNull();
    });

    it('should return an error if fetching clients fails', async () => {
      const errorMessage = 'Failed to fetch clients';
      mockOrder.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await getClients(mockUserId);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('getClientById', () => {
    it('should fetch a client by ID successfully', async () => {
      mockSingle.mockResolvedValueOnce({ data: mockClientData, error: null });
      const result = await getClientById('123');
      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(mockClientData);
      expect(result.error).toBeNull();
    });

    it('should return null data if client not found (no error from supabase)', async () => {
        mockSingle.mockResolvedValueOnce({ data: null, error: null });
        const result = await getClientById('404');
        expect(result.data).toBeNull();
        expect(result.error).toBeNull();
    });

    it('should return an error if fetching client by ID fails', async () => {
      const errorMessage = 'Failed to fetch client by ID';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await getClientById('123');
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('createClient', () => {
    const newClientPayload: Omit<Client, 'id' | 'created_at' | 'updated_at'> = {
      user_id: mockUserId,
      name: 'New Client',
      email: 'new@example.com',
    };
    it('should create a client successfully', async () => {
      const createdClient = { ...newClientPayload, id: 'new-id', created_at: new Date().toISOString(), updated_at: new Date().toISOString() };
      mockSingle.mockResolvedValueOnce({ data: createdClient, error: null }); 
      const result = await createClient(newClientPayload);
      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockInsert).toHaveBeenCalledWith(newClientPayload);
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(createdClient);
      expect(result.error).toBeNull();
    });

    it('should return an error if creating client fails', async () => {
      const errorMessage = 'Failed to create client';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await createClient(newClientPayload);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('updateClient', () => {
    const updates: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>
> = {
      name: 'Updated Client Name',
    };
    it('should update a client successfully', async () => {
      const updatedClient = { ...mockClientData, ...updates };
      mockSingle.mockResolvedValueOnce({ data: updatedClient, error: null }); 
      const result = await updateClient('123', updates);
      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockUpdate).toHaveBeenCalledWith(updates);
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockSingle).toHaveBeenCalled();
      expect(result.data).toEqual(updatedClient);
      expect(result.error).toBeNull();
    });

    it('should return an error if updating client fails', async () => {
      const errorMessage = 'Failed to update client';
      mockSingle.mockResolvedValueOnce({ data: null, error: { message: errorMessage } as any });
      const result = await updateClient('123', updates);
      expect(result.data).toBeNull();
      expect(result.error?.message).toBe(errorMessage);
    });
  });

  describe('deleteClient', () => {
    it('should delete a client successfully', async () => {
      mockEq.mockResolvedValueOnce({ error: null, data: null }); 
      const result = await deleteClient('123');
      expect(mockFrom).toHaveBeenCalledWith('clients');
      expect(mockDelete).toHaveBeenCalled();
      expect(mockEq).toHaveBeenCalledWith('id', '123');
      expect(result.error).toBeNull();
    });

    it('should return an error if deleting client fails', async () => {
      const errorMessage = 'Failed to delete client';
      mockEq.mockResolvedValueOnce({ error: { message: errorMessage } as any, data: null });
      const result = await deleteClient('123');
      expect(result.error?.message).toBe(errorMessage);
    });
  });
}); 