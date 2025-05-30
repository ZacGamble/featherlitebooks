import { supabase } from '@/config/supabase';
import { InventoryItem } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'inventory_items';

/**
 * Fetches all inventory items for a given user.
 * @param userId The ID of the user whose inventory items to fetch.
 * @returns A promise that resolves to an object containing the inventory data or an error.
 */
export const getInventoryItems = async (userId: string): Promise<{ data: InventoryItem[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId)
    .order('name', { ascending: true });
};

/**
 * Fetches a single inventory item by its ID.
 * @param itemId The ID of the inventory item to fetch.
 * @returns A promise that resolves to an object containing the item data or an error.
 */
export const getInventoryItemById = async (itemId: string): Promise<{ data: InventoryItem | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', itemId)
    .single();
};

/**
 * Creates a new inventory item.
 * The itemData must include user_id, name, quantity, and unit_price.
 * System-generated fields (id, created_at, updated_at) should be omitted.
 * @param itemData The data for the new inventory item.
 * @returns A promise that resolves to an object containing the newly created item data or an error.
 */
export const createInventoryItem = async (itemData: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<{ data: InventoryItem | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .insert(itemData)
    .select('*')
    .single(); 
};

/**
 * Updates an existing inventory item.
 * @param itemId The ID of the item to update.
 * @param itemData The partial data to update the item with.
 * @returns A promise that resolves to an object containing the updated item data or an error.
 */
export const updateInventoryItem = async (itemId: string, itemData: Partial<Omit<InventoryItem, 'id' | 'user_id' | 'created_at' | 'updated_at'>>): Promise<{ data: InventoryItem | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .update(itemData)
    .eq('id', itemId)
    .select('*')
    .single();
};

/**
 * Deletes an inventory item by its ID.
 * @param itemId The ID of the item to delete.
 * @returns A promise that resolves to an object containing an error if one occurred, or null otherwise.
 */
export const deleteInventoryItem = async (itemId: string): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', itemId);
  return { error };
};

// Add more specific functions as needed, e.g., search, filter by category, adjust stock levels. 