import {
  collection,
  doc,
  setDoc,
  onSnapshot,
  query,
  orderBy,
  limit,
} from 'firebase/firestore';
import { db } from './firestoreSync';

export interface SecurityAlert {
  id: string;
  attemptedEmail?: string;
  attemptedMobile?: string;
  actionType: 'UNAUTHORIZED_LOGIN_ATTEMPT' | 'INVALID_OTP_REQUEST' | 'BLOCKED_ACCESS';
  userAgent: string;
  timestamp: number;
  ipAddress?: string;
  status: 'BLOCKED' | 'WARNED';
}

const ALERTS_COLLECTION = 'security_alerts';
const LOCAL_STORAGE_ALERTS_KEY = 'scraft_security_alerts_v1';

export class AdminAlertService {
  /**
   * Record an unauthorized access or OTP attempt and alert the admin in real-time
   */
  public static async recordUnauthorizedAttempt(data: {
    email?: string;
    mobile?: string;
    actionType: SecurityAlert['actionType'];
  }): Promise<SecurityAlert> {
    const alertItem: SecurityAlert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      attemptedEmail: data.email,
      attemptedMobile: data.mobile,
      actionType: data.actionType,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : 'Unknown Device',
      timestamp: Date.now(),
      status: 'BLOCKED',
    };

    // Save to local storage
    try {
      const existing = AdminAlertService.getLocalAlerts();
      const updated = [alertItem, ...existing].slice(0, 50);
      localStorage.setItem(LOCAL_STORAGE_ALERTS_KEY, JSON.stringify(updated));
    } catch (e) {
      console.warn('Local storage alert save notice:', e);
    }

    // Save to Firestore for real-time admin notification
    try {
      const alertRef = doc(db, ALERTS_COLLECTION, alertItem.id);
      await setDoc(alertRef, alertItem);
    } catch (err) {
      console.warn('Firestore security alert sync notice:', err);
    }

    return alertItem;
  }

  public static getLocalAlerts(): SecurityAlert[] {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_ALERTS_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  }

  /**
   * Subscribe to real-time security alerts for admin dashboard
   */
  public static subscribeToAlerts(onAlertsUpdated: (alerts: SecurityAlert[]) => void) {
    try {
      const q = query(collection(db, ALERTS_COLLECTION), orderBy('timestamp', 'desc'), limit(50));
      return onSnapshot(
        q,
        (snapshot) => {
          const alerts: SecurityAlert[] = [];
          snapshot.forEach((d) => {
            alerts.push(d.data() as SecurityAlert);
          });
          onAlertsUpdated(alerts.length > 0 ? alerts : AdminAlertService.getLocalAlerts());
        },
        (err) => {
          console.warn('Security alerts real-time listener notice:', err);
          onAlertsUpdated(AdminAlertService.getLocalAlerts());
        }
      );
    } catch (e) {
      console.warn('Alerts subscription notice:', e);
      onAlertsUpdated(AdminAlertService.getLocalAlerts());
      return () => {};
    }
  }
}
