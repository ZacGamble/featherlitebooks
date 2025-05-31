import { supabase } from '@/config/supabase';
import { Invoice, InvoiceLineItem, Client } from '@/types';
import { PostgrestError } from '@supabase/supabase-js';

const INVOICES_TABLE = 'invoices';
const LINE_ITEMS_TABLE = 'invoice_line_items';

/**
 * Fetches all invoices for a given user.
 * Includes basic client information (id and name).
 * @param userId The ID of the user whose invoices to fetch.
 * @returns A promise that resolves to an object containing the invoices data or an error.
 */
export const getInvoices = async (userId: string): Promise<{ data: Invoice[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(INVOICES_TABLE)
    .select(`
      *,
      client:clients (id, name)
    `)
    .eq('user_id', userId)
    .order('invoice_date', { ascending: false });
};

/**
 * Fetches a single invoice by its ID, including full client details and all line items.
 * @param invoiceId The ID of the invoice to fetch.
 * @returns A promise that resolves to an object containing the invoice data or an error.
 */
export const getInvoiceById = async (invoiceId: string): Promise<{ data: Invoice | null; error: PostgrestError | null }> => {
  return supabase
    .from(INVOICES_TABLE)
    .select(`
      *,
      client:clients (*),
      line_items:invoice_line_items (*)
    `)
    .eq('id', invoiceId)
    .single();
};

/**
 * Creates a new invoice and its associated line items.
 * @param invoiceData The data for the new invoice (excluding id, created_at, updated_at, client, line_items).
 * @param lineItemsData An array of line item data (excluding id, invoice_id, created_at, updated_at, inventory_item).
 * @returns A promise that resolves to an object containing the newly created invoice data (with line items) or an error.
 */
export const createInvoice = async (
  invoiceData: Omit<Invoice, 'id' | 'created_at' | 'updated_at' | 'client' | 'line_items'>,
  lineItemsData: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'created_at' | 'updated_at' | 'inventory_item'>[]
): Promise<{ data: Invoice | null; error: PostgrestError | null }> => {
  const { data: newInvoice, error: invoiceError } = await supabase
    .from(INVOICES_TABLE)
    .insert(invoiceData)
    .select()
    .single();

  if (invoiceError || !newInvoice) {
    return { data: null, error: invoiceError };
  }

  if (newInvoice && lineItemsData && lineItemsData.length > 0) {
    const lineItemsToInsert = lineItemsData.map(item => ({
      ...item,
      invoice_id: newInvoice.id,
      user_id: newInvoice.user_id,
    }));

    const { data: insertedLineItems, error: lineItemsError } = await supabase
      .from(LINE_ITEMS_TABLE)
      .insert(lineItemsToInsert)
      .select();

    if (lineItemsError) {
      return { data: null, error: lineItemsError };
    }
    (newInvoice as Invoice).line_items = insertedLineItems as InvoiceLineItem[];
  } else {
    (newInvoice as Invoice).line_items = [];
  }
  
  return { data: newInvoice as Invoice, error: null };
};


/**
 * Updates an existing invoice's main fields.
 * Does not handle line item modifications directly in this call.
 * Line items should be managed via separate calls (e.g., addLineItem, updateLineItem, deleteLineItem).
 * @param invoiceId The ID of the invoice to update.
 * @param invoiceData The partial data to update the invoice with.
 * @returns A promise that resolves to an object containing the updated invoice data or an error.
 */
export const updateInvoice = async (
  invoiceId: string,
  invoiceData: Partial<Omit<Invoice, 'id' | 'user_id' | 'client_id' | 'created_at' | 'updated_at' | 'client' | 'line_items'>>
): Promise<{ data: Invoice | null; error: PostgrestError | null }> => {
  return supabase
    .from(INVOICES_TABLE)
    .update(invoiceData)
    .eq('id', invoiceId)
    .select(`
      *,
      client:clients (*),
      line_items:invoice_line_items (*)
    `)
    .single();
};

/**
 * Deletes an invoice and all its associated line items.
 * NOTE: This function first deletes line items, then the invoice. 
 * Ensure RLS policies allow these deletions. Cascade delete in DB is an alternative.
 * @param invoiceId The ID of the invoice to delete.
 * @returns A promise that resolves to an object containing an error if one occurred.
 */
export const deleteInvoice = async (invoiceId: string): Promise<{ error: PostgrestError | null }> => {
  const { error: lineItemsError } = await supabase
    .from(LINE_ITEMS_TABLE)
    .delete()
    .eq('invoice_id', invoiceId);

  if (lineItemsError) {
    return { error: lineItemsError };
  }

  const { error: invoiceError } = await supabase
    .from(INVOICES_TABLE)
    .delete()
    .eq('id', invoiceId);

  return { error: invoiceError };
};

/**
 * Adds multiple line items to an existing invoice.
 * @param invoiceId The ID of the invoice to add items to.
 * @param userId The ID of the user (owner of the invoice and line items).
 * @param lineItemsData Array of line item data.
 * @returns Promise with inserted line items or error.
 */
export const addLineItems = async (
  invoiceId: string,
  userId: string,
  lineItemsData: Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'user_id' | 'created_at' | 'updated_at' | 'inventory_item'>[]
): Promise<{ data: InvoiceLineItem[] | null; error: PostgrestError | null }> => {
  const itemsToInsert = lineItemsData.map(item => ({
    ...item,
    invoice_id: invoiceId,
    user_id: userId,
  }));
  return supabase.from(LINE_ITEMS_TABLE).insert(itemsToInsert).select();
};

/**
 * Updates a single invoice line item.
 * @param lineItemId The ID of the line item to update.
 * @param lineItemData Partial data for the line item.
 * @returns Promise with updated line item or error.
 */
export const updateLineItem = async (
  lineItemId: string,
  lineItemData: Partial<Omit<InvoiceLineItem, 'id' | 'invoice_id' | 'user_id' | 'created_at' | 'updated_at' | 'inventory_item'>>
): Promise<{ data: InvoiceLineItem | null; error: PostgrestError | null }> => {
  return supabase
    .from(LINE_ITEMS_TABLE)
    .update(lineItemData)
    .eq('id', lineItemId)
    .select()
    .single();
};

/**
 * Deletes a single invoice line item by its ID.
 * @param lineItemId The ID of the line item to delete.
 * @returns Promise with error if any.
 */
export const deleteLineItem = async (lineItemId: string): Promise<{ error: PostgrestError | null }> => {
  return supabase.from(LINE_ITEMS_TABLE).delete().eq('id', lineItemId);
};

/**
 * Fetches all line items for a specific invoice.
 * @param invoiceId The ID of the invoice whose line items to fetch.
 * @returns Promise with line items data or error.
 */
export const getLineItemsForInvoice = async (invoiceId: string): Promise<{ data: InvoiceLineItem[] | null; error: PostgrestError | null }> => {
  return supabase
    .from(LINE_ITEMS_TABLE)
    .select('*')
    .eq('invoice_id', invoiceId);
};