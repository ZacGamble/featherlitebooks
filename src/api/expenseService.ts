import { supabase } from '@/config/supabase';
import { Expense } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

const TABLE_NAME = 'expenses';

/**
 * Fetches all expenses for a given user.
 */
export const getExpenses = async (userId: string): Promise<{ data: Expense[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('user_id', userId);
    // Add .order() as needed, e.g., by date descending
};

/**
 * Fetches a single expense by its ID.
 */
export const getExpenseById = async (expenseId: string): Promise<{ data: Expense | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .select('*')
    .eq('id', expenseId)
    .single();
};

/**
 * Adds a new expense record.
 */
export const addExpense = async (expenseData: Omit<Expense, 'id'>): Promise<{ data: Expense[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .insert([expenseData])
    .select();
};

/**
 * Updates an existing expense record.
 */
export const updateExpense = async (expenseId: string, expenseData: Partial<Expense>): Promise<{ data: Expense[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .update(expenseData)
    .eq('id', expenseId)
    .select();
};

/**
 * Deletes an expense record by its ID.
 */
export const deleteExpense = async (expenseId: string): Promise<{ error: PostgrestError | null }> => {
  return supabase
    .from(TABLE_NAME)
    .delete()
    .eq('id', expenseId);
};

// Add more specific functions as needed, e.g., filter by category, date range, sum expenses. 