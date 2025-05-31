import { supabase } from '@/config/supabase';
import { Client } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'clients';

/**
 * Fetches all clients for a given user.
 * @param userId The ID of the user whose clients to fetch.
 * @returns A promise that resolves to an object containing the client data or an error.
 */
export const getClients = async (userId: string): Promise<{ data: Client[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
};

/**
 * Fetches a single client by its ID.
 * @param clientId The ID of the client to fetch.
 * @returns A promise that resolves to an object containing the client data or an error.
 */
export const getClientById = async (clientId: string): Promise<{ data: Client | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', clientId)
    .single();
};

/**
 * Creates a new client.
 * The clientData should include the user_id.
 * System-generated fields like id, created_at, updated_at should be omitted.
 * @param clientData The data for the new client.
 * @returns A promise that resolves to an object containing the newly created client data or an error.
 */
export const createClient = async (clientData: Omit<Client, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: Client | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .insert(clientData)
    .select('*')
    .single(); 
};

/**
 * Updates an existing client.
 * @param clientId The ID of the client to update.
 * @param clientData The partial data to update the client with.
 * @returns A promise that resolves to an object containing the updated client data or an error.
 */
export const updateClient = async (clientId: string, clientData: Partial<Omit<Client, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ data: Client | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .update(clientData)
    .eq('id', clientId)
    .select('*')
    .single();
};

/**
 * Deletes a client by its ID.
 * @param clientId The ID of the client to delete.
 * @returns A promise that resolves to an object containing an error if one occurred, or null otherwise.
 */
export const deleteClient = async (clientId: string): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', clientId);
  return { error };
};