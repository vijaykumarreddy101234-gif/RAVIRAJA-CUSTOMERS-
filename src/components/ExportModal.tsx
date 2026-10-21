import React, { useState } from 'react';
import { X, FileSpreadsheet, FileText, Download, CheckCircle2 } from 'lucide-react';
import { Expense, BudgetGoal, CurrencyConfig } from '../types/expense';
import { ExportService } from '../services/exportService';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  expenses: Expense[];
  budgets: BudgetGoal[];
  currency: CurrencyConfig;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  expenses,
  budgets,
  currency,
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('Personal Budget Expenses');
  const [period, setPeriod] = useState<'this_month' | 'last_30_days' | 'all'>('this_month');
  const [isDownloading, setIsDownloading] = useState<string | null>(null);

  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const filtered = expenses.filter((e) => {
    if (period === 'this_month') return e.date.startsWith(currentMonthStr);
    if (period === 'last_30_days') return e.date >= thirtyDaysAgo;
    return true;
  });

  const totalAmount = filtered.reduce((s, e) => s + e.amount, 0);

  const handleDownloadExcel = () => {
    setIsDownloading('excel');
    try {
      ExportService.exportToExcel(filtered, budgets, currency.symbol, title.replace(/\s+/g, '_'));
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsDownloading(null);
        onClose();
      }, 600);
    }
  };

  const handleDownloadPdf = () => {
    setIsDownloading('pdf');
    try {
      ExportService.exportToPdf(filtered, budgets, currency.symbol, title);
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsDownloading(null);
        onClose();
      }, 600);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md p-5 shadow-2xl text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Download className="w-4 h-4 text-emerald-400" />
            <h3 className="text-sm font-bold text-white">Export Expenses & Budget</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Options */}
        <div className="space-y-3 text-xs">
          <div>
            <label className="text-slate-400 font-semibold block mb-1">Time Period</label>
            <div className="grid grid-cols-3 gap-1.5">
              {[
                { id: 'this_month', label: 'This Month' },
                { id: 'last_30_days', label: 'Last 30 Days' },
                { id: 'all', label: 'All History' },
              ].map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPeriod(p.id as any)}
                  className={`py-2 rounded-xl font-semibold text-xs transition ${
                    period === p.id
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-slate-400 font-semibold block mb-1">Statement Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Quick preview stats */}
          <div className="p-3 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
            <span>Selected Records: <strong className="text-white">{filtered.length}</strong></span>
            <span>Total Sum: <strong className="text-emerald-400 font-bold">{currency.symbol}{totalAmount.toLocaleString()}</strong></span>
          </div>

          {/* Export Action Buttons */}
          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              type="button"
              onClick={handleDownloadExcel}
              disabled={isDownloading === 'excel'}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
              <span>Download Excel</span>
              <span className="text-[10px] text-emerald-200 font-normal">.xlsx file</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isDownloading === 'pdf'}
              className="p-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white font-bold text-xs flex flex-col items-center justify-center gap-1.5 shadow-md transition active:scale-95 disabled:opacity-50"
            >
              <FileText className="w-5 h-5 text-rose-400" />
              <span>Download PDF</span>
              <span className="text-[10px] text-slate-300 font-normal">.pdf document</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
