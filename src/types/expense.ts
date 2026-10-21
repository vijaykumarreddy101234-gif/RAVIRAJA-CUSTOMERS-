export type ExpenseCategory =
  | 'Food & Dining'
  | 'Groceries'
  | 'Shopping & Retail'
  | 'Travel & Transport'
  | 'Bills & Utilities'
  | 'Entertainment'
  | 'Health & Medical'
  | 'Business & Sales'
  | 'Transfers & Investments'
  | 'Other';

export interface Expense {
  id: string;
  title: string;
  amount: number;
  currency: string;
  category: ExpenseCategory;
  date: string; // ISO string YYYY-MM-DD
  paymentMethod: string; // UPI, Credit Card, Debit Card, NetBanking, Cash, Wallet
  merchant?: string;
  notes?: string;
  status: 'auto_detected' | 'verified' | 'manual';
  emailSource?: {
    messageId: string;
    sender: string;
    subject: string;
    date: string;
    snippet: string;
  };
  createdAt: number;
}

export interface BudgetGoal {
  category: ExpenseCategory;
  limit: number;
  color: string;
}

export interface SyncLog {
  timestamp: number;
  emailsScanned: number;
  expensesFound: number;
  status: 'success' | 'failed' | 'in_progress';
  message?: string;
}

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
}
