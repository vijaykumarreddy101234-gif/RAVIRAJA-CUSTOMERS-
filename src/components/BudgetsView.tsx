import React, { useState } from 'react';
import {
  Target,
  Edit2,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  TrendingUp,
  DollarSign,
  Plus,
  Save,
} from 'lucide-react';
import { BudgetGoal, Expense, CurrencyConfig, ExpenseCategory } from '../types/expense';

interface BudgetsViewProps {
  budgets: BudgetGoal[];
  expenses: Expense[];
  currency: CurrencyConfig;
  onUpdateBudget: (category: string, newLimit: number) => void;
}

export const BudgetsView: React.FC<BudgetsViewProps> = ({
  budgets,
  expenses,
  currency,
  onUpdateBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editLimitInput, setEditLimitInput] = useState<string>('');

  // Calculate current month's spending by category
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const currentMonthExpenses = expenses.filter((e) => e.date.startsWith(currentMonthStr));

  const categorySpentMap: { [key: string]: number } = {};
  currentMonthExpenses.forEach((e) => {
    categorySpentMap[e.category] = (categorySpentMap[e.category] || 0) + e.amount;
  });

  const totalMonthlyBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
  const totalMonthlySpent = currentMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
  const totalRemaining = totalMonthlyBudget - totalMonthlySpent;

  const handleStartEdit = (b: BudgetGoal) => {
    setEditingCategory(b.category);
    setEditLimitInput(b.limit.toString());
  };

  const handleSaveEdit = (category: string) => {
    const val = parseFloat(editLimitInput);
    if (!isNaN(val) && val >= 0) {
      onUpdateBudget(category, val);
    }
    setEditingCategory(null);
  };

  return (
    <div className="space-y-4 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Category Budgets</h2>
        <p className="text-xs text-slate-400">
          Set monthly expense caps to keep your personal finances strictly on track.
        </p>
      </div>

      {/* Aggregate Overview Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
          <span>Overall Monthly Limit</span>
          <span className="text-emerald-400 font-semibold">
            {totalRemaining >= 0 ? `${currency.symbol}${totalRemaining.toLocaleString()} remaining` : 'Limit Exceeded'}
          </span>
        </div>
        <div className="flex items-baseline justify-between mb-3">
          <span className="text-2xl font-black text-white">
            {currency.symbol}{totalMonthlySpent.toLocaleString()}
          </span>
          <span className="text-xs text-slate-400">
            Total Cap: <strong className="text-slate-200">{currency.symbol}{totalMonthlyBudget.toLocaleString()}</strong>
          </span>
        </div>

        {/* Aggregate Progress */}
        <div className="w-full h-2.5 rounded-full bg-slate-800 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              totalMonthlySpent > totalMonthlyBudget
                ? 'bg-rose-500'
                : (totalMonthlySpent / totalMonthlyBudget) > 0.8
                ? 'bg-amber-500'
                : 'bg-emerald-500'
            }`}
            style={{
              width: `${Math.min((totalMonthlySpent / (totalMonthlyBudget || 1)) * 100, 100)}%`,
            }}
          ></div>
        </div>
      </div>

      {/* Category List */}
      <div className="space-y-3">
        {budgets.map((budget) => {
          const spent = categorySpentMap[budget.category] || 0;
          const remaining = budget.limit - spent;
          const percent = budget.limit > 0 ? Math.min(Math.round((spent / budget.limit) * 100), 100) : 0;
          const isOver = spent > budget.limit;
          const isNear = percent >= 80 && !isOver;

          const isEditing = editingCategory === budget.category;

          return (
            <div
              key={budget.category}
              className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 transition hover:border-slate-700 shadow-sm"
            >
              <div className="flex items-center justify-between gap-2 mb-2">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="w-3 h-3 rounded-full shrink-0"
                    style={{ backgroundColor: budget.color }}
                  ></div>
                  <span className="text-xs font-bold text-white truncate">{budget.category}</span>
                </div>

                {/* Badge status */}
                {isOver ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30 flex items-center gap-1">
                    <AlertTriangle className="w-3 h-3" /> Over Budget
                  </span>
                ) : isNear ? (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                    Near Cap ({percent}%)
                  </span>
                ) : (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400">
                    {percent}% used
                  </span>
                )}
              </div>

              {/* Numbers Row & Edit Limit */}
              <div className="flex items-center justify-between text-xs mb-2">
                <div>
                  <span className="text-slate-400 text-[11px]">Spent: </span>
                  <span className="font-bold text-white">
                    {currency.symbol}{spent.toLocaleString()}
                  </span>
                </div>

                {isEditing ? (
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      value={editLimitInput}
                      onChange={(e) => setEditLimitInput(e.target.value)}
                      className="w-20 bg-slate-800 border border-emerald-500 rounded px-1.5 py-0.5 text-xs text-white focus:outline-none font-bold"
                      autoFocus
                    />
                    <button
                      type="button"
                      onClick={() => handleSaveEdit(budget.category)}
                      className="p-1 rounded bg-emerald-600 hover:bg-emerald-500 text-white"
                      title="Save"
                    >
                      <Save className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400 text-[11px]">Cap: </span>
                    <span className="font-semibold text-slate-200">
                      {currency.symbol}{budget.limit.toLocaleString()}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleStartEdit(budget)}
                      className="p-1 rounded text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition"
                      title="Edit Limit"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>

              {/* Progress bar */}
              <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${percent}%`,
                    backgroundColor: isOver ? '#f43f5e' : isNear ? '#f59e0b' : budget.color || '#10b981',
                  }}
                ></div>
              </div>

              {/* Footer info */}
              <div className="flex items-center justify-between text-[11px] text-slate-500 mt-2">
                <span>
                  {remaining >= 0 ? (
                    <>Remaining: <strong className="text-slate-300">{currency.symbol}{remaining.toLocaleString()}</strong></>
                  ) : (
                    <>Overspent: <strong className="text-rose-400">+{currency.symbol}{Math.abs(remaining).toLocaleString()}</strong></>
                  )}
                </span>
                <span>{currentMonthExpenses.filter((e) => e.category === budget.category).length} purchases</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Budgeting Recommendation Card */}
      <div className="bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-slate-900 border border-emerald-800/30 rounded-2xl p-4 text-xs">
        <div className="flex items-center gap-2 mb-2 text-emerald-400 font-bold">
          <Sparkles className="w-4 h-4" />
          <span>Smart Spending Insight</span>
        </div>
        <p className="text-slate-300 leading-relaxed text-[11px]">
          Gmail sync automatically checks incoming payment receipts and tags merchants. Food and dining typically represents 25-35% of monthly discretionary spend. Adjust your caps above to receive real-time warnings whenever an incoming debit email pushes you over 80%.
        </p>
      </div>
    </div>
  );
};
