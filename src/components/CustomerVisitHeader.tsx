import React, { useState } from 'react';
import { AppUser } from '../services/firebaseAuth';
import {
  FileSpreadsheet,
  FileText,
  LogOut,
  CheckCircle2,
  RefreshCw,
  Cloud,
  ChevronDown,
} from 'lucide-react';

interface CustomerVisitHeaderProps {
  user: AppUser | null;
  onLogin: () => void;
  onLogout: () => void;
  isLoggingIn: boolean;
  onExportExcel: () => void;
  onExportPdf: () => void;
  visitCount: number;
  isCloudConnected?: boolean;
  onForceSync?: () => void;
  isSyncing?: boolean;
}

export const CustomerVisitHeader: React.FC<CustomerVisitHeaderProps> = ({
  user,
  onLogin,
  onLogout,
  isLoggingIn,
  onExportExcel,
  onExportPdf,
  visitCount,
  isCloudConnected = true,
  onForceSync,
  isSyncing = false,
}) => {
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-slate-900 border-b border-slate-800 text-white px-3 sm:px-4 py-2.5 shadow-md backdrop-blur-md bg-opacity-95">
      <div className="max-w-5xl mx-auto flex items-center justify-between gap-2">
        {/* Brand identity */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-700 flex items-center justify-center shadow-md shadow-sky-500/20 text-white font-black text-xs text-center leading-none">
            uPVC
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <h1 className="text-xs sm:text-sm font-extrabold tracking-tight text-white leading-tight">
                SCRAFT uPVC Profiles
              </h1>
              {/* LIVE SYNC STATUS BADGE */}
              <button
                type="button"
                onClick={onForceSync}
                className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[9px] font-bold border transition active:scale-95 ${
                  isCloudConnected
                    ? 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/25'
                    : 'bg-amber-500/15 text-amber-400 border-amber-500/30 hover:bg-amber-500/25'
                }`}
                title="Click to force sync all records across devices"
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isCloudConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                ></span>
                <span className="hidden sm:inline">
                  {isSyncing ? 'SYNCING...' : isCloudConnected ? 'LIVE SYNC' : 'OFFLINE'}
                </span>
                <RefreshCw
                  className={`w-2.5 h-2.5 ${isSyncing ? 'animate-spin text-emerald-300' : ''}`}
                />
              </button>
            </div>
            <p className="text-[9px] text-slate-400 leading-tight truncate max-w-[200px] sm:max-w-none">
              Raviraja Industries • Multi-Device Real-Time Cloud
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-1.5">
          {/* Quick Manual Cloud Push & Sync Button */}
          {onForceSync && (
            <button
              type="button"
              onClick={onForceSync}
              disabled={isSyncing}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition active:scale-95 disabled:opacity-50"
              title="Force Sync All Records to Cloud Firestore"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-sky-400' : ''}`} />
            </button>
          )}

          {/* Quick Excel Export */}
          <button
            type="button"
            onClick={onExportExcel}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold shadow-sm transition active:scale-95"
            title="Download Excel (.xlsx)"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Excel</span>
          </button>

          {/* Quick PDF Export */}
          <button
            type="button"
            onClick={onExportPdf}
            className="flex items-center gap-1 px-2 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 shadow-sm transition active:scale-95"
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
                className="flex items-center gap-1 p-1 rounded-full hover:ring-2 hover:ring-sky-500/50 transition bg-slate-800 border border-slate-700"
              >
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Executive'}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-6 h-6 rounded-full bg-sky-600 text-white text-[10px] font-bold flex items-center justify-center">
                    {user.email ? user.email[0].toUpperCase() : 'R'}
                  </div>
                )}
                <span className="hidden md:inline text-[11px] font-medium text-slate-200 max-w-[120px] truncate pr-1">
                  {user.email}
                </span>
                <ChevronDown className="w-3 h-3 text-slate-400" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-64 bg-slate-800 border border-slate-700 rounded-2xl shadow-2xl p-3 z-50 text-xs">
                  <div className="pb-2 border-b border-slate-700 mb-2">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <p className="font-bold text-white truncate">
                        {user.displayName || 'Sales Executive'}
                      </p>
                      <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold ${user.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'}`}>
                        {(user.role || 'sales').toUpperCase()}
                      </span>
                    </div>
                    <p className="text-[11px] text-sky-300 font-mono truncate">{user.mobileNumber || user.email}</p>
                    {user.designation && (
                      <p className="text-[10px] text-slate-400 mt-0.5 truncate">{user.designation}</p>
                    )}
                    <div className="flex items-center gap-1 mt-1 text-[10px] text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>Live Synced Across Devices</span>
                    </div>
                  </div>

                  {onForceSync && (
                    <button
                      type="button"
                      onClick={() => {
                        setShowUserMenu(false);
                        onForceSync();
                      }}
                      className="w-full text-left px-2 py-1.5 rounded-xl hover:bg-slate-700 text-slate-200 flex items-center gap-2 transition mb-1 text-xs"
                    >
                      <Cloud className="w-3.5 h-3.5 text-sky-400" />
                      <span>Force Push & Sync All Records</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onLogout();
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-xl text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 transition text-xs"
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
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold shadow-sm transition active:scale-95 disabled:opacity-60"
            >
              <Cloud className="w-3.5 h-3.5" />
              <span>{isLoggingIn ? 'Connecting...' : 'Connect'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
