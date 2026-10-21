import React, { useState } from 'react';
import {
  X,
  Mail,
  Calendar,
  CreditCard,
  Tag,
  CheckCircle,
  Trash2,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Expense, ExpenseCategory, CurrencyConfig } from '../types/expense';

interface ExpenseDetailModalProps {
  expense: Expense | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateExpense: (expense: Expense) => void;
  onDeleteExpense: (id: string) => void;
  currency: CurrencyConfig;
}

const CATEGORIES: ExpenseCategory[] = [
  'Food & Dining',
  'Groceries',
  'Shopping & Retail',
  'Travel & Transport',
  'Bills & Utilities',
  'Entertainment',
  'Health & Medical',
  'Business & Sales',
  'Transfers & Investments',
  'Other',
];

export const ExpenseDetailModal: React.FC<ExpenseDetailModalProps> = ({
  expense,
  isOpen,
  onClose,
  onUpdateExpense,
  onDeleteExpense,
  currency,
}) => {
  if (!isOpen || !expense) return null;

  const [category, setCategory] = useState<ExpenseCategory>(expense.category);
  const [notes, setNotes] = useState(expense.notes || '');

  const handleSaveCategory = (newCat: ExpenseCategory) => {
    setCategory(newCat);
    onUpdateExpense({
      ...expense,
      category: newCat,
      status: 'verified',
    });
  };

  const handleToggleVerified = () => {
    const newStatus = expense.status === 'verified' ? 'auto_detected' : 'verified';
    onUpdateExpense({
      ...expense,
      status: newStatus,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-lg p-5 shadow-2xl overflow-hidden text-white space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400">Expense Inspector</span>
            {expense.status === 'auto_detected' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                Gmail Auto-Synced
              </span>
            ) : expense.status === 'verified' ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                Verified
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400">
                Manual Entry
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Big Amount Card */}
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/80 flex items-center justify-between">
          <div>
            <h3 className="text-base font-extrabold text-white">{expense.merchant || expense.title}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{expense.date} • {expense.paymentMethod}</p>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-rose-400">
              -{currency.symbol}{expense.amount.toLocaleString()}
            </span>
            <span className="text-[10px] text-slate-400 block">{expense.currency}</span>
          </div>
        </div>

        {/* Category & Status Adjustment */}
        <div className="space-y-2 text-xs">
          <label className="text-slate-400 font-semibold block">Expense Category</label>
          <div className="grid grid-cols-2 gap-2">
            <select
              value={category}
              onChange={(e) => handleSaveCategory(e.target.value as ExpenseCategory)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={handleToggleVerified}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition border ${
                expense.status === 'verified'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
              }`}
            >
              <CheckCircle className="w-3.5 h-3.5" />
              <span>{expense.status === 'verified' ? 'Verified' : 'Mark as Verified'}</span>
            </button>
          </div>
        </div>

        {/* Email Source Inspector Card (If originated from Gmail) */}
        {expense.emailSource ? (
          <div className="bg-slate-950/80 border border-cyan-500/30 rounded-xl p-3.5 space-y-2 text-xs">
            <div className="flex items-center gap-2 text-cyan-400 font-bold">
              <Mail className="w-4 h-4" />
              <span>Original Gmail Receipt Source</span>
            </div>

            <div className="space-y-1.5 text-[11px] text-slate-300 font-mono">
              <div>
                <span className="text-slate-500">From: </span>
                <span className="text-slate-200">{expense.emailSource.sender}</span>
              </div>
              <div>
                <span className="text-slate-500">Subject: </span>
                <span className="text-slate-200">{expense.emailSource.subject}</span>
              </div>
              <div>
                <span className="text-slate-500">Received: </span>
                <span className="text-slate-400">{expense.emailSource.date}</span>
              </div>
            </div>

            {/* Snippet box */}
            <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-[11px] text-slate-300 leading-relaxed font-sans">
              <span className="text-[10px] text-slate-500 uppercase font-mono block mb-1">Decoded Email Snippet:</span>
              "{expense.emailSource.snippet}"
            </div>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-slate-800/40 border border-slate-800 text-xs text-slate-400">
            This expense was manually created.
          </div>
        )}

        {/* Notes */}
        {expense.notes && (
          <div className="text-xs">
            <span className="text-slate-400 font-semibold block mb-1">Attached Notes:</span>
            <p className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 text-slate-300 text-xs italic">
              {expense.notes}
            </p>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <button
            type="button"
            onClick={() => {
              if (window.confirm('Are you sure you want to delete this expense record?')) {
                onDeleteExpense(expense.id);
                onClose();
              }
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold transition"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Record</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
