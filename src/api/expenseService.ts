import { supabase } from '@/config/supabase';
import { Expense } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

const EXPENSES_TABLE = 'expenses';

/**
 * Fetches all expenses for a given user.
 * @param userId The ID of the user whose expenses to fetch.
 * @returns A promise that resolves to an object containing the expenses data or an error.
 */
export const getExpenses = async (userId: string): Promise<{ data: Expense[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(EXPENSES_TABLE)
    .select('*')
    .eq('user_id', userId)
    .order('expense_date', { ascending: false });
};

/**
 * Fetches a single expense by its ID.
 * @param expenseId The ID of the expense to fetch.
 * @returns A promise that resolves to an object containing the expense data or an error.
 */
export const getExpenseById = async (expenseId: string): Promise<{ data: Expense | null; error: PostgrestError | null }> => {
  return supabase
    .from(EXPENSES_TABLE)
    .select('*')
    .eq('id', expenseId)
    .single();
};

/**
 * Creates a new expense.
 * @param expenseData The data for the new expense (excluding id, created_at, updated_at).
 * @returns A promise that resolves to an object containing the newly created expense data or an error.
 */
export const createExpense = async (
  expenseData: Omit<Expense, 'id' | 'created_at' | 'updated_at'>
): Promise<{ data: Expense | null; error: PostgrestError | null }> => {
  return supabase
    .from(EXPENSES_TABLE)
    .insert(expenseData)
    .select()
    .single();
};

/**
 * Updates an existing expense.
 * @param expenseId The ID of the expense to update.
 * @param expenseData The partial data to update the expense with.
 * @returns A promise that resolves to an object containing the updated expense data or an error.
 */
export const updateExpense = async (
  expenseId: string,
  expenseData: Partial<Omit<Expense, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
): Promise<{ data: Expense | null; error: PostgrestError | null }> => {
  return supabase
    .from(EXPENSES_TABLE)
    .update(expenseData)
    .eq('id', expenseId)
    .select()
    .single();
};

/**
 * Deletes an expense by its ID.
 * @param expenseId The ID of the expense to delete.
 * @returns A promise that resolves to an object containing an error if one occurred.
 */
export const deleteExpense = async (expenseId: string): Promise<{ error: PostgrestError | null }> => {
  const { error } = await supabase
    .from(EXPENSES_TABLE)
    .delete()
    .eq('id', expenseId);
  return { error };
};

// Add more specific functions as needed, e.g., filter by category, date range, sum expenses. 