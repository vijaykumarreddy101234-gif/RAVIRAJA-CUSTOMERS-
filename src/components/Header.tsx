import React, { useState } from 'react';
import { User } from 'firebase/auth';
import { Mail, RefreshCw, LogOut, ChevronDown, CheckCircle2, AlertCircle } from 'lucide-react';
import { CurrencyConfig } from '../types/expense';
import { CURRENCIES } from '../services/storage';

interface HeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  currency: CurrencyConfig;
  onSelectCurrency: (code: string) => void;
  onQuickSync: () => void;
  isSyncing: boolean;
  lastSyncTime?: number;
}

export const Header: React.FC<HeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  currency,
  onSelectCurrency,
  onQuickSync,
  isSyncing,
  lastSyncTime,
}) => {
  const [showCurrencyDropdown, setShowCurrencyDropdown] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand & Live status */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-500 flex items-center justify-center shadow-md shadow-emerald-500/20">
            <Mail className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-bold tracking-tight text-white leading-none">SpendSync</h1>
              <span className="flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                LIVE
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-none mt-1">Gmail Expense Tracker</p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Currency Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setShowCurrencyDropdown(!showCurrencyDropdown);
                setShowUserMenu(false);
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
              title="Change Currency"
            >
              <span>{currency.symbol}</span>
              <span className="hidden sm:inline">{currency.code}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {showCurrencyDropdown && (
              <div className="absolute right-0 mt-1.5 w-32 bg-slate-800 border border-slate-700 rounded-xl shadow-xl py-1 z-50">
                {CURRENCIES.map((c) => (
                  <button
                    key={c.code}
                    type="button"
                    onClick={() => {
                      onSelectCurrency(c.code);
                      setShowCurrencyDropdown(false);
                    }}
                    className={`w-full text-left px-3 py-1.5 text-xs flex items-center justify-between hover:bg-slate-700 transition ${
                      c.code === currency.code ? 'text-emerald-400 font-bold bg-slate-700/50' : 'text-slate-300'
                    }`}
                  >
                    <span>{c.label}</span>
                    {c.code === currency.code && <CheckCircle2 className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Quick Gmail Sync Button */}
          {user && (
            <button
              type="button"
              onClick={onQuickSync}
              disabled={isSyncing}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition shadow-sm ${
                isSyncing
                  ? 'bg-emerald-600/60 text-white cursor-wait'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white active:scale-95'
              }`}
              title={lastSyncTime ? `Last synced: ${new Date(lastSyncTime).toLocaleTimeString()}` : 'Sync Gmail'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">{isSyncing ? 'Syncing...' : 'Sync'}</span>
            </button>
          )}

          {/* Google Auth Button / User Profile */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  setShowUserMenu(!showUserMenu);
                  setShowCurrencyDropdown(false);
                }}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-emerald-500/50 transition"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'User'}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-emerald-700 text-white text-xs font-bold flex items-center justify-center border border-slate-700">
                    {user.email ? user.email[0].toUpperCase() : 'U'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-slate-700 mb-1">
                    <p className="font-semibold text-slate-100 truncate">{user.displayName || 'Connected Account'}</p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Gmail Read Access Active
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Disconnect & Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-800 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-60"
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
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
              <span>{isLoggingIn ? 'Connecting...' : 'Connect Gmail'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
