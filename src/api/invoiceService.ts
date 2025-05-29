import { supabase } from '@/config/supabase';
import { Invoice, InvoiceLineItem } from '@/types'; // Assuming Client type is handled or embedded
import { PostgrestError } from '@supabase/supabase-js';

const INVOICE_TABLE = 'invoices';
const LINE_ITEM_TABLE = 'invoice_line_items'; // Example, adjust if line items are part of JSONB or separate

/**
 * Fetches all invoices for a given user, optionally joining client data.
 */
export const getInvoices = async (userId: string): Promise<{ data: Invoice[] | null; error: PostgrestError | null }> => {
  // Example: Fetch invoices and basic client info (name). Adjust to your schema.
  // This assumes your 'invoices' table has a 'client_id' and you have a 'clients' table.
  return supabase
    .from(INVOICE_TABLE)
    .select(`
      *,
      client:clients (id, name) 
    `)
    .eq('user_id', userId); 
    // Add .order() as needed
};

/**
 * Fetches a single invoice by its ID, including line items and client data.
 */
export const getInvoiceById = async (invoiceId: string): Promise<{ data: Invoice | null; error: PostgrestError | null }> => {
  return supabase
    .from(INVOICE_TABLE)
    .select(`
      *,
      client:clients (id, name, email),
      invoice_line_items (*)
    `)
    .eq('id', invoiceId)
    .single();
};

/**
 * Adds a new invoice along with its line items.
 * This is a simplified example. True transactional behavior might need a DB function.
 */
export const addInvoice = async (invoiceData: Omit<Invoice, 'id' | 'client'>, lineItemsData: Omit<InvoiceLineItem, 'id' | 'invoice_id'>[]): Promise<{ data: Invoice | null; error: PostgrestError | string | null }> => {
  // This operation should ideally be a transaction. 
  // Supabase Edge Functions are better for complex transactions.
  // For client-side, this is a multi-step process and not atomic.

  // 1. Insert the main invoice data
  const { data: newInvoice, error: invoiceError } = await supabase
    .from(INVOICE_TABLE)
    .insert([invoiceData])
    .select()
    .single();

  if (invoiceError || !newInvoice) {
    return { data: null, error: invoiceError || 'Failed to create invoice header.' };
  }

  // 2. If invoice created, add line items linked to it
  const lineItemsWithInvoiceId = lineItemsData.map(item => ({ ...item, invoice_id: newInvoice.id }));
  const { error: lineItemsError } = await supabase
    .from(LINE_ITEM_TABLE)
    .insert(lineItemsWithInvoiceId);

  if (lineItemsError) {
    // Attempt to delete the created invoice header if line items fail (manual rollback)
    // This is not truly transactional and can leave orphaned data.
    await supabase.from(INVOICE_TABLE).delete().eq('id', newInvoice.id);
    return { data: null, error: `Failed to add line items: ${lineItemsError.message}. Invoice creation rolled back.` };
  }
  
  // Return the newly created invoice (without line items re-fetched in this simple example)
  return { data: newInvoice, error: null };
};

/**
 * Updates an existing invoice. Line items update might be complex (delete old, insert new, or update existing).
 * This example simplifies to updating only main invoice fields.
 */
export const updateInvoice = async (invoiceId: string, invoiceData: Partial<Omit<Invoice, 'id' | 'client' | 'line_items'>>): Promise<{ data: Invoice[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(INVOICE_TABLE)
    .update(invoiceData)
    .eq('id', invoiceId)
    .select();
  // Handling line item updates would require more logic here or a dedicated function.
};

/**
 * Deletes an invoice by its ID. Also consider deleting associated line items.
 */
export const deleteInvoice = async (invoiceId: string): Promise<{ error: PostgrestError | null }> => {
  // In a real scenario, you might use a DB function to ensure atomicity or delete line items first.
  // await supabase.from(LINE_ITEM_TABLE).delete().eq('invoice_id', invoiceId);
  return supabase
    .from(INVOICE_TABLE)
    .delete()
    .eq('id', invoiceId);
};

// TODO: Add functions for managing invoice line items separately if needed.
// TODO: Add functions for client management (CRUD for clients). 