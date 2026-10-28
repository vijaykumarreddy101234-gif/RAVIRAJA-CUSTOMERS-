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
  UserPlus,
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
  const [activeMethod, setActiveMethod] = useState<'gmail' | 'mobile'>('mobile'); // Default to mobile as requested
  const [mobileNumber, setMobileNumber] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState<string | null>(null);
  const [step, setStep] = useState<'enter_mobile' | 'enter_otp'>('enter_mobile');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // New employee self-registration state if number not in database
  const [isUnregistered, setIsUnregistered] = useState(false);
  const [newName, setNewName] = useState('');
  const [newState, setNewState] = useState('Telangana');

  const employees = EmployeeService.getEmployees();

  const handleSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsUnregistered(false);

    const cleanMobile = mobileNumber.trim();
    const digits = EmployeeService.normalizePhone(cleanMobile);
    if (!digits || digits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9440042407).');
      return;
    }

    setIsSendingOtp(true);
    setTimeout(() => {
      const emp = EmployeeService.findEmployeeByPhone(cleanMobile, employees);

      if (!emp) {
        setIsSendingOtp(false);
        setIsUnregistered(true);
        setErrorMsg(`Mobile number +91 ${digits} is not yet in directory. Enter your name below to register as Sales Person.`);
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

      const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(mockOtp);
      setOtpCode(mockOtp);
      setStep('enter_otp');
      setIsSendingOtp(false);
      setSuccessMsg(`✓ SMS OTP dispatched to ${emp.name} (+91 ${digits})! Code: ${mockOtp}`);
    }, 250);
  };

  const handleRegisterAndSendOtp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      setErrorMsg('Please enter your full name to register.');
      return;
    }

    const digits = EmployeeService.normalizePhone(mobileNumber);
    const newEmp = EmployeeService.registerSalesEmployee(newName.trim(), `+91 ${digits}`, newState);

    const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(mockOtp);
    setOtpCode(mockOtp);
    setStep('enter_otp');
    setIsUnregistered(false);
    setErrorMsg(null);
    setSuccessMsg(`✓ Registered ${newEmp.name} as Sales Person! OTP code is: ${mockOtp}`);
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
      }, 300);
    } else {
      setErrorMsg(result.errorMessage || 'Invalid OTP verification code.');
    }
  };

  const handleQuickSelectEmployee = (empMobile: string, empName: string) => {
    setMobileNumber(empMobile);
    const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
    setGeneratedOtp(mockOtp);
    setOtpCode(mockOtp);
    setStep('enter_otp');
    setErrorMsg(null);
    setIsUnregistered(false);
    setSuccessMsg(`✓ SMS OTP sent to ${empName} (${empMobile})! OTP: ${mockOtp}`);
  };

  const handleAdminEmailLogin = () => {
    const adminUser = executiveLogin('ravirajaindustries@gmail.com', 'Raviraja Admin');
    onMobileLoginUser(adminUser);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col justify-center items-center px-4 py-8 font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      <div className="w-full max-w-md space-y-5">
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
            Log in with your registered Sales Person mobile number or Gmail account to access visits.
          </p>
        </div>

        {/* Login Method Tabs */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-900 border border-slate-800 rounded-2xl">
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
        </div>

        {/* Prominent Generated OTP Notification Alert (When Step 2) */}
        {step === 'enter_otp' && generatedOtp && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950 via-slate-900 to-sky-950 border-2 border-emerald-500 shadow-2xl space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>SMS OTP Received!</span>
              </span>
              <span className="text-[10px] text-slate-400">Instant Verification</span>
            </div>
            <div className="flex items-center justify-between p-2 rounded-xl bg-slate-950/80 border border-emerald-500/40">
              <span className="text-xs text-slate-300 font-medium">Your 6-Digit Code:</span>
              <span className="text-xl font-black font-mono tracking-widest text-emerald-400">
                {generatedOtp}
              </span>
            </div>
            <button
              type="button"
              onClick={handleVerifyAndLogin}
              className="w-full py-2 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md"
            >
              <UserCheck className="w-4 h-4" />
              <span>One-Click Verify & Enter App</span>
            </button>
          </div>
        )}

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

        {successMsg && !generatedOtp && (
          <div className="p-3 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-xs flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
            <span className="text-emerald-200">{successMsg}</span>
          </div>
        )}

        {/* Method 1: Sales Person Mobile Login */}
        {activeMethod === 'mobile' && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl space-y-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Phone className="w-4 h-4 text-sky-400" />
                <span>Sales Person Mobile & OTP Login</span>
              </h2>
              <p className="text-xs text-slate-400">
                Enter your 10-digit Indian mobile number to get an instant SMS OTP
              </p>
            </div>

            {/* Step 1: Input Mobile Number */}
            {step === 'enter_mobile' ? (
              <form onSubmit={handleSendOtp} className="space-y-3">
                <div className="space-y-1.5 text-xs">
                  <label className="text-[10px] text-slate-400 block font-semibold">
                    Indian Mobile Number (+91)
                  </label>
                  <div className="relative flex items-center">
                    <span className="absolute left-3 text-xs font-mono font-bold text-sky-400">
                      +91
                    </span>
                    <input
                      type="tel"
                      required
                      value={mobileNumber.replace(/^\+91\s*/, '')}
                      onChange={(e) => setMobileNumber(`+91 ${e.target.value.replace(/\D/g, '').slice(0, 10)}`)}
                      placeholder="94400 42407"
                      className="w-full bg-slate-800 border border-slate-700 rounded-xl pl-12 pr-3 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-sky-500 text-sm tracking-wider"
                    />
                  </div>
                  <span className="text-[10px] text-slate-500 block">
                    Format: 10 digits e.g. 9440042407
                  </span>
                </div>

                <button
                  type="submit"
                  disabled={isSendingOtp}
                  className="w-full py-2.5 px-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md disabled:opacity-50"
                >
                  {isSendingOtp ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  <span>{isSendingOtp ? 'Sending SMS OTP...' : 'Send SMS OTP to Mobile'}</span>
                </button>
              </form>
            ) : (
              /* Step 2: Input OTP */
              <form onSubmit={handleVerifyAndLogin} className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Enter OTP Code</span>
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setStep('enter_mobile');
                      setGeneratedOtp(null);
                    }}
                    className="text-[10px] text-sky-400 underline hover:text-sky-300"
                  >
                    Change Number
                  </button>
                </div>

                <div className="space-y-1.5 text-xs">
                  <input
                    type="text"
                    required
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2.5 text-base text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                  />
                  <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1">
                    <span>Sent to: <strong className="text-white font-mono">{mobileNumber}</strong></span>
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      className="text-sky-400 hover:underline"
                    >
                      Resend OTP
                    </button>
                  </div>
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

            {/* Quick Self-Registration if number not found */}
            {isUnregistered && (
              <form onSubmit={handleRegisterAndSendOtp} className="p-3.5 rounded-2xl bg-sky-950/40 border border-sky-500/40 space-y-2.5 text-xs">
                <span className="font-bold text-sky-300 block">
                  Quick Register as Sales Person:
                </span>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Your Full Name (e.g. Ramesh Kumar)"
                  className="w-full bg-slate-800 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500"
                />
                <button
                  type="submit"
                  className="w-full py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs transition"
                >
                  Register & Get OTP
                </button>
              </form>
            )}

            {/* Direct Quick-Tap Links for Registered Salespersons */}
            <div className="pt-2 border-t border-slate-800 space-y-1.5">
              <span className="text-[11px] text-slate-400 font-semibold block">
                Tap to Login with Registered Account:
              </span>
              <div className="grid grid-cols-1 gap-1.5 max-h-40 overflow-y-auto no-scrollbar">
                {employees
                  .filter((e) => e.status === 'Active')
                  .map((emp) => (
                    <button
                      key={emp.id}
                      type="button"
                      onClick={() => handleQuickSelectEmployee(emp.mobileNumber, emp.name)}
                      className={`p-2.5 rounded-xl border flex items-center justify-between text-left text-xs transition ${
                        emp.role === 'admin'
                          ? 'border-amber-500/40 bg-amber-950/30 hover:bg-amber-950/50 text-amber-200'
                          : 'border-slate-800 bg-slate-800/70 hover:bg-slate-800 text-slate-200'
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-1.5 font-bold">
                          <span>{emp.name}</span>
                          <span
                            className={`text-[9px] px-1.5 py-0.2 rounded font-bold ${
                              emp.role === 'admin'
                                ? 'bg-amber-500 text-slate-950'
                                : 'bg-sky-500 text-slate-950'
                            }`}
                          >
                            {emp.role.toUpperCase()}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {emp.mobileNumber} • {emp.designation} ({emp.assignedState})
                        </span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    </button>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* Method 2: Gmail Login */}
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
              <span className="flex-shrink mx-3 text-[10px] text-slate-500 uppercase tracking-wider font-bold">
                Or 1-Click Admin
              </span>
              <div className="flex-grow border-t border-slate-800"></div>
            </div>

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
                    <span className="text-[10px] text-amber-100 block font-normal">
                      ravirajaindustries@gmail.com
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-white" />
              </button>
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
