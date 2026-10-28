import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  where,
  getDocFromServer,
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth, AppUser } from './firebaseAuth';
import { CustomerVisit } from '../types/customerVisit';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialize Firestore safely with database ID
function getDbInstance() {
  try {
    const customDbId = (firebaseConfig as any).firestoreDatabaseId;
    if (customDbId && customDbId !== '(default)') {
      return getFirestore(app, customDbId);
    }
    return getFirestore(app);
  } catch (err) {
    console.warn('Fallback to default Firestore database:', err);
    return getFirestore(app);
  }
}

export const db = getDbInstance();

const VISITS_COLLECTION = 'customer_visits';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

export class FirestoreSyncService {
  /**
   * Test connection to Firestore
   */
  public static async testConnection(): Promise<boolean> {
    try {
      await getDocFromServer(doc(db, 'test', 'connection'));
      return true;
    } catch (e: any) {
      if (e?.code === 'permission-denied') {
        handleFirestoreError(e, OperationType.GET, 'test/connection');
      }
      console.warn('Firestore connection check notice:', e);
      return false;
    }
  }

  /**
   * Subscribe to real-time updates for customer visits.
   * STRICT ACCESS CONTROL:
   * - Admin: queries all company visits
   * - Sales: queries ONLY documents where salesExecutiveName matches the authenticated user
   */
  public static subscribeToVisits(
    user: AppUser | null,
    onVisitsUpdated: (visits: CustomerVisit[]) => void,
    onError?: (err: any) => void
  ) {
    if (!user) {
      onVisitsUpdated([]);
      return () => {};
    }

    const visitsRef = collection(db, VISITS_COLLECTION);
    const isAdmin = user.role === 'admin';

    // Build scoped query: Sales persons only receive their own records from the database
    const q = isAdmin
      ? query(visitsRef)
      : query(visitsRef, where('salesExecutiveName', '==', user.displayName || ''));

    return onSnapshot(
      q,
      (snapshot) => {
        const remoteVisits: CustomerVisit[] = [];
        snapshot.forEach((docSnapshot) => {
          const data = docSnapshot.data() as CustomerVisit;
          remoteVisits.push({
            ...data,
            id: docSnapshot.id,
          });
        });

        // Double defensive verification: if not admin, ensure no other employee records leak
        const filtered = isAdmin
          ? remoteVisits
          : remoteVisits.filter(
              (v) =>
                v.salesExecutiveName === user.displayName ||
                v.executiveEmail === user.email ||
                (v.userId && v.userId === user.uid)
            );

        // Sort newest first
        filtered.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onVisitsUpdated(filtered);
      },
      (error) => {
        if (error.code === 'permission-denied' || error.message?.includes('permissions')) {
          try {
            handleFirestoreError(error, OperationType.LIST, VISITS_COLLECTION);
          } catch (formattedErr) {
            if (onError) onError(formattedErr);
            return;
          }
        }
        console.error('Real-time Firestore visits listener notice:', error);
        if (onError) onError(error);
      }
    );
  }

  /**
   * Clean object recursively to remove undefined values for Firestore
   */
  private static cleanForFirestore(obj: any): any {
    if (obj === null || typeof obj !== 'object') {
      return obj;
    }
    if (Array.isArray(obj)) {
      return obj
        .map((item) => FirestoreSyncService.cleanForFirestore(item))
        .filter((item) => item !== undefined);
    }
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = FirestoreSyncService.cleanForFirestore(val);
      }
    }
    return cleaned;
  }

  /**
   * Save or update a single customer visit in Firestore
   */
  public static async saveVisit(visit: CustomerVisit, user?: AppUser | null): Promise<void> {
    const path = `${VISITS_COLLECTION}/${visit.id}`;
    try {
      const visitRef = doc(db, VISITS_COLLECTION, visit.id);
      const payload = FirestoreSyncService.cleanForFirestore({
        ...visit,
        salesExecutiveName: visit.salesExecutiveName || user?.displayName || 'nagarjuna',
        executiveEmail: visit.executiveEmail || user?.email || undefined,
        userId: user?.uid || (visit as any).userId || undefined,
        updatedAt: Date.now(),
      });
      await setDoc(visitRef, payload, { merge: true });
    } catch (err: any) {
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
      console.error('Error saving visit to Firestore:', err);
      throw err;
    }
  }

  /**
   * Delete a customer visit from Firestore (Restricted to Admin)
   */
  public static async deleteVisit(id: string): Promise<void> {
    const path = `${VISITS_COLLECTION}/${id}`;
    try {
      const visitRef = doc(db, VISITS_COLLECTION, id);
      await deleteDoc(visitRef);
    } catch (err: any) {
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
      console.error('Error deleting visit from Firestore:', err);
      throw err;
    }
  }

  /**
   * Push an array of visits to Firestore
   */
  public static async pushAllVisitsToCloud(visits: CustomerVisit[], user?: AppUser | null): Promise<number> {
    let count = 0;
    for (const v of visits) {
      try {
        await this.saveVisit(v, user);
        count++;
      } catch (e) {
        console.warn(`Could not sync visit ${v.id}:`, e);
      }
    }
    return count;
  }

  /**
   * Initial sync: seed cloud database if empty
   */
  public static async syncInitialVisits(initialVisits: CustomerVisit[], user?: AppUser | null): Promise<void> {
    try {
      const snapshot = await getDocs(collection(db, VISITS_COLLECTION));
      if (snapshot.empty && initialVisits.length > 0) {
        console.log(`Seeding ${initialVisits.length} visits to Cloud Firestore...`);
        await this.pushAllVisitsToCloud(initialVisits, user);
      }
    } catch (err: any) {
      console.warn('Initial visits cloud seed notice:', err);
    }
  }
}
