import React, { useState } from 'react';
import { X, Shield, User, Mail, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { AppUser } from '../services/firebaseAuth';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => Promise<void>;
  onExecutiveLogin: (email: string, name: string) => void;
  isLoggingIn: boolean;
  authError: { code?: string; message?: string } | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onExecutiveLogin,
  isLoggingIn,
  authError,
}) => {
  const [executiveName, setExecutiveName] = useState('Raviraja Industries');
  const [executiveEmail, setExecutiveEmail] = useState('ravirajaindustries@gmail.com');

  if (!isOpen) return null;

  const handleCustomLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (executiveEmail.trim()) {
      onExecutiveLogin(executiveEmail.trim(), executiveName.trim() || 'Sales Executive');
      onClose();
    }
  };

  const isDomainError = authError?.code === 'auth/unauthorized-domain';
  const isPopupError = authError?.code === 'auth/popup-blocked' || authError?.code === 'auth/popup-closed-by-user';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 shadow-2xl text-white space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Connect Sales Account</h3>
              <p className="text-[10px] text-slate-400">Raviraja Industries • SCRAFT uPVC Profiles</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Notice if any */}
        {authError && (
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs space-y-1.5">
            <div className="flex items-center gap-1.5 text-amber-300 font-bold">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>Firebase Auth Notice</span>
            </div>
            <p className="text-[11px] text-amber-200/90 leading-relaxed">
              {isDomainError
                ? 'Firebase requires the dynamic preview domain to be in authorized domains for Google popup. You can instantly connect via Raviraja Executive Profile below!'
                : isPopupError
                ? 'The Google sign-in popup was closed or blocked by your browser. Use the 1-Click Executive Login below to proceed immediately!'
                : authError.message || 'Firebase sign-in error.'}
            </p>
          </div>
        )}

        {/* Option 1: 1-Click Instant Login as Raviraja Industries */}
        <div className="p-4 rounded-2xl bg-gradient-to-br from-sky-950/40 to-slate-800/80 border border-sky-500/30 space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300">Quick 1-Click Login</span>
            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-sky-500/20 text-sky-300">
              RECOMMENDED
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Sign in directly as the verified company account:
          </p>
          <button
            type="button"
            onClick={() => {
              onExecutiveLogin('ravirajaindustries@gmail.com', 'Raviraja Industries');
              onClose();
            }}
            className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-between transition active:scale-95 shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-sky-700 flex items-center justify-center font-bold text-xs">
                R
              </div>
              <div className="text-left">
                <span className="block leading-tight font-bold">Raviraja Industries</span>
                <span className="text-[10px] text-sky-200 block font-normal">ravirajaindustries@gmail.com</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Option 2: Try Firebase Google Sign-In with Popup */}
        <div className="space-y-1.5">
          <span className="text-[11px] text-slate-400 font-semibold block">Or connect via Google OAuth:</span>
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-60 shadow-sm"
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
            <span>{isLoggingIn ? 'Connecting to Google...' : 'Sign in with Google Popup'}</span>
          </button>
        </div>

        {/* Option 3: Custom Sales Executive Name Form */}
        <form onSubmit={handleCustomLogin} className="pt-2 border-t border-slate-800 space-y-2 text-xs">
          <span className="text-[11px] text-slate-400 font-semibold block">Or Custom Executive Details:</span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Executive Name</label>
              <input
                type="text"
                value={executiveName}
                onChange={(e) => setExecutiveName(e.target.value)}
                placeholder="Executive Name"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
            <div>
              <label className="text-[10px] text-slate-400 block mb-0.5">Executive Email</label>
              <input
                type="email"
                required
                value={executiveEmail}
                onChange={(e) => setExecutiveEmail(e.target.value)}
                placeholder="name@raviraja.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs transition"
          >
            Save & Connect Executive
          </button>
        </form>
      </div>
    </div>
  );
};
