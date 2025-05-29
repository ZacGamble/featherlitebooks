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
  INVENTORY_STACK: 'InventoryStack',
  INVOICES_STACK: 'InvoicesStack',
  EXPENSES_STACK: 'ExpensesStack',
  REPORTS: 'Reports',
  SETTINGS_STACK: 'SettingsStack', // Renamed from SETTINGS_TAB_STACK

  // Inventory Stack (within AppTabs)
  INVENTORY_LIST: 'InventoryList',
  INVENTORY_FORM: 'InventoryForm', // For Add/Edit
  INVENTORY_DETAIL: 'InventoryDetail',

  // Invoices Stack (within AppTabs)
  INVOICE_LIST: 'InvoiceList',
  INVOICE_FORM: 'InvoiceForm', // For Add/Edit
  INVOICE_DETAIL: 'InvoiceDetail',

  // Expenses Stack (within AppTabs)
  EXPENSE_LIST: 'ExpenseList',
  EXPENSE_FORM: 'ExpenseForm', // For Add/Edit
  EXPENSE_DETAIL: 'ExpenseDetail',

  // Client Management Stack (New)
  CLIENTS_STACK: 'ClientsStack',
  CLIENT_LIST: 'ClientList',
  CLIENT_DETAIL: 'ClientDetail',
  CLIENT_FORM: 'ClientForm',

  // Settings (Can be a top-level screen in a stack or a screen within a tab)
  SETTINGS: 'Settings',
  PROFILE: 'Profile',
  // Add other settings screens like Account, Notifications etc.
}; 