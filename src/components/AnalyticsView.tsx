import React, { useState } from 'react';
import {
  FileSpreadsheet,
  FileText,
  Download,
  Calendar,
  PieChart,
  BarChart3,
  CreditCard,
  Building,
  CheckCircle2,
} from 'lucide-react';
import { Expense, BudgetGoal, CurrencyConfig } from '../types/expense';
import { ExportService } from '../services/exportService';

interface AnalyticsViewProps {
  expenses: Expense[];
  budgets: BudgetGoal[];
  currency: CurrencyConfig;
}

export const AnalyticsView: React.FC<AnalyticsViewProps> = ({
  expenses,
  budgets,
  currency,
}) => {
  const [exportTitle, setExportTitle] = useState('Personal Budget Expenses');
  const [dateRange, setDateRange] = useState<'all' | 'this_month' | 'last_30_days'>('this_month');
  const [isExporting, setIsExporting] = useState<string | null>(null);

  // Filter expenses according to dateRange
  const now = new Date();
  const currentMonthStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  const thirtyDaysAgoStr = new Date(Date.now() - 30 * 24 * 3600 * 1000).toISOString().split('T')[0];

  const filteredExpenses = expenses.filter((e) => {
    if (dateRange === 'this_month') return e.date.startsWith(currentMonthStr);
    if (dateRange === 'last_30_days') return e.date >= thirtyDaysAgoStr;
    return true; // 'all'
  });

  const totalSpent = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  // Category aggregations
  const categoryMap: { [key: string]: number } = {};
  filteredExpenses.forEach((e) => {
    categoryMap[e.category] = (categoryMap[e.category] || 0) + e.amount;
  });

  const sortedCategories = Object.entries(categoryMap)
    .map(([cat, amount]) => ({
      category: cat,
      amount,
      percentage: totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0,
      color: budgets.find((b) => b.category === cat)?.color || '#94a3b8',
    }))
    .sort((a, b) => b.amount - a.amount);

  // Top Merchants
  const merchantMap: { [key: string]: { amount: number; count: number } } = {};
  filteredExpenses.forEach((e) => {
    const name = e.merchant || e.title;
    if (!merchantMap[name]) merchantMap[name] = { amount: 0, count: 0 };
    merchantMap[name].amount += e.amount;
    merchantMap[name].count += 1;
  });

  const topMerchants = Object.entries(merchantMap)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5);

  // Payment Method aggregations
  const paymentMap: { [key: string]: number } = {};
  filteredExpenses.forEach((e) => {
    paymentMap[e.paymentMethod] = (paymentMap[e.paymentMethod] || 0) + e.amount;
  });

  const handleExportExcel = () => {
    setIsExporting('excel');
    try {
      ExportService.exportToExcel(filteredExpenses, budgets, currency.symbol, exportTitle.replace(/\s+/g, '_'));
    } catch (e) {
      console.error('Excel export error:', e);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  const handleExportPdf = () => {
    setIsExporting('pdf');
    try {
      ExportService.exportToPdf(filteredExpenses, budgets, currency.symbol, exportTitle);
    } catch (e) {
      console.error('PDF export error:', e);
    } finally {
      setTimeout(() => setIsExporting(null), 800);
    }
  };

  return (
    <div className="space-y-5 pb-8">
      {/* Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Financial Reports & Exports</h2>
        <p className="text-xs text-slate-400">
          Visualize real-time spending habits and download official PDF or Excel records.
        </p>
      </div>

      {/* Date Range Selector */}
      <div className="flex bg-slate-900 border border-slate-800 p-1 rounded-xl">
        {(['this_month', 'last_30_days', 'all'] as const).map((range) => (
          <button
            key={range}
            type="button"
            onClick={() => setDateRange(range)}
            className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition ${
              dateRange === range
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {range === 'this_month' ? 'This Month' : range === 'last_30_days' ? 'Last 30 Days' : 'All Time'}
          </button>
        ))}
      </div>

      {/* EXPORT DATA CARD (Primary requirement) */}
      <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800/90 to-slate-900 border border-emerald-500/30 rounded-2xl p-4 shadow-xl">
        <div className="flex items-center gap-2 mb-2 text-emerald-400">
          <Download className="w-5 h-5" />
          <h3 className="text-sm font-bold text-white">Download Financial Reports</h3>
        </div>
        <p className="text-xs text-slate-300 mb-4">
          Export your tracked expenses, budget limits, and category summaries for accounting, tax filings, or record-keeping.
        </p>

        {/* Title input */}
        <div className="mb-4">
          <label className="text-[11px] text-slate-400 font-medium block mb-1">Statement Title</label>
          <input
            type="text"
            value={exportTitle}
            onChange={(e) => setExportTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500 font-medium"
            placeholder="Statement Title"
          />
        </div>

        {/* 2 Big Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Excel Export Button */}
          <button
            type="button"
            onClick={handleExportExcel}
            disabled={isExporting === 'excel'}
            className="flex items-center justify-between p-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 active:scale-[0.98] text-white font-bold text-xs shadow-lg shadow-emerald-950/40 transition group"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-emerald-700/80 flex items-center justify-center">
                <FileSpreadsheet className="w-5 h-5 text-emerald-100" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Download Excel</div>
                <div className="text-[10px] text-emerald-200 font-normal">.XLSX Workbook (3 Sheets)</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-emerald-200 group-hover:translate-y-0.5 transition" />
          </button>

          {/* PDF Export Button */}
          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting === 'pdf'}
            className="flex items-center justify-between p-3.5 rounded-xl bg-slate-700 hover:bg-slate-600 active:scale-[0.98] text-white font-bold text-xs shadow-lg transition group border border-slate-600"
          >
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-lg bg-rose-500/20 text-rose-400 flex items-center justify-center">
                <FileText className="w-5 h-5" />
              </div>
              <div className="text-left">
                <div className="text-xs font-bold leading-tight">Download PDF</div>
                <div className="text-[10px] text-slate-300 font-normal">Formatted Statement with Tables</div>
              </div>
            </div>
            <Download className="w-4 h-4 text-slate-300 group-hover:translate-y-0.5 transition" />
          </button>
        </div>

        <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Includes {filteredExpenses.length} records • Total: {currency.symbol}{totalSpent.toLocaleString()}</span>
        </div>
      </div>

      {/* Category Distribution Section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <PieChart className="w-4 h-4 text-emerald-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Spending by Category</h3>
          </div>
          <span className="text-xs font-bold text-white">
            Total: {currency.symbol}{totalSpent.toLocaleString()}
          </span>
        </div>

        {/* Stacked Percentage Bar */}
        <div className="w-full h-3 rounded-full overflow-hidden flex bg-slate-800 mb-4">
          {sortedCategories.map((c) => (
            <div
              key={c.category}
              style={{
                width: `${c.percentage}%`,
                backgroundColor: c.color,
              }}
              title={`${c.category}: ${c.percentage}%`}
              className="h-full hover:opacity-90 transition-all"
            ></div>
          ))}
        </div>

        {/* Breakdown Items */}
        <div className="space-y-2">
          {sortedCategories.map((c) => (
            <div key={c.category} className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }}></div>
                <span className="text-slate-200 truncate">{c.category}</span>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-slate-400 text-[11px] font-mono">{c.percentage}%</span>
                <span className="font-bold text-white">
                  {currency.symbol}{c.amount.toLocaleString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Top Merchants List */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <Building className="w-4 h-4 text-cyan-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Top Payees & Merchants</h3>
        </div>

        <div className="space-y-2.5">
          {topMerchants.map((m, idx) => (
            <div key={m.name} className="flex items-center justify-between text-xs p-2 rounded-xl bg-slate-800/60">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="w-5 h-5 rounded-full bg-slate-700 text-slate-300 font-bold text-[10px] flex items-center justify-center shrink-0">
                  {idx + 1}
                </span>
                <div className="min-w-0">
                  <p className="font-semibold text-white truncate">{m.name}</p>
                  <p className="text-[10px] text-slate-400">{m.count} transaction{m.count > 1 ? 's' : ''}</p>
                </div>
              </div>
              <span className="font-bold text-white">
                {currency.symbol}{m.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Method Distribution */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center gap-2 mb-3">
          <CreditCard className="w-4 h-4 text-indigo-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Payment Channels</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {Object.entries(paymentMap).map(([method, amount]) => (
            <div key={method} className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-3">
              <span className="text-[11px] text-slate-400 block">{method}</span>
              <span className="text-sm font-bold text-white block mt-0.5">
                {currency.symbol}{amount.toLocaleString()}
              </span>
              <span className="text-[10px] text-slate-500">
                {totalSpent > 0 ? Math.round((amount / totalSpent) * 100) : 0}% of spend
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
