import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Mail,
  RefreshCw,
  Shield,
  CheckCircle2,
  AlertCircle,
  Clock,
  Sparkles,
  Inbox,
  Lock,
  ArrowRight,
  Sliders,
  ExternalLink,
} from 'lucide-react';
import { Expense, SyncLog } from '../types/expense';
import { ScanProgress } from '../services/gmailScanner';

interface GmailSyncViewProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onRunScan: (days: number) => void;
  isSyncing: boolean;
  scanProgress: ScanProgress | null;
  lastSyncTime?: number;
  syncLogs: SyncLog[];
  autoSyncEnabled: boolean;
  onToggleAutoSync: (enabled: boolean) => void;
  onLoadSampleEmails: () => void;
}

export const GmailSyncView: React.FC<GmailSyncViewProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onRunScan,
  isSyncing,
  scanProgress,
  lastSyncTime,
  syncLogs,
  autoSyncEnabled,
  onToggleAutoSync,
  onLoadSampleEmails,
}) => {
  const [selectedDays, setSelectedDays] = useState<number>(30);

  return (
    <div className="space-y-4 pb-8">
      {/* View Header */}
      <div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">Gmail Automated Sync</h2>
        <p className="text-xs text-slate-400">
          Automatically extract bank debit alerts, UPI payments, and digital purchase receipts from your Gmail.
        </p>
      </div>

      {/* Account Connection Status Card */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg">
        {user ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-10 h-10 rounded-full border border-emerald-500/50"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-emerald-600 text-white font-bold flex items-center justify-center text-sm">
                    {user.email ? user.email[0].toUpperCase() : 'G'}
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-white">{user.displayName || 'Connected Account'}</span>
                    <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      ACTIVE
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono">{user.email}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="text-xs text-rose-400 hover:text-rose-300 font-medium px-2 py-1 rounded-lg hover:bg-rose-500/10 transition"
              >
                Disconnect
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-800/70 border border-slate-700/60 flex items-center justify-between text-xs text-slate-300">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Gmail Read-Only Permission Active
              </span>
              <span className="text-[11px] text-slate-400">
                {lastSyncTime ? `Last synced: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Ready to scan'}
              </span>
            </div>
          </div>
        ) : (
          <div className="text-center py-4 space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-rose-500/20 to-orange-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Connect Your Gmail Account</h3>
              <p className="text-xs text-slate-400 max-w-sm mx-auto mt-1">
                Grant read permission so SpendSync can scan incoming bank debits, card swipes, Swiggy/Uber bills, and order receipts without manual typing.
              </p>
            </div>
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs shadow-md transition active:scale-95 disabled:opacity-60"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>{isLoggingIn ? 'Connecting...' : 'Sign in with Google to Connect'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Sync Parameters & Controls */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sliders className="w-4 h-4 text-emerald-400" />
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">Sync Settings</h3>
        </div>

        {/* Lookback Window */}
        <div>
          <label className="text-[11px] font-semibold text-slate-300 block mb-2">Scan Lookback Period</label>
          <div className="grid grid-cols-4 gap-2">
            {[7, 14, 30, 90].map((days) => (
              <button
                key={days}
                type="button"
                onClick={() => setSelectedDays(days)}
                className={`py-2 text-xs font-bold rounded-xl transition ${
                  selectedDays === days
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700 border border-slate-700/60'
                }`}
              >
                {days} Days
              </button>
            ))}
          </div>
        </div>

        {/* Auto Sync Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-slate-800/60 border border-slate-700/60">
          <div>
            <span className="text-xs font-bold text-white block">Real-time Background Auto-Sync</span>
            <span className="text-[10px] text-slate-400">
              Periodically check for new debit emails while app is open
            </span>
          </div>
          <button
            type="button"
            onClick={() => onToggleAutoSync(!autoSyncEnabled)}
            className={`w-11 h-6 flex items-center rounded-full p-1 transition-colors duration-200 ease-in-out ${
              autoSyncEnabled ? 'bg-emerald-500' : 'bg-slate-700'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform duration-200 ease-in-out ${
                autoSyncEnabled ? 'translate-x-5' : 'translate-x-0'
              }`}
            ></div>
          </button>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => onRunScan(selectedDays)}
          disabled={isSyncing}
          className={`w-full py-3.5 rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg transition active:scale-[0.98] ${
            isSyncing
              ? 'bg-emerald-600/70 text-white cursor-wait'
              : 'bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 hover:opacity-95 text-white'
          }`}
        >
          <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
          <span>{isSyncing ? 'Scanning Gmail Transactions...' : `Scan Gmail (${selectedDays} Days)`}</span>
        </button>

        {/* Demo Fallback for instantaneous preview */}
        <button
          type="button"
          onClick={onLoadSampleEmails}
          className="w-full py-2 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 text-[11px] font-semibold border border-slate-700/60 transition"
        >
          Load Verified Demo Email Transactions (Instant Preview)
        </button>
      </div>

      {/* Live Scanning Progress / Feed Box */}
      {scanProgress && (
        <div className="bg-slate-900 border border-emerald-500/30 rounded-2xl p-4 space-y-3 shadow-md animate-fade-in">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
              <RefreshCw className={`w-3.5 h-3.5 ${scanProgress.phase !== 'complete' ? 'animate-spin' : ''}`} />
              Live Scan Activity
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              {scanProgress.currentCount} / {scanProgress.totalCount} emails
            </span>
          </div>

          <p className="text-xs text-slate-200 font-medium">{scanProgress.statusText}</p>

          {/* Progress bar */}
          <div className="w-full h-2 rounded-full bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-300"
              style={{
                width: `${
                  scanProgress.totalCount > 0
                    ? Math.round((scanProgress.currentCount / scanProgress.totalCount) * 100)
                    : 10
                }%`,
              }}
            ></div>
          </div>

          {/* Recently detected during this scan */}
          {scanProgress.foundExpenses.length > 0 && (
            <div className="space-y-1.5 pt-2 border-t border-slate-800">
              <span className="text-[10px] uppercase tracking-wider font-bold text-slate-400 block">
                Found in this session ({scanProgress.foundExpenses.length})
              </span>
              <div className="max-h-36 overflow-y-auto space-y-1.5 pr-1">
                {scanProgress.foundExpenses.slice(0, 5).map((e) => (
                  <div
                    key={e.id}
                    className="p-2 rounded-lg bg-slate-800/80 text-xs flex items-center justify-between"
                  >
                    <span className="font-semibold text-slate-200 truncate pr-2">{e.merchant || e.title}</span>
                    <span className="font-bold text-emerald-400 shrink-0">
                      ₹{e.amount.toLocaleString()}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Privacy & Security Guarantees */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
        <div className="flex items-center gap-2 text-slate-300 font-bold">
          <Shield className="w-4 h-4 text-emerald-400" />
          <span>Bank-Grade Security & Privacy</span>
        </div>
        <ul className="space-y-1 text-[11px] list-disc list-inside text-slate-400">
          <li><strong>Zero Server Storage:</strong> Your emails are processed directly inside your browser. No emails or credentials are ever sent to third-party databases.</li>
          <li><strong>Read-Only Access:</strong> The app only has <code className="text-emerald-400 font-mono text-[10px]">gmail.readonly</code> permission. It cannot send, alter, or delete any of your emails.</li>
          <li><strong>Specific Keyword Filter:</strong> Only bank debit alerts, payment receipts, and invoices are scanned. Personal correspondence is completely ignored.</li>
        </ul>
      </div>

      {/* Sync History Logs */}
      {syncLogs.length > 0 && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4">
          <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">Sync History</h4>
          <div className="space-y-2">
            {syncLogs.slice(0, 5).map((log, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between text-xs p-2 rounded-lg bg-slate-800/50"
              >
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5 text-slate-500" />
                  <span className="text-slate-300">
                    {new Date(log.timestamp).toLocaleDateString()} {new Date(log.timestamp).toLocaleTimeString()}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-cyan-400 font-medium">
                    +{log.expensesFound} expenses
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({log.emailsScanned} scanned)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
