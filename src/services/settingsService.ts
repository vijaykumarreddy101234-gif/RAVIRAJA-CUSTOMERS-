import { getFirestore, doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firestoreSync';

const SETTINGS_COLLECTION = 'app_settings';
const SETTINGS_DOC_ID = 'branding';

export interface AppBranding {
  title: string;
  subtitle: string;
  logo: string | null;
  logoWidth: number;
  logoHeight: number;
}

export const DEFAULT_BRANDING: AppBranding = {
  title: 'SCRAFT uPVC Sales Tracker',
  subtitle: 'Raviraja Industries • Multi-Brands',
  logo: null,
  logoWidth: 150,
  logoHeight: 70,
};

export const SettingsService = {
  getBranding: async (): Promise<AppBranding> => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as AppBranding;
    }
    return DEFAULT_BRANDING;
  },

  updateBranding: async (branding: AppBranding): Promise<void> => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    await setDoc(docRef, branding, { merge: true });
  },

  subscribeToBranding: (onUpdate: (branding: AppBranding) => void) => {
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    return onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        onUpdate(docSnap.data() as AppBranding);
      }
    });
  },
};
