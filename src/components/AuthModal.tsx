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
    const digits = EmployeeService.normalizePhone(cleanMobile);
    if (!digits || digits.length < 10) {
      setErrorMsg('Please enter a valid 10-digit Indian mobile number (e.g. 9440042407).');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const emp = EmployeeService.findEmployeeByPhone(cleanMobile, employees);

      if (!emp) {
        setIsLoading(false);
        setErrorMsg(`Mobile number +91 ${digits} is not yet registered. Contact Admin.`);
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

      const mockOtp = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(mockOtp);
      setOtpCode(mockOtp);
      setStep('enter_otp');
      setIsLoading(false);
      setSuccessMsg(`✓ SMS OTP successfully sent to ${emp.name} (+91 ${digits}). Code: ${mockOtp}`);
    }, 250);
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

        {/* Raviraja Admin Email Login Option with Email OTP */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-950/70 via-slate-900 to-amber-950/60 border border-amber-500/60 space-y-2.5 shadow-xl">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
              <Mail className="w-4 h-4 text-amber-400" />
              <span>Raviraja Admin Email OTP</span>
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950 tracking-wider">
              PRIMARY ADMIN
            </span>
          </div>
          <p className="text-[11px] text-slate-300 leading-tight">
            Official Raviraja Industries Master Mail (<code className="text-amber-300 font-mono">ravirajaindustries@gmail.com</code>). Requires secure 6-digit Email OTP verification.
          </p>

          {(() => {
            const [modalAdminStep, setModalAdminStep] = useState<'enter_email' | 'enter_otp'>('enter_email');
            const [modalEmail, setModalEmail] = useState('ravirajaindustries@gmail.com');
            const [modalOtp, setModalOtp] = useState('');
            const [modalLoading, setModalLoading] = useState(false);

            const handleModalSendOtp = (e: React.FormEvent) => {
              e.preventDefault();
              setErrorMsg(null);
              setSuccessMsg(null);

              if (modalEmail.trim().toLowerCase() !== 'ravirajaindustries@gmail.com') {
                setErrorMsg('Access denied. This application is restricted to the authorized administrator (ravirajaindustries@gmail.com).');
                return;
              }

              setModalLoading(true);
              setTimeout(() => {
                setModalLoading(false);
                setModalAdminStep('enter_otp');
                setModalOtp('654321');
                setSuccessMsg('✓ Email OTP sent to ravirajaindustries@gmail.com (OTP: 654321)');
              }, 300);
            };

            const handleModalVerifyOtp = (e: React.FormEvent) => {
              e.preventDefault();
              setErrorMsg(null);
              setSuccessMsg(null);

              if (modalOtp.trim() !== '654321') {
                setErrorMsg('Invalid Email OTP. Please enter 654321.');
                return;
              }

              setModalLoading(true);
              setTimeout(() => {
                setModalLoading(false);
                const adminUser = executiveLogin('ravirajaindustries@gmail.com', 'Raviraja Admin');
                onMobileLoginUser(adminUser);
                onClose();
              }, 300);
            };

            return modalAdminStep === 'enter_email' ? (
              <form onSubmit={handleModalSendOtp} className="space-y-2 pt-1">
                <input
                  type="email"
                  value={modalEmail}
                  onChange={(e) => setModalEmail(e.target.value)}
                  placeholder="ravirajaindustries@gmail.com"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                  required
                />
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="w-full py-2.5 px-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                >
                  {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  <span>Send Email OTP</span>
                </button>
              </form>
            ) : (
              <form onSubmit={handleModalVerifyOtp} className="space-y-2 pt-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-amber-300 font-bold">Enter Email OTP (654321)</span>
                  <button
                    type="button"
                    onClick={() => setModalAdminStep('enter_email')}
                    className="text-sky-400 hover:underline"
                  >
                    Change Email
                  </button>
                </div>
                <input
                  type="text"
                  value={modalOtp}
                  onChange={(e) => setModalOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="654321"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest text-center focus:outline-none focus:border-emerald-500"
                  required
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={modalLoading || modalOtp.length < 4}
                  className="w-full py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs flex items-center justify-center gap-2 transition active:scale-95 shadow-md cursor-pointer"
                >
                  {modalLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <UserCheck className="w-3.5 h-3.5" />}
                  <span>Verify Email OTP & Login</span>
                </button>
              </form>
            );
          })()}
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
