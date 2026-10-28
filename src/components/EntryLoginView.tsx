import React, { useState } from 'react';
import {
  Shield,
  Phone,
  Lock,
  Mail,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  UserCheck,
  Send,
  Loader2,
  Sparkles,
  Building2,
} from 'lucide-react';
import { AppUser, loginWithMobileNumber, executiveLogin } from '../services/firebaseAuth';
import { EmployeeService } from '../services/employeeService';

interface EntryLoginViewProps {
  onGoogleLogin: () => Promise<void>;
  onExecutiveLogin: (email: string, name: string) => void;
  onMobileLoginUser: (user: AppUser) => void;
  isLoggingIn: boolean;
  authError: { code?: string; message?: string } | null;
}

export const EntryLoginView: React.FC<EntryLoginViewProps> = ({
  onGoogleLogin,
  onExecutiveLogin,
  onMobileLoginUser,
  isLoggingIn,
  authError,
}) => {
  const [activeMethod, setActiveMethod] = useState<'gmail' | 'mobile'>('gmail');
  const [mobileNumber, setMobileNumber] = useState('+91 ');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [step, setStep] = useState<'enter_mobile' | 'enter_otp'>('enter_mobile');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

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

    setIsSendingOtp(true);
    setTimeout(() => {
      const emp = employees.find(
        (em) => em.mobileNumber.replace(/\s+/g, '') === cleanMobile.replace(/\s+/g, '')
      );

      if (!emp) {
        setIsSendingOtp(false);
        setErrorMsg('Mobile number not registered in SCRAFT employee database. Contact Admin.');
        return;
      }

      if (emp.status === 'Resigned') {
        setIsSendingOtp(false);
        setErrorMsg('This employee account has been marked as Resigned. Access denied.');
        return;
      }

      if (emp.status === 'Inactive') {
        setIsSendingOtp(false);
        setErrorMsg('This employee account is currently Inactive. Please contact Administrator.');
        return;
      }

      const mockOtp = '123456';
      setGeneratedOtp(mockOtp);
      setOtpCode(mockOtp);
      setStep('enter_otp');
      setIsSendingOtp(false);
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

    const result = loginWithMobileNumber(mobileNumber, otpCode);
    if (result.success && result.user) {
      setSuccessMsg(`✓ Verified! Welcome ${result.user.displayName} (${result.user.role.toUpperCase()})`);
      setTimeout(() => {
        onMobileLoginUser(result.user!);
      }, 400);
    } else {
      setErrorMsg(result.errorMessage || 'Invalid OTP verification code.');
    }
  };

  const handleAdminEmailLogin = () => {
    const adminUser = executiveLogin('ravirajaindustries@gmail.com', 'Raviraja Admin');
    onMobileLoginUser(adminUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-6">
        {/* App Logo & Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-sky-500 via-indigo-600 to-blue-700 shadow-xl shadow-sky-500/20 text-white font-black text-2xl mb-1 ring-4 ring-sky-500/20">
            uPVC
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white">
            SCRAFT uPVC Profiles
          </h1>
          <p className="text-xs text-sky-400 font-semibold uppercase tracking-wider">
            Raviraja Industries • Sales Visit Portal
          </p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Please log in with your Gmail account or registered Sales Person mobile number to access your portal.
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              setActiveMethod('gmail');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeMethod === 'gmail'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Mail className="w-4 h-4" />
            <span>Login with Gmail</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveMethod('mobile');
              setErrorMsg(null);
            }}
            className={`py-2.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
              activeMethod === 'mobile'
                ? 'bg-sky-500 text-slate-950 shadow-md font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Phone className="w-4 h-4" />
            <span>Sales Mobile OTP</span>
          </button>
        </div>

        {/* Error / Success Notifications */}
        {authError && (
          <div className="p-3 rounded-2xl bg-amber-950/40 border border-amber-500/40 text-xs flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span className="text-amber-200">{authError.message || 'Authentication error.'}</span>
          </div>
        )}

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

        {/* Method 1: Login with Gmail & Admin */}
        {activeMethod === 'gmail' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Shield className="w-4 h-4 text-sky-400" />
                <span>Google / Gmail Account Login</span>
              </h2>
              <p className="text-xs text-slate-400">
                Log in securely using your authorized corporate Gmail address
              </p>
            </div>

            {/* Official Google Sign-In Button */}
            <button
              type="button"
              onClick={onGoogleLogin}
              disabled={isLoggingIn}
              className="w-full py-3 px-4 rounded-2xl bg-white hover:bg-slate-100 text-slate-900 font-bold text-xs flex items-center justify-center gap-3 transition active:scale-95 disabled:opacity-60 shadow-lg shadow-black/30"
            >
              <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
              <span>{isLoggingIn ? 'Connecting to Google...' : 'Continue with Gmail / Google'}</span>
            </button>

            <div className="relative flex py-1 items-center">
              <div className="flex-grow border-t border-slate-800"></div>
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-bold">Or 1-Click Admin</span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

            {/* 1-Click Raviraja Admin Access */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-amber-950/30 border border-amber-500/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>Raviraja Admin Email</span>
                </span>
                <span className="px-2 py-0.2 rounded-full text-[9px] font-bold bg-amber-500 text-slate-950">
                  DIRECT ACCESS
                </span>
              </div>
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
          </div>
        )}

        {/* Method 2: Sales Person Mobile Login */}
        {activeMethod === 'mobile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Sales Person Mobile & OTP Login</span>
              </h2>
              <p className="text-xs text-slate-400">
                Log in with your registered Indian mobile number (+91)
              </p>
            </div>

            {step === 'enter_mobile' ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 block font-semibold">Registered Indian Mobile Number</label>
                  <input
                    type="text"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    placeholder="+91 98250 00000"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500"
                  />
                  <span className="text-[10px] text-slate-500 block">
                    Only admin-approved active sales employees can log in.
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md disabled:opacity-50"
                >
                  {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isSendingOtp ? 'Sending SMS OTP...' : 'Send SMS OTP'}</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleVerifyAndLogin} className="space-y-3">
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
                    <label className="text-[10px] text-slate-400 block">6-Digit OTP Code</label>
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
                  <span className="text-[10px] text-slate-400 block text-center">
                    OTP sent via SMS gateway to <strong className="text-white">{mobileNumber}</strong>
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
                >
                  <UserCheck className="w-4 h-4" />
                  <span>Verify OTP & Enter App</span>
                </button>
              </form>
            )}

            {/* Quick Test Links for Sales Employees */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">Quick Select Registered Sales Employee:</span>
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
                      setSuccessMsg(`✓ Selected ${emp.name} (${emp.mobileNumber}). Click Verify.`);
                    }}
                    className="p-2 rounded-xl border border-slate-800 bg-slate-800/60 hover:bg-slate-800 flex items-center justify-between text-left text-xs transition text-slate-200"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 font-bold">
                        <span>{emp.name}</span>
                        <span className="text-[9px] px-1.5 py-0.2 rounded font-bold bg-sky-500 text-slate-950">
                          SALES
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 font-mono">{emp.mobileNumber} • {emp.designation}</span>
                    </div>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Footer info */}
        <p className="text-[11px] text-center text-slate-500">
          SCRAFT Fenestrations & Profiles • Secure Enterprise System
        </p>
      </div>
    </div>
  );
};
