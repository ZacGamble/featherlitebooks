import {
  BaseRecord,
  Client,
  Expense,
  InventoryItem,
  Invoice,
  Profile,
  UserSpecificRecord
} from '@/types';

// Type guard to check if an object is a Client
function isClient(record: BaseRecord): record is Client {
  return typeof (record as Client).name === 'string' && typeof (record as Client).email !== 'undefined' && 'user_id' in record;
}

// Type guard to check if an object is an Expense
function isExpense(record: BaseRecord): record is Expense {
  return typeof (record as Expense).category === 'string' && typeof (record as Expense).amount === 'number' && 'user_id' in record;
}

// Type guard to check if an object is an InventoryItem
function isInventoryItem(record: BaseRecord): record is InventoryItem {
  return typeof (record as InventoryItem).name === 'string' && typeof (record as InventoryItem).sku !== 'undefined' && typeof (record as InventoryItem).quantity_on_hand === 'number' && 'user_id' in record;
}

// Type guard to check if an object is an Invoice
function isInvoice(record: BaseRecord): record is Invoice {
  return typeof (record as Invoice).invoice_number === 'string' && typeof (record as Invoice).client_id === 'string' && typeof (record as Invoice).total_amount === 'number' && 'user_id' in record;
}

// Type guard to check if an object is a Profile
function isProfile(record: BaseRecord): record is Profile {
  return (typeof (record as Profile).business_name !== 'undefined' || typeof (record as Profile).username !== 'undefined') && !('user_id' in record);
}

interface DisplayDetails {
  type: string;
  primaryDisplay: string;
  secondaryDisplay?: string;
}

/**
 * Polymorphic function to get display-friendly information for different record types.
 * It accepts any object conforming to BaseRecord and uses type guards to determine 
 * the specific type, then returns tailored display details.
 */
export function getDisplayInformation(record: BaseRecord): DisplayDetails {
  if (isProfile(record)) {
    return {
      type: 'Profile',
      primaryDisplay: record.business_name || record.username || 'User Profile',
      secondaryDisplay: `ID: ${record.id}`
    };
  }
  // For types extending UserSpecificRecord, we check for user_id first if it helps differentiate
  if ('user_id' in record) { // Common check for UserSpecificRecord types
    if (isClient(record)) {
      return {
        type: 'Client',
        primaryDisplay: record.name,
        secondaryDisplay: record.email || `ID: ${record.id}`
      };
    }
    if (isExpense(record)) {
      return {
        type: 'Expense',
        primaryDisplay: record.description || record.name || 'Expense',
        secondaryDisplay: `${record.category} - $${record.amount.toFixed(2)}`
      };
    }
    if (isInventoryItem(record)) {
      return {
        type: 'Inventory Item',
        primaryDisplay: record.name,
        secondaryDisplay: `SKU: ${record.sku || 'N/A'} | Qty: ${record.quantity_on_hand}`
      };
    }
    if (isInvoice(record)) {
      return {
        type: 'Invoice',
        primaryDisplay: `Invoice #${record.invoice_number}`,
        secondaryDisplay: `Client ID: ${record.client_id} | Total: $${record.total_amount.toFixed(2)}`
      };
    }
  }

  // Fallback for BaseRecord types not specifically handled or if user_id check isn't enough
  return {
    type: 'Record',
    primaryDisplay: `Record ID: ${record.id}`,
    secondaryDisplay: `Created: ${new Date(record.created_at).toLocaleDateString()}`
  };
}

// Example Usage (not part of the util itself, just for illustration):
/*
const clientExample: Client = {
  id: 'c1', user_id: 'u1', name: 'Test Client', email: 'client@test.com', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
};
const expenseExample: Expense = {
  id: 'e1', user_id: 'u1', name: 'Lunch', category: 'Meals', amount: 25.50, expense_date: '2023-01-01', created_at: new Date().toISOString(), updated_at: new Date().toISOString()
};

console.log(getDisplayInformation(clientExample));
console.log(getDisplayInformation(expenseExample));
*/ 