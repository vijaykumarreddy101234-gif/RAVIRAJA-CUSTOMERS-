import {
  getFirestore,
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  query,
  getDocFromServer,
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { auth } from './firebaseAuth';
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
   * Subscribe to real-time updates for customer visits across all devices
   */
  public static subscribeToVisits(
    onVisitsUpdated: (visits: CustomerVisit[]) => void,
    onError?: (err: any) => void
  ) {
    const visitsRef = collection(db, VISITS_COLLECTION);
    const q = query(visitsRef);

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

        // Sort newest first
        remoteVisits.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        onVisitsUpdated(remoteVisits);
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
   * Save or update a single customer visit in Firestore
   */
  public static async saveVisit(visit: CustomerVisit): Promise<void> {
    const path = `${VISITS_COLLECTION}/${visit.id}`;
    try {
      const visitRef = doc(db, VISITS_COLLECTION, visit.id);
      await setDoc(visitRef, {
        ...visit,
        updatedAt: Date.now(),
      });
    } catch (err: any) {
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.WRITE, path);
      }
      console.error('Error saving visit to Firestore:', err);
      throw err;
    }
  }

  /**
   * Delete a customer visit from Firestore
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
   * Batch seed/sync local visits to Firestore so other devices get them immediately
   */
  public static async syncInitialVisits(visits: CustomerVisit[]): Promise<void> {
    if (!visits || visits.length === 0) return;
    try {
      const snapshot = await getDocs(collection(db, VISITS_COLLECTION));
      const existingIds = new Set(snapshot.docs.map((d) => d.id));

      for (const visit of visits) {
        if (!existingIds.has(visit.id)) {
          await setDoc(doc(db, VISITS_COLLECTION, visit.id), {
            ...visit,
            updatedAt: Date.now(),
          });
        }
      }
    } catch (err: any) {
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.WRITE, VISITS_COLLECTION);
      }
      console.warn('Initial sync error:', err);
    }
  }

  /**
   * Force push all local visits to cloud Firestore
   */
  public static async pushAllVisitsToCloud(visits: CustomerVisit[]): Promise<number> {
    if (!visits || visits.length === 0) return 0;
    try {
      let count = 0;
      for (const visit of visits) {
        await setDoc(doc(db, VISITS_COLLECTION, visit.id), {
          ...visit,
          updatedAt: Date.now(),
        });
        count++;
      }
      return count;
    } catch (err: any) {
      if (err?.code === 'permission-denied' || err?.message?.includes('permissions')) {
        handleFirestoreError(err, OperationType.WRITE, VISITS_COLLECTION);
      }
      console.error('Error pushing visits to cloud:', err);
      throw err;
    }
  }
}
