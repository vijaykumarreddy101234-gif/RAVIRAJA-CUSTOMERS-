import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  ArrowRight,
  Plus,
  RefreshCw,
  FileSpreadsheet,
  FileText,
  Mail,
  ShieldCheck,
  CheckCircle,
  ExternalLink,
} from 'lucide-react';
import { Expense, BudgetGoal, CurrencyConfig } from '../types/expense';

interface DashboardViewProps {
  expenses: Expense[];
  budgets: BudgetGoal[];
  currency: CurrencyConfig;
  onOpenAddExpense: () => void;
  onOpenExport: () => void;
  onSelectExpense: (expense: Expense) => void;
  onSwitchTab: (tab: any) => void;
  onQuickSync: () => void;
  isSyncing: boolean;
  isConnected: boolean;
  userEmail?: string | null;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  expenses,
  budgets,
  currency,
  onOpenAddExpense,
  onOpenExport,
  onSelectExpense,
  onSwitchTab,
  onQuickSync,
  isSyncing,
  isConnected,
  userEmail,
}) => {
  // Current month filtering
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));
  const totalSpentMonth = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const remainingBudget = totalBudget - totalSpentMonth;
  const budgetUtilization = totalBudget > 0 ? Math.min(Math.round((totalSpentMonth / totalBudget) * 100), 100) : 0;
  const isOverBudget = totalSpentMonth > totalBudget;

  // Day of month calculations for daily velocity
  const dayOfMonth = now.getDate();
  const dailyAverage = dayOfMonth > 0 ? Math.round(totalSpentMonth / dayOfMonth) : 0;

  // Gmail sync stats
  const gmailAutoCount = expenses.filter((e) => e.status === 'auto_detected').length;

  // Category breakdown for this month
  const categorySpentMap: { [key: string]: number } = {};
  currentMonthExpenses.forEach((e) => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  return (
    <div className="space-y-4 pb-6">
      {/* Welcome Banner */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">Monthly Budget</h2>
          <p className="text-xs text-slate-400">
            {now.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })} Overview
          </p>
        </div>
        <div className="text-right">
          <span className="text-[11px] font-medium text-slate-400">Daily Burn Rate</span>
          <p className="text-sm font-bold text-slate-200">
            {currency.symbol}{dailyAverage.toLocaleString()} <span className="text-[10px] text-slate-500 font-normal">/day</span>
          </p>
        </div>
      </div>

      {/* Main Hero Card: Budget vs Spent */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-700/80 p-5 shadow-xl">
        <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex items-baseline justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Spent</span>
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
              isOverBudget
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : budgetUtilization > 80
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
            }`}
          >
            {isOverBudget ? (
              <>
                <AlertTriangle className="w-3 h-3" /> Over Budget
              </>
            ) : (
              <>
                <TrendingUp className="w-3 h-3" /> {budgetUtilization}% Utilized
              </>
            )}
          </span>
        </div>

        <div className="flex items-baseline gap-1.5 mb-4">
          <span className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            {currency.symbol}{totalSpentMonth.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">
            / {currency.symbol}{totalBudget.toLocaleString()}
          </span>
        </div>

        {/* Progress Bar */}
        <div className="space-y-1.5 mb-4">
          <div className="w-full h-3 rounded-full bg-slate-800 border border-slate-700 overflow-hidden p-0.5">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isOverBudget
                  ? 'bg-gradient-to-r from-rose-500 to-red-600'
                  : budgetUtilization > 80
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                  : 'bg-gradient-to-r from-teal-400 to-emerald-500'
              }`}
              style={{ width: `${Math.min((totalSpentMonth / (totalBudget || 1)) * 100, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>
              Remaining:{' '}
              <strong className={remainingBudget < 0 ? 'text-rose-400 font-bold' : 'text-emerald-400 font-bold'}>
                {currency.symbol}{remainingBudget.toLocaleString()}
              </strong>
            </span>
            <span>Target: {currency.symbol}{totalBudget.toLocaleString()}</span>
          </div>
        </div>

        {/* Mini stats row */}
        <div className="grid grid-cols-3 gap-2 pt-3 border-t border-slate-700/60 text-center">
          <div className="bg-slate-800/60 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">Transactions</span>
            <span className="text-sm font-bold text-white">{currentMonthExpenses.length}</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">Gmail Synced</span>
            <span className="text-sm font-bold text-cyan-400">{gmailAutoCount} auto</span>
          </div>
          <div className="bg-slate-800/60 rounded-xl p-2">
            <span className="text-[10px] text-slate-400 block">Categories</span>
            <span className="text-sm font-bold text-emerald-400">{Object.keys(categorySpentMap).length} Active</span>
          </div>
        </div>
      </div>

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-3 gap-2">
        <button
          type="button"
          onClick={onQuickSync}
          disabled={isSyncing}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 transition active:scale-95 group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-1 group-hover:bg-emerald-500/20">
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-emerald-400' : ''}`} />
          </div>
          <span className="text-[11px] font-semibold">Auto-Sync Gmail</span>
          <span className="text-[9px] text-slate-400">{isConnected ? 'Scan Inbox' : 'Connect Account'}</span>
        </button>

        <button
          type="button"
          onClick={onOpenAddExpense}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 transition active:scale-95 group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-1 group-hover:bg-indigo-500/20">
            <Plus className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold">Add Expense</span>
          <span className="text-[9px] text-slate-400">Manual Entry</span>
        </button>

        <button
          type="button"
          onClick={onOpenExport}
          className="flex flex-col items-center justify-center p-3 rounded-xl bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 text-slate-200 transition active:scale-95 group shadow-sm"
        >
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-1 group-hover:bg-cyan-500/20">
            <FileSpreadsheet className="w-4 h-4" />
          </div>
          <span className="text-[11px] font-semibold">Export Data</span>
          <span className="text-[9px] text-slate-400">PDF & Excel</span>
        </button>
      </div>

      {/* Gmail Auto-Tracking Badge / Card */}
      <div className="bg-slate-900/80 rounded-xl border border-slate-800 p-3.5 flex items-center justify-between gap-3 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center border border-rose-500/20">
            <Mail className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white">Gmail Transaction Auto-Sync</span>
              {isConnected ? (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-emerald-500/20 text-emerald-400">
                  CONNECTED
                </span>
              ) : (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-amber-500/20 text-amber-400">
                  STANDBY
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-400">
              {isConnected
                ? `Syncing debit alerts & receipts for ${userEmail || 'you'}`
                : 'Connect your Gmail to detect bank debit alerts and invoices automatically'}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => onSwitchTab('sync')}
          className="text-xs font-semibold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 whitespace-nowrap px-2.5 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 transition"
        >
          <span>{isConnected ? 'Settings' : 'Connect'}</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Category Spending Snapshot */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Top Spending Categories</h3>
          <button
            type="button"
            onClick={() => onSwitchTab('budgets')}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            Manage Budgets <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {budgets.slice(0, 4).map((b) => {
            const spent = categorySpentMap[b.category] || 0;
            const pct = b.limit > 0 ? Math.min(Math.round((spent / b.limit) * 100), 100) : 0;
            return (
              <div
                key={b.category}
                className="bg-slate-800/80 border border-slate-700/70 rounded-xl p-3 hover:border-slate-600 transition"
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-semibold text-slate-200 truncate pr-1">{b.category}</span>
                  <span className="text-[10px] text-slate-400 font-mono">{pct}%</span>
                </div>
                <div className="flex items-baseline justify-between text-xs mb-1.5">
                  <span className="font-bold text-white">
                    {currency.symbol}{spent.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-slate-400">
                    / {currency.symbol}{b.limit.toLocaleString()}
                  </span>
                </div>
                <div className="w-full h-1.5 rounded-full bg-slate-700 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: spent > b.limit ? '#f43f5e' : b.color || '#10b981',
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Transactions List */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Recent Transactions</h3>
            <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded-full">
              {expenses.length}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSwitchTab('expenses')}
            className="text-[11px] text-emerald-400 hover:underline flex items-center gap-0.5"
          >
            See All <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="space-y-2">
          {expenses.slice(0, 5).map((exp) => (
            <div
              key={exp.id}
              onClick={() => onSelectExpense(exp)}
              className="bg-slate-800/70 hover:bg-slate-800 border border-slate-700/70 hover:border-slate-600 rounded-xl p-3 flex items-center justify-between gap-3 cursor-pointer transition shadow-sm"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-slate-700/80 flex items-center justify-center shrink-0 text-slate-300 border border-slate-600/50">
                  {exp.status === 'auto_detected' ? (
                    <Mail className="w-5 h-5 text-cyan-400" />
                  ) : (
                    <TrendingDown className="w-5 h-5 text-rose-400" />
                  )}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-bold text-white truncate">{exp.merchant || exp.title}</p>
                    {exp.status === 'auto_detected' && (
                      <span className="shrink-0 px-1 py-0.2 rounded text-[9px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/20">
                        Gmail
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-0.5">
                    <span>{exp.category}</span>
                    <span>•</span>
                    <span>{exp.date}</span>
                    <span>•</span>
                    <span className="text-slate-500">{exp.paymentMethod}</span>
                  </div>
                </div>
              </div>

              <div className="text-right shrink-0">
                <p className="text-xs font-extrabold text-white">
                  -{currency.symbol}{exp.amount.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-400/90 font-medium">Recorded</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
