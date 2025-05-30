export const ROUTES = {
  // Public Stack
  LANDING: 'Landing',

  // Auth Stack
  LOGIN: 'Login',
  SIGNUP: 'Signup',
  FORGOT_PASSWORD: 'ForgotPassword',

  // App Tabs (Main Authenticated Routes)
  APP_TABS: 'AppTabs',
  DASHBOARD: 'Dashboard',
  CLIENTS_STACK: 'ClientsStack',
  INVENTORY_TAB: 'InventoryTab',
  INVENTORY_STACK: 'InventoryStack',
  INVOICES_STACK: 'InvoicesStack',
  EXPENSES_STACK: 'ExpensesStack',
  REPORTS: 'Reports',
  SETTINGS_STACK: 'SettingsStack',

  // Client Management Stack
  CLIENT_LIST: 'ClientList',
  CLIENT_DETAIL: 'ClientDetail',
  CLIENT_FORM: 'ClientForm',

  // Inventory Stack (within AppTabs)
  INVENTORY_LIST: 'InventoryList',
  INVENTORY_ITEM_FORM: 'InventoryItemForm',
  INVENTORY_ITEM_DETAIL: 'InventoryItemDetail',

  // Invoices Stack (within AppTabs)
  INVOICE_LIST: 'InvoiceList',
  INVOICE_FORM: 'InvoiceForm',
  INVOICE_DETAIL: 'InvoiceDetail',

  // Expenses Stack (within AppTabs)
  EXPENSE_LIST: 'ExpenseList',
  EXPENSE_FORM: 'ExpenseForm',
  EXPENSE_DETAIL: 'ExpenseDetail',

  // Settings (Can be a top-level screen in a stack or a screen within a tab)
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  // Add other settings screens like Account, Notifications etc.
} as const; 