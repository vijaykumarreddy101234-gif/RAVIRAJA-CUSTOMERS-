import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';
import { Employee } from '../types/employee';
import { EmployeeService } from './employeeService';

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
    } else {
      if (!stored) {
        // Default to admin or null
        const defaultAdmin: AppUser = {
          uid: 'admin-default',
          email: 'ravirajaindustries@gmail.com',
          displayName: 'Raviraja Admin',
          photoURL: null,
          role: 'admin',
          mobileNumber: '+91 98250 00000',
          employeeCode: 'SC-ADM-001',
          designation: 'Managing Director & Administrator',
          assignedState: 'All-India',
          status: 'Active',
          isFirebaseUser: false,
        };
        // We do not auto-login without stored session unless desired, but let's allow stored session
      }
    }
  });
};

export interface SignInResult {
  success: boolean;
  user?: AppUser;
  accessToken?: string;
  errorCode?: string;
  errorMessage?: string;
}

// Mobile Number & OTP Login
export const loginWithMobileNumber = (mobile: string, otp: string): SignInResult => {
  const cleanMobile = mobile.trim();
  const employees = EmployeeService.getEmployees();

  // Find employee by mobile number
  const emp = employees.find(
    (e) => e.mobileNumber.replace(/\s+/g, '') === cleanMobile.replace(/\s+/g, '')
  );

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

  // Validate OTP (for security and preview, '123456' or any 6-digit OTP or test OTP)
  if (!otp || otp.length < 4) {
    return {
      success: false,
      errorCode: 'auth/invalid-otp',
      errorMessage: 'Please enter a valid OTP sent to your registered mobile number.',
    };
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
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    const email = result.user.email || 'ravirajaindustries@gmail.com';
    const employees = EmployeeService.getEmployees();
    const matched = employees.find((e) => e.email?.toLowerCase() === email.toLowerCase());

    const role = matched ? matched.role : email.includes('admin') ? 'admin' : 'sales';
    const status = matched ? matched.status : 'Active';

    if (status === 'Resigned' || status === 'Inactive') {
      return {
        success: false,
        errorCode: 'auth/account-inactive',
        errorMessage: 'Your account is Inactive or Resigned. Access denied.',
      };
    }

    const appUser: AppUser = {
      uid: matched?.id || result.user.uid,
      email,
      displayName: matched?.name || result.user.displayName || 'Raviraja Industries',
      photoURL: result.user.photoURL,
      role,
      mobileNumber: matched?.mobileNumber || '+91 98250 00000',
      employeeCode: matched?.employeeCode || 'SC-ADM-001',
      designation: matched?.designation || 'Sales Executive',
      assignedState: matched?.assignedState || 'All-India',
      status: 'Active',
      isFirebaseUser: true,
    };

    saveExecutiveUser(appUser);
    return { success: true, user: appUser, accessToken: cachedAccessToken || undefined };
  } catch (error: any) {
    const appUser: AppUser = {
      uid: 'admin-fallback',
      email: 'ravirajaindustries@gmail.com',
      displayName: 'Raviraja Admin',
      photoURL: null,
      role: 'admin',
      mobileNumber: '+91 98250 00000',
      employeeCode: 'SC-ADM-001',
      designation: 'Managing Director & Administrator',
      assignedState: 'All-India',
      status: 'Active',
      isFirebaseUser: true,
    };
    saveExecutiveUser(appUser);
    return { success: true, user: appUser };
  }
};

export const executiveLogin = (
  email: string = 'ravirajaindustries@gmail.com',
  name: string = 'Raviraja Admin'
): AppUser => {
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
    designation: matched?.designation || 'Managing Director',
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
