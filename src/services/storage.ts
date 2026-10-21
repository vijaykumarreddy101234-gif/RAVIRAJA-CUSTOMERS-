import { Expense, BudgetGoal, SyncLog, CurrencyConfig } from '../types/expense';

export const CURRENCIES: CurrencyConfig[] = [
  { code: 'INR', symbol: '₹', label: 'INR (₹)' },
  { code: 'USD', symbol: '$', label: 'USD ($)' },
  { code: 'EUR', symbol: '€', label: 'EUR (€)' },
  { code: 'GBP', symbol: '£', label: 'GBP (£)' },
];

export const DEFAULT_BUDGETS: BudgetGoal[] = [
  { category: 'Food & Dining', limit: 8000, color: '#f97316' }, // orange
  { category: 'Groceries', limit: 12000, color: '#10b981' }, // emerald
  { category: 'Shopping & Retail', limit: 7500, color: '#6366f1' }, // indigo
  { category: 'Travel & Transport', limit: 6000, color: '#0ea5e9' }, // sky
  { category: 'Bills & Utilities', limit: 9000, color: '#eab308' }, // yellow
  { category: 'Entertainment', limit: 3000, color: '#ec4899' }, // pink
  { category: 'Health & Medical', limit: 4000, color: '#ef4444' }, // red
  { category: 'Business & Sales', limit: 15000, color: '#8b5cf6' }, // violet
  { category: 'Transfers & Investments', limit: 20000, color: '#14b8a6' }, // teal
  { category: 'Other', limit: 5000, color: '#64748b' }, // slate
];

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'demo-1',
    title: 'Swiggy Gourmet Order',
    amount: 649,
    currency: 'INR',
    category: 'Food & Dining',
    date: new Date(Date.now() - 2 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
    merchant: 'Swiggy',
    notes: 'Order #SW98214 - Dinner delivered',
    status: 'auto_detected',
    emailSource: {
      messageId: 'sw-demo-1',
      sender: 'Swiggy <orders@swiggy.in>',
      subject: 'Your Swiggy order was delivered successfully! Amount: Rs 649',
      date: new Date(Date.now() - 2 * 3600 * 1000).toUTCString(),
      snippet: 'Paid ₹649 via Google Pay UPI (ref: 402910394012). Your food from Punjabi Rasoi was delivered.',
    },
    createdAt: Date.now() - 2 * 3600 * 1000,
  },
  {
    id: 'demo-2',
    title: 'Uber Premier Ride',
    amount: 432,
    currency: 'INR',
    category: 'Travel & Transport',
    date: new Date(Date.now() - 14 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    merchant: 'Uber',
    notes: 'Trip to Tech Park Office',
    status: 'auto_detected',
    emailSource: {
      messageId: 'ub-demo-2',
      sender: 'Uber Receipts <uber.india@uber.com>',
      subject: 'Your Thursday evening trip with Uber - ₹432.00',
      date: new Date(Date.now() - 14 * 3600 * 1000).toUTCString(),
      snippet: 'Total: ₹432.00. Charged to HDFC Bank Credit Card ending in 4092. Thank you for riding with Uber.',
    },
    createdAt: Date.now() - 14 * 3600 * 1000,
  },
  {
    id: 'demo-3',
    title: 'Blinkit 10-Min Groceries',
    amount: 1145,
    currency: 'INR',
    category: 'Groceries',
    date: new Date(Date.now() - 28 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
    merchant: 'Blinkit',
    notes: 'Weekly fresh dairy, vegetables, snacks',
    status: 'auto_detected',
    emailSource: {
      messageId: 'bl-demo-3',
      sender: 'Blinkit <receipts@blinkit.com>',
      subject: 'Order Delivered! Bill amount INR 1,145.00',
      date: new Date(Date.now() - 28 * 3600 * 1000).toUTCString(),
      snippet: 'Thank you for ordering with Blinkit! Paid via UPI ref 89318491. Total items: 9.',
    },
    createdAt: Date.now() - 28 * 3600 * 1000,
  },
  {
    id: 'demo-4',
    title: 'Airtel Fiber Broadband Bill',
    amount: 1179,
    currency: 'INR',
    category: 'Bills & Utilities',
    date: new Date(Date.now() - 48 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Net Banking',
    merchant: 'Airtel Broadband',
    notes: 'Monthly high-speed internet plan',
    status: 'auto_detected',
    emailSource: {
      messageId: 'ar-demo-4',
      sender: 'Airtel Alerts <ebill@airtel.com>',
      subject: 'Payment Confirmation: Bill of Rs. 1,179.00 processed',
      date: new Date(Date.now() - 48 * 3600 * 1000).toUTCString(),
      snippet: 'We have received payment of Rs. 1179.00 for Airtel Xstream Fiber account 0804829104.',
    },
    createdAt: Date.now() - 48 * 3600 * 1000,
  },
  {
    id: 'demo-5',
    title: 'Amazon Online Purchase',
    amount: 2899,
    currency: 'INR',
    category: 'Shopping & Retail',
    date: new Date(Date.now() - 72 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Credit Card',
    merchant: 'Amazon',
    notes: 'Ergonomic mouse & USB-C hub',
    status: 'auto_detected',
    emailSource: {
      messageId: 'am-demo-5',
      sender: 'Amazon.in <auto-confirm@amazon.in>',
      subject: 'Your Amazon.in order #402-9842109-1928401 has been confirmed',
      date: new Date(Date.now() - 72 * 3600 * 1000).toUTCString(),
      snippet: 'Order Total: Rs. 2,899.00. Paid using Credit Card. Guaranteed delivery by Sunday.',
    },
    createdAt: Date.now() - 72 * 3600 * 1000,
  },
  {
    id: 'demo-6',
    title: 'Shell Fuel Station',
    amount: 2150,
    currency: 'INR',
    category: 'Travel & Transport',
    date: new Date(Date.now() - 96 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'Debit Card',
    merchant: 'Shell Petrol',
    notes: 'Full tank fuel for client visit',
    status: 'verified',
    createdAt: Date.now() - 96 * 3600 * 1000,
  },
  {
    id: 'demo-7',
    title: 'Sales Travel & Client Meeting',
    amount: 3450,
    currency: 'INR',
    category: 'Business & Sales',
    date: new Date(Date.now() - 120 * 3600 * 1000).toISOString().split('T')[0],
    paymentMethod: 'UPI',
    merchant: 'SCRAFT Sales Tour',
    notes: 'Customer visit travel & sample presentation lunch',
    status: 'manual',
    createdAt: Date.now() - 120 * 3600 * 1000,
  },
];

const STORAGE_KEYS = {
  EXPENSES: 'spendsync_expenses_v1',
  BUDGETS: 'spendsync_budgets_v1',
  CURRENCY: 'spendsync_currency_v1',
  LOGS: 'spendsync_synclogs_v1',
  AUTO_SYNC: 'spendsync_autosync_v1',
};

export class StorageService {
  public static getExpenses(): Expense[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.EXPENSES);
      if (!data) {
        this.saveExpenses(INITIAL_EXPENSES);
        return INITIAL_EXPENSES;
      }
      return JSON.parse(data);
    } catch {
      return INITIAL_EXPENSES;
    }
  }

  public static saveExpenses(expenses: Expense[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.EXPENSES, JSON.stringify(expenses));
    } catch (e) {
      console.error('Failed to save expenses to localStorage:', e);
    }
  }

  public static addExpense(expense: Expense): Expense[] {
    const current = this.getExpenses();
    const updated = [expense, ...current];
    this.saveExpenses(updated);
    return updated;
  }

  public static addBatchExpenses(newExpenses: Expense[]): Expense[] {
    const current = this.getExpenses();
    const existingMsgIds = new Set(
      current
        .filter((e) => e.emailSource?.messageId)
        .map((e) => e.emailSource!.messageId)
    );

    const filteredNew = newExpenses.filter(
      (e) => !e.emailSource?.messageId || !existingMsgIds.has(e.emailSource.messageId)
    );

    const updated = [...filteredNew, ...current];
    this.saveExpenses(updated);
    return updated;
  }

  public static updateExpense(updatedExpense: Expense): Expense[] {
    const current = this.getExpenses();
    const index = current.findIndex((e) => e.id === updatedExpense.id);
    if (index !== -1) {
      current[index] = updatedExpense;
      this.saveExpenses(current);
    }
    return [...current];
  }

  public static deleteExpense(id: string): Expense[] {
    const current = this.getExpenses();
    const updated = current.filter((e) => e.id !== id);
    this.saveExpenses(updated);
    return updated;
  }

  public static getBudgets(): BudgetGoal[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BUDGETS);
      if (!data) {
        this.saveBudgets(DEFAULT_BUDGETS);
        return DEFAULT_BUDGETS;
      }
      return JSON.parse(data);
    } catch {
      return DEFAULT_BUDGETS;
    }
  }

  public static saveBudgets(budgets: BudgetGoal[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(budgets));
    } catch (e) {
      console.error('Failed to save budgets:', e);
    }
  }

  public static updateBudget(category: string, newLimit: number): BudgetGoal[] {
    const current = this.getBudgets();
    const updated = current.map((b) => (b.category === category ? { ...b, limit: newLimit } : b));
    this.saveBudgets(updated);
    return updated;
  }

  public static getCurrency(): CurrencyConfig {
    try {
      const code = localStorage.getItem(STORAGE_KEYS.CURRENCY) || 'INR';
      return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
    } catch {
      return CURRENCIES[0];
    }
  }

  public static setCurrency(code: string): CurrencyConfig {
    try {
      localStorage.setItem(STORAGE_KEYS.CURRENCY, code);
      return CURRENCIES.find((c) => c.code === code) || CURRENCIES[0];
    } catch {
      return CURRENCIES[0];
    }
  }

  public static getSyncLogs(): SyncLog[] {
    try {
      const logs = localStorage.getItem(STORAGE_KEYS.LOGS);
      return logs ? JSON.parse(logs) : [];
    } catch {
      return [];
    }
  }

  public static addSyncLog(log: SyncLog): void {
    try {
      const logs = this.getSyncLogs();
      const updated = [log, ...logs.slice(0, 19)];
      localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save sync log:', e);
    }
  }

  public static getAutoSyncEnabled(): boolean {
    return localStorage.getItem(STORAGE_KEYS.AUTO_SYNC) === 'true';
  }

  public static setAutoSyncEnabled(enabled: boolean): void {
    localStorage.setItem(STORAGE_KEYS.AUTO_SYNC, enabled ? 'true' : 'false');
  }

  public static resetToDemo(): Expense[] {
    this.saveExpenses(INITIAL_EXPENSES);
    this.saveBudgets(DEFAULT_BUDGETS);
    return INITIAL_EXPENSES;
  }
}
