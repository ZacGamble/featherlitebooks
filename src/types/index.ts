/**
 * This file contains the core TypeScript types for the application entities.
 * These types should mirror the structure of your Supabase tables.
 */

// --- Profile Type ---
export interface Profile {
  id: string; // UUID, Primary Key, FK to auth.users.id
  username?: string | null; // TEXT, Nullable
  full_name?: string | null; // TEXT, Nullable
  avatar_url?: string | null; // TEXT, Nullable
  website?: string | null; // TEXT, Nullable
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// --- Client Type ---
export interface Client {
  id: string; // UUID, Primary Key
  user_id: string; // UUID, FK to auth.users.id
  name: string; // TEXT
  email?: string | null; // TEXT, Nullable
  phone?: string | null; // TEXT, Nullable
  address_line1?: string | null; // TEXT, Nullable
  address_line2?: string | null; // TEXT, Nullable
  city?: string | null; // TEXT, Nullable
  state_province?: string | null; // TEXT, Nullable
  postal_code?: string | null; // TEXT, Nullable
  country?: string | null; // TEXT, Nullable
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// --- InventoryItem Type ---
export interface InventoryItem {
  id: string; // UUID, Primary Key
  user_id: string; // UUID, FK to auth.users.id
  name: string; // TEXT
  sku?: string | null; // TEXT, Nullable
  description?: string | null; // TEXT, Nullable
  quantity: number; // INTEGER
  unit_price: number; // NUMERIC
  category_id?: string | null; // UUID, FK to categories table (optional, if you have one)
  vendor_id?: string | null; // UUID, FK to vendors table (optional, if you have one)
  reorder_point?: number | null; // INTEGER, Nullable
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// --- Expense Type ---
export type ExpenseStatus = 'pending' | 'approved' | 'reimbursed' | 'rejected';
export interface Expense {
  id: string; // UUID, Primary Key
  user_id: string; // UUID, FK to auth.users.id
  date: string; // DATE
  category: string; // TEXT (could be FK to an expense_categories table)
  description: string; // TEXT
  amount: number; // NUMERIC
  vendor_name?: string | null; // TEXT, Nullable
  receipt_url?: string | null; // TEXT, Nullable (URL to stored receipt image)
  payment_method?: string | null; // TEXT, Nullable (e.g., 'Credit Card', 'Cash')
  status?: ExpenseStatus | null; // TEXT, Nullable (e.g., 'pending', 'approved')
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ
}

// --- Invoice Type ---
export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'void';
export interface Invoice {
  id: string; // UUID, Primary Key
  user_id: string; // UUID, FK to auth.users.id
  client_id: string; // UUID, FK to clients table
  invoice_number: string; // TEXT (should be unique per user)
  issue_date: string; // DATE
  due_date: string; // DATE
  status: InvoiceStatus; // TEXT (e.g., 'draft', 'sent', 'paid', 'overdue', 'void')
  subtotal: number; // NUMERIC
  tax_rate?: number | null; // NUMERIC, Nullable (e.g., 0.07 for 7%)
  tax_amount?: number | null; // NUMERIC, Nullable
  total_amount: number; // NUMERIC
  notes?: string | null; // TEXT, Nullable
  currency: string; // TEXT (e.g., 'USD', 'EUR'), Default 'USD'
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ

  // Optional convenience fields for related data (if fetched together)
  client?: Client; 
  line_items?: InvoiceLineItem[];
}

// --- InvoiceLineItem Type ---
export interface InvoiceLineItem {
  id: string; // UUID, Primary Key
  invoice_id: string; // UUID, FK to invoices table
  inventory_item_id?: string | null; // UUID, FK to inventory_items (optional, if item is from inventory)
  description: string; // TEXT (product/service description)
  quantity: number; // INTEGER or NUMERIC(10,2) depending on precision needed
  unit_price: number; // NUMERIC
  total_price: number; // NUMERIC (quantity * unit_price)
  created_at: string; // TIMESTAMPTZ
  updated_at: string; // TIMESTAMPTZ

  // Optional convenience field
  inventory_item?: InventoryItem | null;
}

/**
 * Represents a generic item that can be selected in a list or dropdown.
 * This is a utility type and might be used by various components.
 */
export interface SelectableItem<TId = string> {
  id: TId;
  name: string;
  // You can add other common properties for selectable items here if needed
  // e.g., description?: string;
}

/**
 * This is an alias for the Profile interface, often used in auth contexts.
 * It can be extended if UserProfile needs additional client-side-only fields.
 */
export interface UserProfile extends Profile {}

/**
 * Configuration for generating user-specific reports.
 */
export interface UserReportConfig {
  reportId: string;
  userId: string;
  reportType: 'sales_summary' | 'expense_breakdown' | 'inventory_status';
  dateRange: { startDate: string; endDate: string };
  filters?: Record<string, any>; // e.g., { clientId: 'xyz', category: 'Supplies' }
  generatedAt: string;
} 