import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Shield,
  Phone,
  Lock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Send,
  Loader2,
  Building2,
  RotateCcw,
  Sparkles,
  Key,
  X,
  Crown,
  Briefcase,
  Zap,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { EmployeeService } from '../services/employeeService';
import { AppUser } from '../services/firebaseAuth';

interface DemoLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (user: any) => void;
  title?: string;
}

export const DemoLoginModal: React.FC<DemoLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  title = 'Demo Logins & Mobile OTP',
}) => {
  const { user, demoLogin, loginWithMobileOtp } = useAuth();
  const [activeTab, setActiveTab] = useState<'demo' | 'otp'>('demo');

  // Mobile OTP state
  const [mobileNumber, setMobileNumber] = useState('94400 42407');
  const [otpCode, setOtpCode] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [loadingPreset, setLoadingPreset] = useState<string | null>(null);

  const demoOtp = '123456';

  // Timer for resend cooldown
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendCooldown > 0) {
      timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  if (!isOpen) return null;

  const handle1ClickDemo = async (role: 'admin' | 'nagarjuna' | 'rajesh') => {
    setErrorMsg(null);
    setSuccessMsg(null);
    setLoadingPreset(role);
    try {
      const loggedUser = await demoLogin(role);
      setSuccessMsg(`✓ Switched to ${loggedUser.name} (${loggedUser.role.toUpperCase()})`);
      setTimeout(() => {
        if (onSuccess) onSuccess(loggedUser);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login failed. Please try again.');
    } finally {
      setLoadingPreset(null);
    }
  };

  const handleSendOtp = async (overridePhone?: string) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const target = overridePhone || mobileNumber;
    const clean = target.replace(/\D/g, '').slice(-10);

    if (clean.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    setIsSendingOtp(true);
    try {
      // Simulate/trigger OTP dispatch
      const res = await fetch('/api/auth/send-mobile-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: clean }),
      });
      await res.json();

      setOtpSent(true);
      setResendCooldown(45);
      setSuccessMsg(`✓ Verification code sent to +91 ${clean}. Demo OTP is 123456`);
      setOtpCode(demoOtp); // Pre-fill demo OTP for convenience
    } catch (err: any) {
      setOtpSent(true);
      setSuccessMsg('✓ Demo OTP active: 123456');
      setOtpCode(demoOtp);
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const clean = mobileNumber.replace(/\D/g, '').slice(-10);
    const code = otpCode.trim();

    if (!code || code.length < 4) {
      setErrorMsg('Please enter the 6-digit OTP code (use demo: 123456).');
      return;
    }

    setIsVerifyingOtp(true);
    try {
      const verifiedUser = await loginWithMobileOtp(clean, code);
      setSuccessMsg(`✓ Logged in as ${verifiedUser.name}!`);
      setTimeout(() => {
        if (onSuccess) onSuccess(verifiedUser);
        onClose();
      }, 400);
    } catch (err: any) {
      setErrorMsg(err?.message || 'Invalid OTP code. Please enter 123456.');
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const modalContent = (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md animate-fadeIn overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-lg bg-slate-900 border border-slate-700/80 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 relative my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-1.5 pr-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>SCRAFT uPVC Profiles • Raviraja Industries</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
            {title}
          </h2>
          <p className="text-xs text-slate-400">
            Instant 1-Click login or verify with Indian mobile number + SMS OTP.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
          <button
            type="button"
            onClick={() => {
              setActiveTab('demo');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 ${
              activeTab === 'demo'
                ? 'bg-amber-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>1-Click Demo Accounts</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('otp');
              setErrorMsg(null);
            }}
            className={`flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-extrabold transition active:scale-95 ${
              activeTab === 'otp'
                ? 'bg-sky-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-3.5 h-3.5" />
            <span>Mobile OTP Login</span>
          </button>
        </div>

        {/* Notifications */}
        {errorMsg && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-2xl text-rose-300 text-xs flex items-start gap-2.5 animate-shake">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
            <div className="flex-1 font-medium">{errorMsg}</div>
          </div>
        )}

        {successMsg && (
          <div className="p-3 bg-emerald-950/50 border border-emerald-800/60 rounded-2xl text-emerald-300 text-xs flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
            <div className="flex-1 font-medium">{successMsg}</div>
          </div>
        )}

        {/* TAB 1: 1-CLICK DEMO ACCOUNTS */}
        {activeTab === 'demo' && (
          <div className="space-y-3">
            <p className="text-[11px] text-slate-400 font-medium">
              Click any profile below to instantly log in and switch between Administrator and Territory Sales roles:
            </p>

            {/* Profile 1: Master Admin */}
            <div
              onClick={() => handle1ClickDemo('admin')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                user?.role === 'admin'
                  ? 'bg-amber-950/40 border-amber-500/70 shadow-lg shadow-amber-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-amber-500/50 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
                  <Crown className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">Raviraja Master Admin</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-amber-500 text-slate-950 uppercase">
                      Admin
                    </span>
                    {user?.role === 'admin' && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    +91 98250 00000 • ravirajaindustries@gmail.com
                  </p>
                  <p className="text-[10px] text-amber-300/80 font-medium mt-0.5">
                    All-India Access • All 14 Visits • Employee Directory • Excel
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingPreset === 'admin'}
                className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shrink-0 transition active:scale-95 disabled:opacity-60"
              >
                {loadingPreset === 'admin' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Profile 2: Nagarjuna */}
            <div
              onClick={() => handle1ClickDemo('nagarjuna')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                user?.name?.toLowerCase().includes('nagarjuna')
                  ? 'bg-sky-950/40 border-sky-500/70 shadow-lg shadow-sky-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-sky-500/50 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-sky-500 to-blue-600 flex items-center justify-center text-white font-black shrink-0 shadow-md">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">nagarjuna</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-sky-500 text-slate-950 uppercase">
                      Sales
                    </span>
                    {user?.name?.toLowerCase().includes('nagarjuna') && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    +91 94400 42407 • nagarjuna@scraft.in
                  </p>
                  <p className="text-[10px] text-sky-300/80 font-medium mt-0.5">
                    Telangana & AP • 7 Visits (Hyderabad/Kukatpally)
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingPreset === 'nagarjuna'}
                className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-black text-xs shrink-0 transition active:scale-95 disabled:opacity-60"
              >
                {loadingPreset === 'nagarjuna' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </div>

            {/* Profile 3: Rajesh Patel */}
            <div
              onClick={() => handle1ClickDemo('rajesh')}
              className={`p-3.5 rounded-2xl border transition cursor-pointer flex items-center justify-between gap-3 ${
                user?.name?.toLowerCase().includes('rajesh')
                  ? 'bg-teal-950/40 border-teal-500/70 shadow-lg shadow-teal-500/10'
                  : 'bg-slate-950/70 border-slate-800 hover:border-teal-500/50 hover:bg-slate-800/40'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-teal-500 to-emerald-600 flex items-center justify-center text-slate-950 font-black shrink-0 shadow-md">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-black text-white">Rajeshbhai Patel</h3>
                    <span className="px-2 py-0.5 rounded text-[9px] font-black bg-teal-500 text-slate-950 uppercase">
                      Senior Sales
                    </span>
                    {user?.name?.toLowerCase().includes('rajesh') && (
                      <span className="text-[10px] text-emerald-400 font-bold flex items-center gap-0.5">
                        <CheckCircle2 className="w-3 h-3" /> Active
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    +91 98240 55123 • rajesh.patel@scraft.in
                  </p>
                  <p className="text-[10px] text-teal-300/80 font-medium mt-0.5">
                    Gujarat Territory (Surat & Ahmedabad)
                  </p>
                </div>
              </div>
              <button
                type="button"
                disabled={loadingPreset === 'rajesh'}
                className="px-3 py-1.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-white font-black text-xs shrink-0 transition active:scale-95 disabled:opacity-60"
              >
                {loadingPreset === 'rajesh' ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Login'
                )}
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: MOBILE NUMBER & OTP LOGIN */}
        {activeTab === 'otp' && (
          <div className="space-y-4">
            {/* Quick Mobile Chips */}
            <div className="space-y-1.5">
              <span className="text-[11px] text-slate-400 font-bold block">
                Quick Select Registered Number:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { label: 'Admin (+91 98250 00000)', num: '9825000000' },
                  { label: 'Nagarjuna (+91 94400 42407)', num: '9440042407' },
                  { label: 'Rajesh (+91 98240 55123)', num: '9824055123' },
                ].map((item) => (
                  <button
                    key={item.num}
                    type="button"
                    onClick={() => {
                      setMobileNumber(item.num);
                      handleSendOtp(item.num);
                    }}
                    className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-sky-600/30 border border-slate-700 hover:border-sky-500/50 text-[11px] text-slate-300 hover:text-white transition font-mono"
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Form */}
            <form onSubmit={handleVerifyOtp} className="space-y-3.5">
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Indian Mobile Number</span>
                  <span className="text-[10px] text-sky-400 font-mono">+91 format</span>
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400 text-xs font-mono font-bold">
                      +91
                    </div>
                    <input
                      type="tel"
                      value={mobileNumber.replace(/^\+91\s*/, '')}
                      onChange={(e) => setMobileNumber(e.target.value)}
                      placeholder="94400 42407"
                      className="w-full bg-slate-950 border border-slate-800 focus:border-sky-500 rounded-2xl pl-11 pr-3 py-2.5 text-white text-sm font-mono outline-none transition"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => handleSendOtp()}
                    disabled={isSendingOtp || !mobileNumber.trim()}
                    className="px-3.5 py-2.5 rounded-2xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shrink-0 transition active:scale-95 disabled:opacity-50 flex items-center gap-1.5"
                  >
                    {isSendingOtp ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-3.5 h-3.5" />
                        <span>Send OTP</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Instant Verification Code Info Box */}
              <div className="p-3 bg-gradient-to-r from-sky-950/70 via-blue-950/60 to-slate-900 border border-sky-500/50 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-sky-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    <span>Demo SMS Verification Code</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    TEST CODE
                  </span>
                </div>
                <div className="flex items-center justify-between bg-slate-950/90 p-2.5 rounded-xl border border-sky-900/60">
                  <div>
                    <span className="text-[10px] text-slate-400 block font-medium">OTP Code:</span>
                    <span className="text-lg font-mono font-black text-amber-400 tracking-widest">{demoOtp}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setOtpCode(demoOtp);
                      setSuccessMsg(`✓ Code ${demoOtp} auto-filled! Click Verify OTP below.`);
                    }}
                    className="px-3 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs shadow-md transition active:scale-95 flex items-center gap-1"
                  >
                    <Key className="w-3.5 h-3.5" />
                    <span>Auto-Fill {demoOtp}</span>
                  </button>
                </div>
              </div>

              {/* OTP Input */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>Enter 6-Digit OTP</span>
                  {resendCooldown > 0 ? (
                    <span className="text-[10px] text-slate-400">Resend in {resendCooldown}s</span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleSendOtp()}
                      className="text-[10px] text-sky-400 hover:underline"
                    >
                      Resend OTP
                    </button>
                  )}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
                  <input
                    type="text"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    placeholder="Enter 6-digit OTP (e.g. 123456)"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-2xl pl-10 pr-4 py-2.5 text-white text-base font-mono tracking-widest text-center outline-none transition"
                  />
                </div>
              </div>

              {/* Verify Button */}
              <button
                type="submit"
                disabled={isVerifyingOtp || otpCode.length < 4}
                className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-black text-xs shadow-lg shadow-emerald-500/25 transition active:scale-[0.99] disabled:opacity-50 flex items-center justify-center gap-2 cursor-pointer"
              >
                {isVerifyingOtp ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-4 h-4" />
                    <span>Verify OTP & Log In</span>
                  </>
                )}
              </button>
            </form>
          </div>
        )}

        {/* Footer / Continue to App */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Active User: <b className="text-white">{user?.name || 'Guest'}</b></span>
          <button
            type="button"
            onClick={onClose}
            className="text-sky-400 hover:text-sky-300 font-bold hover:underline"
          >
            Continue to App →
          </button>
        </div>
      </div>
    </div>
  );

  return typeof document !== 'undefined' ? createPortal(modalContent, document.body) : null;
};
