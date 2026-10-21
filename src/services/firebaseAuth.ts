import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

const provider = new GoogleAuthProvider();
// Workspace Gmail scopes
provider.addScope('https://www.googleapis.com/auth/gmail.readonly');
provider.addScope('https://www.googleapis.com/auth/userinfo.email');
provider.addScope('https://www.googleapis.com/auth/userinfo.profile');
provider.setCustomParameters({
  prompt: 'select_account',
});

let isSigningIn = false;
let cachedAccessToken: string | null = null;

const USER_SESSION_KEY = 'scraft_user_session_v1';

export interface AppUser {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  isFirebaseUser?: boolean;
}

// Get saved user from local storage
export const getStoredExecutiveUser = (): AppUser | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

// Save user session
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

// Initialize auth state listener
export const initAuth = (
  onAuthSuccess?: (user: AppUser, token: string) => void,
  onAuthFailure?: () => void
) => {
  return onAuthStateChanged(auth, async (firebaseUser: User | null) => {
    if (firebaseUser) {
      const appUser: AppUser = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName || 'Raviraja Industries',
        photoURL: firebaseUser.photoURL,
        isFirebaseUser: true,
      };
      saveExecutiveUser(appUser);
      if (onAuthSuccess) onAuthSuccess(appUser, cachedAccessToken || '');
    } else {
      // Check if user previously logged in via executive session
      const stored = getStoredExecutiveUser();
      if (stored) {
        if (onAuthSuccess) onAuthSuccess(stored, cachedAccessToken || '');
      } else {
        cachedAccessToken = null;
        if (onAuthFailure) onAuthFailure();
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

export const googleSignIn = async (): Promise<SignInResult> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    cachedAccessToken = credential?.accessToken || null;

    const appUser: AppUser = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || 'Raviraja Industries',
      photoURL: result.user.photoURL,
      isFirebaseUser: true,
    };

    saveExecutiveUser(appUser);
    return { success: true, user: appUser, accessToken: cachedAccessToken || undefined };
  } catch (error: any) {
    console.error('Firebase Auth sign-in error:', error);
    const code = error?.code || 'auth/unknown';
    const message = error?.message || 'Failed to authenticate with Firebase';

    return {
      success: false,
      errorCode: code,
      errorMessage: message,
    };
  } finally {
    isSigningIn = false;
  }
};

// Direct Executive Login (e.g. ravirajaindustries@gmail.com) for smooth field sales operation
export const executiveLogin = (
  email: string = 'ravirajaindustries@gmail.com',
  name: string = 'Raviraja Industries'
): AppUser => {
  const appUser: AppUser = {
    uid: `exec-${Date.now()}`,
    email,
    displayName: name,
    photoURL: null,
    isFirebaseUser: false,
  };
  saveExecutiveUser(appUser);
  return appUser;
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
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
