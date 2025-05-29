import { supabase } from '@/config/supabase';
import { InventoryItem } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'inventory_items';

/**
 * Fetches all inventory items for a given user.
 */
export const getInventoryItems = async (userId: string): Promise<{ data: InventoryItem[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);
};

/**
 * Fetches a single inventory item by its ID.
 */
export const getInventoryItemById = async (itemId: string): Promise<{ data: InventoryItem | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', itemId)
    .single();
};

/**
 * Adds a new inventory item.
 */
export const addInventoryItem = async (itemData: Omit<InventoryItem, 'id'>): Promise<{ data: InventoryItem[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .insert([itemData])
    .select(); 
};

/**
 * Updates an existing inventory item.
 */
export const updateInventoryItem = async (itemId: string, itemData: Partial<InventoryItem>): Promise<{ data: InventoryItem[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .update(itemData)
    .eq('id', itemId)
    .select();
};

/**
 * Deletes an inventory item by its ID.
 */
export const deleteInventoryItem = async (itemId: string): Promise<{ error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', itemId);
};

// Add more specific functions as needed, e.g., search, filter by category, adjust stock levels. 