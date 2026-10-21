import React, { useState } from 'react';
import { User } from 'firebase/auth';
import {
  Building2,
  FileSpreadsheet,
  FileText,
  LogOut,
  CheckCircle2,
  Download,
  Share2,
} from 'lucide-react';

interface CustomerVisitHeaderProps {
  user: User | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onExportExcel: () => void;
  onExportPdf: () => void;
  visitCount: number;
}

export const CustomerVisitHeader: React.FC<CustomerVisitHeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onExportExcel,
  onExportPdf,
  visitCount,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-4 py-3 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-4xl mx-auto flex items-center justify-between gap-3">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-black text-xs text-center leading-none">
            uPVC
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm font-extrabold tracking-tight text-white leading-tight">
                SCRAFT uPVC Profiles
              </h1>
              <span className="px-1.5 py-0.2 rounded text-[9px] font-bold bg-sky-500/15 text-sky-400 border border-sky-500/30">
                All-India Sales
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">
              Raviraja Industries Private Limited
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Excel Export */}
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Download Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Quick PDF Export */}
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition active:scale-95"
            title="Download PDF Report"
          >
            <FileText className="w-3.5 h-3.5 text-rose-400" />
            <span className="hidden sm:inline">PDF</span>
          </button>

          {/* Google / Gmail Connected Profile */}
          {user ? (
            <div className="relative">
              <button
                type="button"
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:ring-2 hover:ring-sky-500/50 transition"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Executive'}
                    className="w-7 h-7 rounded-full object-cover border border-slate-700"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white text-xs font-bold flex items-center justify-center">
                    {user.email ? user.email[0].toUpperCase() : 'R'}
                  </div>
                )}
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-xl p-2 z-50 text-xs">
                  <div className="px-2 py-1.5 border-b border-slate-700 mb-1">
                    <p className="font-semibold text-slate-100 truncate">
                      {user.displayName || 'Raviraja Industries'}
                    </p>
                    <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    <span className="inline-flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" /> Connected & Synced
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
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              type="button"
              onClick={onLogin}
              disabled={isLoggingIn}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 text-xs font-semibold shadow-sm transition active:scale-95 disabled:opacity-60"
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
              <span>{isLoggingIn ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
