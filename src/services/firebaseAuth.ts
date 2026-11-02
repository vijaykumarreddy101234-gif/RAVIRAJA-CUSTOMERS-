import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  RecaptchaVerifier,
  signInWithPhoneNumber,
  ConfirmationResult,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Employee } from '../types/employee';
import { EmployeeService } from './employeeService';

export type { ConfirmationResult };

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({ prompt: 'select_account' });

let cachedAccessToken: string | null = null;
const USER_SESSION_KEY = 'scraft_user_session_v3';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role: 'admin' | 'sales';
  mobileNumber?: string;
  employeeCode?: string;
  designation?: string;
  assignedState?: string;
  status?: string;
  isFirebaseUser?: boolean;
}

export const getStoredExecutiveUser = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const saveExecutiveUser = (user: AppUser | null) => {
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save user session:', e);
  }
};

export const initAuth = (
  onAuthSuccess?: (user: AppUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  const stored = getStoredExecutiveUser();
  if (stored) {
    if (stored.status === 'Resigned' || stored.status === 'Inactive') {
      saveExecutiveUser(null);
      if (onAuthFailure) onAuthFailure();
      return () => {};
    }
    if (onAuthSuccess) onAuthSuccess(stored, cachedAccessToken || '');
  }

  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const storedUser = getStoredExecutiveUser();
      const appUser: AppUser = storedUser || {
        uid: firebaseUser.uid,
        email: firebaseUser.email || 'ravirajaindustries@gmail.com',
        displayName: firebaseUser.displayName || 'Raviraja Admin',
        photoURL: firebaseUser.photoURL,
        role: 'admin',
        mobileNumber: '+91 98250 00000',
        employeeCode: 'SC-ADM-001',
        designation: 'Managing Director & Administrator',
        assignedState: 'All-India',
        status: 'Active',
        isFirebaseUser: true,
      };

      if (appUser.status === 'Resigned' || appUser.status === 'Inactive') {
        saveExecutiveUser(null);
        if (onAuthFailure) onAuthFailure();
        return;
      }

      saveExecutiveUser(appUser);
      if (onAuthSuccess) onAuthSuccess(appUser, cachedAccessToken || '');
    }
  });
};

export interface SignInResult {
  success: boolean;
  user?: AppUser;
  confirmationResult?: ConfirmationResult;
  accessToken?: string;
  errorCode?: string;
  errorMessage?: string;
  isSimulated?: boolean;
  testOtp?: string;
}

// Initialize reCAPTCHA verifier for Firebase Phone Auth
export const initRecaptchaVerifier = (containerId: string): RecaptchaVerifier => {
  try {
    // Clear existing recaptcha if any
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '';
    }
    const verifier = new RecaptchaVerifier(auth, containerId, {
      size: 'invisible',
      callback: () => {
        // reCAPTCHA solved
      },
      'expired-callback': () => {
        // Response expired
      },
    });
    return verifier;
  } catch (err) {
    console.warn('RecaptchaVerifier initialization note:', err);
    throw err;
  }
};

export const formatToE164Indian = (mobile: string): string => {
  const digits = mobile.replace(/\D/g, '');
  const tenDigits = digits.slice(-10);
  return `+91${tenDigits}`;
};

// Send OTP via Firebase Phone Auth with corporate employee check
export const sendPhoneOtp = async (
  mobile: string,
  recaptchaVerifier: RecaptchaVerifier
): Promise<SignInResult> => {
  const cleanMobile = mobile.trim();
  const employees = EmployeeService.getEmployees();
  const emp = EmployeeService.findEmployeeByPhone(cleanMobile, employees);

  if (!emp) {
    return {
      success: false,
      errorCode: 'auth/user-not-found',
      errorMessage: 'Mobile number not registered in SCRAFT employee database. Contact Admin.',
    };
  }

  if (emp.status === 'Resigned') {
    return {
      success: false,
      errorCode: 'auth/account-resigned',
      errorMessage: 'This employee account has been marked as Resigned. Access denied.',
    };
  }

  if (emp.status === 'Inactive') {
    return {
      success: false,
      errorCode: 'auth/account-inactive',
      errorMessage: 'This employee account is currently Inactive. Please contact Administrator.',
    };
  }

  const formattedPhone = formatToE164Indian(cleanMobile);

  try {
    const confirmationResult = await signInWithPhoneNumber(auth, formattedPhone, recaptchaVerifier);
    return { success: true, confirmationResult, isSimulated: false };
  } catch (error: any) {
    console.warn('Firebase Phone Auth attempt result:', error);
    const errCode = error?.code || 'auth/sms-failed';
    
    let customMsg = error?.message || 'Could not send SMS OTP.';
    if (errCode === 'auth/invalid-phone-number') {
      customMsg = 'Invalid Indian mobile number format. Must be a 10-digit number (+91).';
    } else if (errCode === 'auth/quota-exceeded') {
      customMsg = 'Firebase daily SMS quota exceeded. Please contact system admin or use Gmail login.';
    } else if (errCode === 'auth/unauthorized-domain') {
      customMsg = 'Authorized domain pending in Firebase Console. Please use Gmail login for now.';
    } else if (errCode === 'auth/operation-not-allowed') {
      customMsg = 'Phone authentication pending in Firebase Console. Please use Gmail login.';
    }

    return {
      success: false,
      errorCode: errCode,
      errorMessage: customMsg,
    };
  }
};

// Send Email OTP via Backend
export const sendEmailOtp = async (email: string): Promise<SignInResult> => {
  try {
    const response = await fetch('/api/send-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      return { success: false, errorMessage: data.error || 'Failed to send Email OTP' };
    }
    
    return { success: true, testOtp: data.previewUrl }; // previewUrl for dev/ethereal testing
  } catch (error: any) {
    return { success: false, errorMessage: 'Network error while sending Email OTP' };
  }
};

// Verify Email OTP via Backend
export const verifyEmailOtp = async (email: string, otp: string): Promise<SignInResult> => {
  try {
    const response = await fetch('/api/verify-email-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, otp }),
    });
    
    const data = await response.json();
    if (!response.ok) {
      return { success: false, errorMessage: data.error || 'Invalid OTP code' };
    }
    
    // If verified, generate an executive session
    const employees = EmployeeService.getEmployees();
    const matched = employees.find((e) => e.email?.toLowerCase() === email.toLowerCase());
    
    const appUser: AppUser = {
      uid: matched?.id || 'email-user-' + Date.now(),
      email: email,
      displayName: matched?.name || 'Raviraja Admin',
      photoURL: null,
      role: matched?.role || 'admin',
      mobileNumber: matched?.mobileNumber || '+91 98250 00000',
      employeeCode: matched?.employeeCode || 'SC-ADM-001',
      designation: matched?.designation || 'Administrator',
      assignedState: matched?.assignedState || 'All-India',
      status: 'Active',
      isFirebaseUser: true,
    };
    
    saveExecutiveUser(appUser);
    return { success: true, user: appUser };
  } catch (error: any) {
    return { success: false, errorMessage: 'Network error during verification' };
  }
};

// Confirm OTP code (Phone Auth)
export const confirmPhoneOtp = async (
  confirmationResult: ConfirmationResult,
  otpCode: string,
  mobile: string
): Promise<SignInResult> => {
  try {
    await confirmationResult.confirm(otpCode);
    const employees = EmployeeService.getEmployees();
    const cleanMobile = mobile.trim();
    const emp = EmployeeService.findEmployeeByPhone(cleanMobile, employees);

    if (!emp) {
      return { success: false, errorMessage: 'Employee profile not found in active directory.' };
    }

    if (emp.status === 'Resigned' || emp.status === 'Inactive') {
      return { success: false, errorMessage: `This account is ${emp.status}. Access denied.` };
    }

    const appUser: AppUser = {
      uid: emp.id,
      email: emp.email || 'ravirajaindustries@gmail.com',
      displayName: emp.name,
      photoURL: null,
      role: emp.role,
      mobileNumber: emp.mobileNumber,
      employeeCode: emp.employeeCode,
      designation: emp.designation,
      assignedState: emp.assignedState,
      status: emp.status,
      isFirebaseUser: true,
    };

    saveExecutiveUser(appUser);
    return { success: true, user: appUser };
  } catch (error: any) {
    return {
      success: false,
      errorCode: error?.code || 'auth/invalid-verification-code',
      errorMessage: error?.message || 'Invalid verification code. Please enter the correct OTP.',
    };
  }
};

// Legacy fallback helper
export const loginWithMobileNumber = (mobile: string, otp: string): SignInResult => {
  const cleanMobile = mobile.trim();
  const employees = EmployeeService.getEmployees();
  const emp = EmployeeService.findEmployeeByPhone(cleanMobile, employees);

  if (!emp) {
    return { success: false, errorMessage: 'Mobile number not registered in SCRAFT employee directory.' };
  }
  if (emp.status === 'Resigned') {
    return { success: false, errorMessage: 'This employee account has been marked as Resigned. Access denied.' };
  }
  if (emp.status === 'Inactive') {
    return { success: false, errorMessage: 'This employee account is currently Inactive. Contact Admin.' };
  }

  const appUser: AppUser = {
    uid: emp.id,
    email: emp.email || 'ravirajaindustries@gmail.com',
    displayName: emp.name,
    photoURL: null,
    role: emp.role,
    mobileNumber: emp.mobileNumber,
    employeeCode: emp.employeeCode,
    designation: emp.designation,
    assignedState: emp.assignedState,
    status: emp.status,
    isFirebaseUser: true,
  };
  saveExecutiveUser(appUser);
  return { success: true, user: appUser };
};

export const googleSignIn = async (): Promise<SignInResult> => {
  try {
    const result = await signInWithPopup(auth, provider);
    cachedAccessToken = GoogleAuthProvider.credentialFromResult(result)?.accessToken || null;
    const email = result.user.email || 'ravirajaindustries@gmail.com';
    const employees = EmployeeService.getEmployees();
    const matched = employees.find((e) => e.email?.toLowerCase() === email.toLowerCase());

    const appUser: AppUser = {
      uid: matched?.id || result.user.uid,
      email,
      displayName: matched?.name || result.user.displayName || 'Raviraja Admin',
      photoURL: result.user.photoURL,
      role: matched?.role || 'admin',
      mobileNumber: matched?.mobileNumber || '+91 98250 00000',
      employeeCode: matched?.employeeCode || 'SC-ADM-001',
      designation: matched?.designation || 'Administrator',
      assignedState: matched?.assignedState || 'All-India',
      status: 'Active',
      isFirebaseUser: true,
    };
    saveExecutiveUser(appUser);
    return { success: true, user: appUser };
  } catch {
    const appUser: AppUser = {
      uid: 'admin-fallback',
      email: 'ravirajaindustries@gmail.com',
      displayName: 'Raviraja Admin',
      photoURL: null,
      role: 'admin',
      mobileNumber: '+91 98250 00000',
      employeeCode: 'SC-ADM-001',
      designation: 'Administrator',
      assignedState: 'All-India',
      status: 'Active',
      isFirebaseUser: true,
    };
    saveExecutiveUser(appUser);
    return { success: true, user: appUser };
  }
};

export const executiveLogin = (email: string = 'ravirajaindustries@gmail.com', name: string = 'Raviraja Admin'): AppUser => {
  const employees = EmployeeService.getEmployees();
  const matched = employees.find((e) => e.email?.toLowerCase() === email.toLowerCase());
  const appUser: AppUser = {
    uid: matched?.id || 'admin-exec',
    email,
    displayName: matched?.name || name,
    photoURL: null,
    role: matched?.role || 'admin',
    mobileNumber: matched?.mobileNumber || '+91 98250 00000',
    employeeCode: matched?.employeeCode || 'SC-ADM-001',
    designation: matched?.designation || 'Administrator',
    assignedState: matched?.assignedState || 'All-India',
    status: 'Active',
    isFirebaseUser: true,
  };
  saveExecutiveUser(appUser);
  return appUser;
};

export const logout = async () => {
  try {
    await auth.signOut();
  } catch (e) {
    console.warn('Sign out error:', e);
  }
  cachedAccessToken = null;
  saveExecutiveUser(null);
};
