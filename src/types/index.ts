// This file is for your application-specific types.
// Supabase-generated types should go into supabase.ts (see supabase:types script in package.json)

// --- AUTH --- //
export interface UserProfile {
  id: string; // typically UUID from auth.users
  username?: string;
  avatar_url?: string;
  full_name?: string;
  // Add other profile fields as needed
}

// --- CORE ENTITIES --- //

export interface Client extends SelectableItem<string> {
  id: string;
  user_id: string; // Added user_id
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  // Add other client-specific fields as needed
}

export interface InventoryItem {
  id: string; // or number
  name: string;
  sku: string;
  unit_price: number;
  quantity: number;
  vendor?: string;
  category?: string;
  // Add other inventory-specific fields
}

export interface InvoiceLineItem {
  id: string; // or number
  product_service_description: string;
  quantity: number;
  unit_price: number;
  total: number; // quantity * unit_price
  inventory_item_id?: string; // Optional link to an inventory item
}

export interface Invoice {
  id: string; // or number
  invoice_number: string;
  client_id: string; // Foreign key to Client
  client?: Client; // Optional: For embedding client details if fetched together
  date: string; // ISO 8601 date string
  due_date: string; // ISO 8601 date string
  category?: string;
  line_items: InvoiceLineItem[];
  subtotal: number;
  discount_amount?: number;
  tax_amount?: number;
  total_amount: number;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
  notes?: string;
}

export interface Expense {
  id: string; // or number
  expense_name: string;
  category: string;
  amount: number;
  date: string; // ISO 8601 date string
  vendor?: string;
  description?: string;
  // Add other expense-specific fields
}

// --- REPORTS --- //
export interface UserReportConfig {
  report_type: 'profit_loss' | 'sales_summary' | 'expense_summary';
  date_range_start: string;
  date_range_end: string;
  filters?: Record<string, any>; // e.g., { category: 'Office Supplies' }
}

// --- UTILITY TYPES --- //

/**
 * Represents the structure for a selectable item, often used in dropdowns or pickers.
 * Particularly useful for selecting a Client when creating/editing an Invoice.
 */
export interface SelectableItem<T = string> {
  label: string;
  value: T;
}

// Add more application-specific types as your project grows.
// For example, types for API responses if they differ from direct Supabase table types,
// or types for form data structures. 