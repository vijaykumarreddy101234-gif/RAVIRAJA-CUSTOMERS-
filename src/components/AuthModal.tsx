import React, { useState } from 'react';
import { X, Shield, Phone, Lock, CheckCircle2, AlertTriangle, ArrowRight, UserCheck, Send, Loader2, Mail } from 'lucide-react';
import {
  AppUser,
  loginWithMobileNumber,
  executiveLogin,
} from '../services/firebaseAuth';
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
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [step, setStep] = useState<'enter_mobile' | 'enter_otp'>('enter_mobile');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const employees = EmployeeService.getEmployees();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const cleanMobile = mobileNumber.trim();
    if (!cleanMobile || cleanMobile.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const emp = employees.find(
        (em) => em.mobileNumber.replace(/\s+/g, '') === cleanMobile.replace(/\s+/g, '')
      );

      if (!emp) {
        setIsLoading(false);
        setErrorMsg('Mobile number not registered in SCRAFT employee database. Contact Admin.');
        return;
      }

      if (emp.status === 'Resigned') {
        setIsLoading(false);
        setErrorMsg('This employee account has been marked as Resigned. Access denied.');
        return;
      }

      if (emp.status === 'Inactive') {
        setIsLoading(false);
        setErrorMsg('This employee account is currently Inactive. Please contact Administrator.');
        return;
      }

      const mockOtp = '123456';
      setGeneratedOtp(mockOtp);
      setOtpCode(mockOtp);
      setStep('enter_otp');
      setIsLoading(false);
      setSuccessMsg(`✓ SMS OTP successfully sent to ${emp.mobileNumber}. Code: ${mockOtp}`);
    }, 300);
  };

  const handleVerifyAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!otpCode || otpCode.length < 4) {
      setErrorMsg('Please enter a valid OTP verification code.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const result = loginWithMobileNumber(mobileNumber, otpCode);
      setIsLoading(false);

      if (result.success && result.user) {
        setSuccessMsg(`✓ Verified! Welcome ${result.user.displayName} (${result.user.role.toUpperCase()})`);
        setTimeout(() => {
          onMobileLoginUser(result.user!);
          onClose();
        }, 500);
      } else {
        setErrorMsg(result.errorMessage || 'Invalid OTP verification code.');
      }
    }, 300);
  };

  const handleAdminEmailLogin = () => {
    const adminUser = executiveLogin('ravirajaindustries@gmail.com', 'Raviraja Admin');
    onMobileLoginUser(adminUser);
    onClose();
  };

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
              <h3 className="text-sm font-bold text-white">SCRAFT Secure Login Portal</h3>
              <p className="text-[10px] text-slate-400">Raviraja Industries • Mobile OTP & Admin Email</p>
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

        {/* Google / Gmail Login Option */}
        <div className="space-y-1.5">
          <button
            type="button"
            onClick={onGoogleLogin}
            disabled={isLoggingIn}
            className="w-full py-2.5 px-3 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-2.5 transition active:scale-95 disabled:opacity-60 shadow-md"
          >
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
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
            <span>{isLoggingIn ? 'Connecting to Google...' : 'Login with Gmail (Google Account)'}</span>
          </button>
        </div>

        {/* Raviraja Admin Email Login Option (Prominent Top Banner) */}
        <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border border-amber-500/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Raviraja Admin Email Login</span>
            </span>
            <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
              ADMIN
            </span>
          </div>
          <p className="text-[11px] text-slate-300">
            Instant administrator access using corporate email:
          </p>
          <button
            type="button"
            onClick={handleAdminEmailLogin}
            className="w-full py-2.5 px-3 rounded-xl bg-amber-600 hover:bg-amber-500 text-slate-950 font-extrabold text-xs flex items-center justify-between transition active:scale-95 shadow-md"
          >
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-amber-700 flex items-center justify-center font-bold text-white text-xs">
                R
              </div>
              <div className="text-left">
                <span className="block leading-tight font-extrabold text-white">Raviraja Admin</span>
                <span className="text-[10px] text-amber-100 block font-normal">ravirajaindustries@gmail.com</span>
              </div>
            </div>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="relative flex py-1 items-center">
          <div className="flex-grow border-t border-slate-800"></div>
          <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Or Mobile OTP Login</span>
          <div className="flex-grow border-t border-slate-800"></div>
        </div>

        {/* Step 1: Enter Mobile Number */}
        {step === 'enter_mobile' ? (
          <form onSubmit={handleSendOtp} className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-sky-300 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-sky-400" />
                <span>Sales Mobile Login (+91)</span>
              </span>
              <span className="text-[9px] font-bold bg-sky-500/20 text-sky-300 px-2 py-0.5 rounded">
                SMS OTP
              </span>
            </div>

            <div className="space-y-1.5 text-xs">
              <label className="text-[10px] text-slate-400 block">Registered Indian Mobile Number</label>
              <input
                type="text"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                placeholder="+91 98250 00000"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              <span>{isLoading ? 'Sending SMS OTP...' : 'Send SMS OTP'}</span>
            </button>
          </form>
        ) : (
          /* Step 2: Enter OTP & Verify */
          <form onSubmit={handleVerifyAndLogin} className="p-4 rounded-2xl bg-slate-850 border border-slate-700/80 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span>Enter OTP Verification Code</span>
              </span>
              <button
                type="button"
                onClick={() => setStep('enter_mobile')}
                className="text-[10px] text-sky-400 underline hover:text-sky-300"
              >
                Change Number
              </button>
            </div>

            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <label className="text-[10px] text-slate-400 block">SMS Verification Code</label>
                {generatedOtp && (
                  <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800">
                    Test OTP: {generatedOtp}
                  </span>
                )}
              </div>
              <input
                type="text"
                required
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                placeholder="123456"
                className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <UserCheck className="w-4 h-4" />}
              <span>{isLoading ? 'Verifying Code...' : 'Verify OTP & Login'}</span>
            </button>
          </form>
        )}

        {/* Quick Test Logins */}
        <div className="space-y-2 pt-1 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 font-semibold block">Pre-registered Sales Executives:</span>
          <div className="grid grid-cols-1 gap-1.5 max-h-36 overflow-y-auto no-scrollbar">
            {employees.filter(e => e.role !== 'admin').map((emp) => (
              <button
                key={emp.id}
                type="button"
                onClick={() => {
                  setMobileNumber(emp.mobileNumber);
                  const mockOtp = '123456';
                  setGeneratedOtp(mockOtp);
                  setOtpCode(mockOtp);
                  setStep('enter_otp');
                  setSuccessMsg(`✓ OTP generated for ${emp.name}. Click Verify.`);
                }}
                className="p-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-800 flex items-center justify-between text-left text-xs transition text-slate-200"
              >
                <div>
                  <div className="flex items-center gap-1.5 font-bold">
                    <span>{emp.name}</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-sky-500 text-slate-950">
                      SALES
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 font-mono">{emp.mobileNumber}</span>
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
