import { supabase } from '@/config/supabase';
import { Client } from '@/types'; // Assuming Client type is in global types
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'clients';

/**
 * Fetches all clients for a given user.
 */
export const getClients = async (userId: string): Promise<{ data: Client[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);
    // Add .order() as needed, e.g., by name
};

/**
 * Fetches a single client by its ID.
 */
export const getClientById = async (clientId: string): Promise<{ data: Client | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', clientId)
    .single();
};

/**
 * Adds a new client.
 * Ensure clientData includes user_id if your table requires it.
 */
export const addClient = async (clientData: Omit<Client, 'id'>): Promise<{ data: Client[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .insert([clientData])
    .select(); 
};

/**
 * Updates an existing client.
 */
export const updateClient = async (clientId: string, clientData: Partial<Client>): Promise<{ data: Client[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .update(clientData)
    .eq('id', clientId)
    .select();
};

/**
 * Deletes a client by its ID.
 */
export const deleteClient = async (clientId: string): Promise<{ error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', clientId);
};

// TODO: Add functions for searching clients, etc. 