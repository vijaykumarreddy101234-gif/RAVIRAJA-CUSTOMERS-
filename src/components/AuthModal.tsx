import React, { useState } from 'react';
import { X, Shield, Phone, Lock, CheckCircle2, AlertTriangle, ArrowRight, UserCheck } from 'lucide-react';
import { AppUser, loginWithMobileNumber } from '../services/firebaseAuth';
import { EmployeeService } from '../services/employeeService';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onGoogleLogin: () => Promise<void>;
  onExecutiveLogin: (email: string, name: string) => void;
  onMobileLoginUser: (user: AppUser) => void;
  isLoggingIn: boolean;
  authError: { code?: string; message?: string } | null;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onGoogleLogin,
  onExecutiveLogin,
  onMobileLoginUser,
  isLoggingIn,
  authError,
}) => {
  const [mobileNumber, setMobileNumber] = useState('+91 ');
  const [otpCode, setOtpCode] = useState('123456');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleMobileLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const result = loginWithMobileNumber(mobileNumber, otpCode);
    if (result.success && result.user) {
      setSuccessMsg(`Successfully logged in as ${result.user.displayName} (${result.user.role.toUpperCase()})`);
      setTimeout(() => {
        onMobileLoginUser(result.user!);
        onClose();
      }, 600);
    } else {
      setErrorMsg(result.errorMessage || 'Login failed. Please check mobile number or contact admin.');
    }
  };

  const employees = EmployeeService.getEmployees();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl w-full max-w-md p-5 shadow-2xl text-white space-y-4 max-h-[92vh] overflow-y-auto no-scrollbar">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-bold">
              <Shield className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">SCRAFT Secure Mobile Login</h3>
              <p className="text-[10px] text-slate-400">Multi-User Permission & Access System</p>
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

        {/* Error / Success Banners */}
        {errorMsg && (
          <div className="p-3 rounded-2xl bg-rose-950/40 border border-rose-500/40 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
            <span className="text-rose-200">{errorMsg}</span>
          </div>
        )}

        {successMsg && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-emerald-200">{successMsg}</span>
          </div>
        )}

        {/* 1. Mobile Number & OTP Login Form (Primary) */}
        <form onSubmit={handleMobileLoginSubmit} className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-sky-400" />
              <span>Mobile Number (+91) & OTP</span>
            </span>
            <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
              SECURE
            </span>
          </div>

          <div className="space-y-2 text-xs">
            <div>
              <label className="text-[10px] text-slate-400 block mb-1">Registered Indian Mobile Number</label>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98250 00000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <div>
              <label className="text-[10px] text-slate-400 block mb-1">OTP Verification Code</label>
              <input
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white font-mono tracking-widest focus:outline-none focus:border-sky-500"
              />
              <span className="text-[10px] text-slate-500 mt-1 block">
                (Demo OTP: enter any 4-6 digits e.g. 123456)
              </span>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
          >
            <UserCheck className="w-4 h-4" />
            <span>Verify OTP & Login</span>
          </button>
        </form>

        {/* 2. Quick Demo Accounts Selector for Testing */}
        <div className="space-y-2 pt-2 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Quick Test Logins (Pre-registered):</span>
          <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
            {employees.map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  setMobileNumber(emp.mobileNumber);
                  setOtpCode('123456');
                  const res = loginWithMobileNumber(emp.mobileNumber, '123456');
                  if (res.success && res.user) {
                    onMobileLoginUser(res.user);
                    onClose();
                  }
                }}
                className={`p-2.5 rounded-xl border flex items-center justify-between text-left text-xs transition ${
                  emp.role === 'admin'
                    ? 'bg-amber-950/30 border-amber-500/40 hover:bg-amber-950/50 text-amber-200'
                    : 'bg-slate-800/80 border-slate-700 hover:bg-slate-800 text-slate-200'
                }`}
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{emp.name}</span>
                    <span className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${emp.role === 'admin' ? 'bg-amber-500 text-slate-950' : 'bg-sky-500 text-slate-950'}`}>
                      {emp.role.toUpperCase()}
                    </span>
                    {emp.status !== 'Active' && (
                      <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-rose-500 text-white">
                        {emp.status}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{emp.mobileNumber} • {emp.designation}</span>
                </div>
                <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
