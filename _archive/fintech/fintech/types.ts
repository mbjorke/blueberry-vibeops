/**
 * Fintech Component Types
 * 
 * Centralized type definitions for all fintech components.
 * These types ensure consistency across the application.
 */

// Transaction related types
export type CategorySource = 'manual' | 'automatic';

export interface Transaction {
  accountId: string;  // Reference to the account this transaction belongs to
  id: string;
  type: 'incoming' | 'outgoing';
  amount: number;
  currency: string;
  description: string;
  category: TransactionCategory;
  categorySource: CategorySource;
  date: Date;
  status: TransactionStatus;
  merchantName?: string;
  merchantImage?: string;
  // Enhanced Revolut-style fields
  merchantDetails?: string;
  expenseStatus: 'submitted' | 'info_required' | 'approved' | 'rejected' | 'none';
  spendProgram?: string;
  cardholder: string;
  receiptStatus: 'uploaded' | 'required' | 'none';
  accountingCategory?: string;
  taxRate?: string;
  transactionId: string;
  cardLast4?: string;
  location?: string;
  exchangeRate?: number;
  originalAmount?: number;
  originalCurrency?: string;
  isRecurring?: boolean;
}

export type TransactionCategory = 
  | 'food' 
  | 'transport' 
  | 'shopping' 
  | 'housing' 
  | 'technology' 
  | 'other'
  | 'unmapped';

export type TransactionStatus = 
  | 'completed' 
  | 'pending' 
  | 'failed';

// Spending insights types
export interface SpendingCategory {
  name: string;
  amount: number;
  budget: number;
  color: string;
  icon?: string;
}

export interface SpendingTrend {
  percentage: number;
  direction: 'up' | 'down';
}

// Account types
export type AccountType = 'checking' | 'savings' | 'investment' | 'credit_card' | 'business';

export interface Account {
  id: string;
  name: string;
  displayName: string;
  balance: number;
  availableBalance?: number;
  currency: string;
  type: AccountType;
  isVisible: boolean;
  lastFour?: string;
  icon?: string;
  color?: string;
  isDefault?: boolean;
  status?: 'active' | 'inactive' | 'pending';
  createdAt?: Date;
  updatedAt?: Date;
}

// Quick action types
export type QuickActionType = 
  | 'transfer'
  | 'topup' 
  | 'paybills'
  | 'cards'
  | 'savings'
  | 'investing'
  | 'splitbill'
  | 'receipts';

export interface QuickAction {
  id: QuickActionType;
  label: string;
  description: string;
  icon: React.ComponentType;
  color: string;
}

// Common callback types
export type VoidCallback = () => void;
export type TransactionCallback = (transaction: Transaction) => void;
export type AccountCallback = (account: Account) => void;

// Currency and formatting types
export type CurrencyCode = 'GBP' | 'USD' | 'EUR' | 'JPY';

export interface FormatOptions {
  currency: CurrencyCode;
  locale: string;
  showSign?: boolean;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
}

// Component prop base types
export interface BaseComponentProps {
  className?: string;
  'data-testid'?: string;
}

export interface InteractiveComponentProps extends BaseComponentProps {
  disabled?: boolean;
  loading?: boolean;
}