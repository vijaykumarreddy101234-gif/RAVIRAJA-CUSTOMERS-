import React, { useState, useMemo, useRef } from 'react';
import {
  Search,
  Filter,
  Plus,
  Mail,
  Trash2,
  CheckCircle,
  ArrowUpDown,
  Tag,
  Calendar,
  CreditCard,
  Eye,
  Upload,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { Expense, ExpenseCategory, CurrencyConfig } from '../types/expense';

interface ExpensesViewProps {
  expenses: Expense[];
  currency: CurrencyConfig;
  onSelectExpense: (expense: Expense) => void;
  onOpenAddExpense: () => void;
  onDeleteExpense: (id: string) => void;
  onVerifyExpense: (expense: Expense) => void;
  onImportExpenses?: (imported: Expense[]) => void;
}

export const ExpensesView: React.FC<ExpensesViewProps> = ({
  expenses,
  currency,
  onSelectExpense,
  onOpenAddExpense,
  onDeleteExpense,
  onVerifyExpense,
  onImportExpenses,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSource, setSelectedSource] = useState<'All' | 'Gmail' | 'Manual'>('All');
  const [sortBy, setSortBy] = useState<'date_desc' | 'date_asc' | 'amount_desc' | 'amount_asc'>('date_desc');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        const data: any[] = XLSX.utils.sheet_to_json(ws);

        const imported: Expense[] = [];
        data.forEach((row, idx) => {
          // Identify amount
          const rawAmount =
            row['Amount'] || row['amount'] || row['Total'] || row['total'] || row['Spent'] || row['Debit'] || row['Quantity / Month'] || 0;
          const parsedAmount = typeof rawAmount === 'number' ? rawAmount : parseFloat(String(rawAmount).replace(/[^0-9.]/g, ''));

          if (parsedAmount && !isNaN(parsedAmount) && parsedAmount > 0) {
            const title =
              row['Merchant / Payee'] ||
              row['Merchant'] ||
              row['Title'] ||
              row['Description'] ||
              row['Customer Name'] ||
              row['Company Name'] ||
              `Imported Entry #${idx + 1}`;

            const category: ExpenseCategory =
              (row['Category'] as ExpenseCategory) ||
              (row['Customer Type'] ? 'Business & Sales' : 'Other');

            const date =
              row['Date'] ||
              row['Customer Visit Date'] ||
              new Date().toISOString().split('T')[0];

            imported.push({
              id: `imported-${Date.now()}-${idx}`,
              title: String(title),
              merchant: String(title),
              amount: parsedAmount,
              currency: currency.code,
              category,
              date: String(date).slice(0, 10),
              paymentMethod: row['Payment Method'] || row['PI Sent?'] || 'Imported File',
              notes: row['Visit Remarks'] || row['Notes'] || undefined,
              status: 'manual',
              createdAt: Date.now(),
            });
          }
        });

        if (imported.length > 0 && onImportExpenses) {
          onImportExpenses(imported);
        }
      } catch (err) {
        console.error('File import error:', err);
      }
    };
    reader.readAsBinaryString(file);
    if (e.target) e.target.value = '';
  };

  const categories: string[] = [
    'All',
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

  const filteredExpenses = useMemo(() => {
    return expenses
      .filter((exp) => {
        // Search filter
        const matchSearch =
          searchTerm === '' ||
          (exp.merchant || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          exp.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exp.notes || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
          (exp.emailSource?.subject || '').toLowerCase().includes(searchTerm.toLowerCase());

        // Category filter
        const matchCategory = selectedCategory === 'All' || exp.category === selectedCategory;

        // Source filter
        const matchSource =
          selectedSource === 'All' ||
          (selectedSource === 'Gmail' && exp.status === 'auto_detected') ||
          (selectedSource === 'Manual' && exp.status !== 'auto_detected');

        return matchSearch && matchCategory && matchSource;
      })
      .sort((a, b) => {
        if (sortBy === 'date_desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date_asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount_desc') return b.amount - a.amount;
        if (sortBy === 'amount_asc') return a.amount - b.amount;
        return 0;
      });
  }, [expenses, searchTerm, selectedCategory, selectedSource, sortBy]);

  const totalFilteredAmount = filteredExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-4 pb-8">
      {/* Top Bar with Title and Add Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight">All Expenses</h2>
          <p className="text-xs text-slate-400">
            {filteredExpenses.length} records • Total: <strong className="text-white font-bold">{currency.symbol}{totalFilteredAmount.toLocaleString()}</strong>
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            accept=".csv, .xlsx, .xls"
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold border border-slate-700 active:scale-95 transition"
            title="Import from CSV or Excel file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Import</span>
          </button>
          <button
            type="button"
            onClick={onOpenAddExpense}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-md active:scale-95 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Add</span>
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search merchant, Uber, Swiggy, Amazon, notes..."
          className="w-full bg-slate-900 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner"
        />
        {searchTerm && (
          <button
            type="button"
            onClick={() => setSearchTerm('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-white"
          >
            ✕
          </button>
        )}
      </div>

      {/* Category Pills (Horizontal scrollable) */}
      <div className="overflow-x-auto no-scrollbar -mx-4 px-4 flex gap-1.5 pb-1">
        {categories.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setSelectedCategory(cat)}
            className={`whitespace-nowrap px-3 py-1.5 rounded-full text-xs font-medium transition ${
              selectedCategory === cat
                ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Filter Options Row: Source & Sort */}
      <div className="flex items-center justify-between gap-2 text-xs">
        {/* Source Toggle */}
        <div className="flex bg-slate-800 p-0.5 rounded-lg border border-slate-700">
          {(['All', 'Gmail', 'Manual'] as const).map((source) => (
            <button
              key={source}
              type="button"
              onClick={() => setSelectedSource(source)}
              className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition ${
                selectedSource === source
                  ? 'bg-slate-700 text-white font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {source === 'Gmail' ? 'Gmail Auto' : source}
            </button>
          ))}
        </div>

        {/* Sort Selector */}
        <div className="flex items-center gap-1.5">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e: any) => setSortBy(e.target.value)}
            className="bg-slate-800 border border-slate-700 text-slate-200 text-[11px] rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
          >
            <option value="date_desc">Newest First</option>
            <option value="date_asc">Oldest First</option>
            <option value="amount_desc">Highest Amount</option>
            <option value="amount_asc">Lowest Amount</option>
          </select>
        </div>
      </div>

      {/* Expenses List */}
      <div className="space-y-2">
        {filteredExpenses.length === 0 ? (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800/80 p-6">
            <Tag className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <h4 className="text-sm font-semibold text-slate-300">No matching expenses found</h4>
            <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
              Try adjusting your search query, selecting another category, or sync your Gmail account to fetch new transactions.
            </p>
          </div>
        ) : (
          filteredExpenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-slate-700 rounded-xl p-3.5 transition shadow-sm group"
            >
              <div className="flex items-start justify-between gap-3">
                {/* Left: Info */}
                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => onSelectExpense(exp)}
                >
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="text-sm font-bold text-white truncate">
                      {exp.merchant || exp.title}
                    </span>
                    {exp.status === 'auto_detected' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-cyan-500/15 text-cyan-400 border border-cyan-500/25">
                        <Mail className="w-2.5 h-2.5" /> Gmail Sync
                      </span>
                    ) : exp.status === 'verified' ? (
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/25">
                        <CheckCircle className="w-2.5 h-2.5" /> Verified
                      </span>
                    ) : (
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                        Manual
                      </span>
                    )}
                  </div>

                  {/* Metadata Row */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5">
                    <span className="px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-medium border border-slate-700/50">
                      {exp.category}
                    </span>
                    <span className="flex items-center gap-1 text-[11px]">
                      <Calendar className="w-3 h-3 text-slate-500" />
                      {exp.date}
                    </span>
                    <span className="flex items-center gap-1 text-[11px] text-slate-500 hidden sm:flex">
                      <CreditCard className="w-3 h-3" />
                      {exp.paymentMethod}
                    </span>
                  </div>

                  {/* Snippet / Notes preview if any */}
                  {exp.notes && (
                    <p className="text-[11px] text-slate-400/80 mt-1.5 line-clamp-1 italic">
                      "{exp.notes}"
                    </p>
                  )}
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex flex-col items-end shrink-0">
                  <span className="text-sm font-extrabold text-white">
                    -{currency.symbol}{exp.amount.toLocaleString()}
                  </span>

                  <div className="flex items-center gap-1 mt-2">
                    <button
                      type="button"
                      onClick={() => onSelectExpense(exp)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition"
                      title="Inspect Details"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (window.confirm(`Delete expense "${exp.merchant || exp.title}" of ${currency.symbol}${exp.amount}?`)) {
                          onDeleteExpense(exp.id);
                        }
                      }}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition"
                      title="Delete Expense"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
