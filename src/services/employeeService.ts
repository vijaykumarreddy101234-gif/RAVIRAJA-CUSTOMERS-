import {
  getFirestore,
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  onSnapshot,
} from 'firebase/firestore';
import { getApps, initializeApp, getApp } from 'firebase/app';
import firebaseConfig from '../../firebase-applet-config.json';
import { Employee } from '../types/employee';

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);

const EMPLOYEES_COLLECTION = 'sales_employees';
const STORAGE_KEY = 'scraft_employees_v3';

export const normalizePhone = (phone: string): string => {
  if (!phone) return '';
  return phone.replace(/\D/g, '').slice(-10);
};

export const DEFAULT_EMPLOYEES: Employee[] = [
  {
    id: 'emp-admin-01',
    name: 'Raviraja Admin',
    mobileNumber: '+91 98250 00000',
    employeeCode: 'SC-ADM-001',
    designation: 'Managing Director & Administrator',
    assignedState: 'All-India',
    assignedDistrict: 'All Districts',
    joiningDate: '2023-01-01',
    status: 'Active',
    role: 'admin',
    email: 'ravirajaindustries@gmail.com',
    createdAt: 1672531200000,
  },
  {
    id: 'emp-sales-nagarjuna',
    name: 'nagarjuna',
    mobileNumber: '+91 9440042407',
    employeeCode: 'SC-EMP-436',
    designation: 'Sales Executive',
    assignedState: 'Telangana',
    assignedDistrict: 'Hyderabad',
    joiningDate: '2026-10-28',
    status: 'Active',
    role: 'sales',
    email: 'nagarjuna@scraft.in',
    createdAt: Date.now() - 86400000,
  },
  {
    id: 'emp-sales-01',
    name: 'Rajeshbhai Patel',
    mobileNumber: '+91 98240 55123',
    employeeCode: 'SC-EMP-001',
    designation: 'Senior Sales Executive (Gujarat)',
    assignedState: 'Gujarat',
    assignedDistrict: 'Surat',
    joiningDate: '2023-04-15',
    status: 'Active',
    role: 'sales',
    email: 'rajesh.patel@scraft.in',
    createdAt: 1681516800000,
  },
  {
    id: 'emp-sales-02',
    name: 'Sunil Agarwal',
    mobileNumber: '+91 98110 33491',
    employeeCode: 'SC-EMP-002',
    designation: 'Sales Manager (North India)',
    assignedState: 'Delhi',
    assignedDistrict: 'New Delhi',
    joiningDate: '2023-06-10',
    status: 'Active',
    role: 'sales',
    email: 'sunil.agarwal@scraft.in',
    createdAt: 1686355200000,
  },
];

export class EmployeeService {
  public static normalizePhone(phone: string): string {
    return normalizePhone(phone);
  }

  public static findEmployeeByPhone(phone: string, employees?: Employee[]): Employee | undefined {
    const norm = normalizePhone(phone);
    if (!norm || norm.length < 10) return undefined;
    const list = employees && employees.length > 0 ? employees : EmployeeService.getEmployees();
    return list.find((e) => normalizePhone(e.mobileNumber) === norm);
  }

  public static getEmployees(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      let list: Employee[] = [];
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          list = parsed;
        }
      }
      // Merge with DEFAULT_EMPLOYEES so default accounts (admin, nagarjuna, etc.) are always present
      const map = new Map<string, Employee>();
      DEFAULT_EMPLOYEES.forEach((d) => map.set(normalizePhone(d.mobileNumber), d));
      list.forEach((e) => map.set(normalizePhone(e.mobileNumber), e));
      const merged = Array.from(map.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
      return merged;
    } catch (e) {
      console.warn('Error reading stored employees:', e);
      return DEFAULT_EMPLOYEES;
    }
  }

  public static saveEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.error('Error saving employees:', e);
    }
  }

  /**
   * Real-time listener for Firestore sales_employees collection
   */
  public static subscribeToEmployees(onUpdated: (employees: Employee[]) => void) {
    const colRef = collection(db, EMPLOYEES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        if (!snapshot.empty) {
          const cloudEmployees: Employee[] = [];
          snapshot.forEach((docSnap) => {
            cloudEmployees.push({
              ...(docSnap.data() as Employee),
              id: docSnap.id,
            });
          });

          // Merge with DEFAULT_EMPLOYEES to ensure baseline accounts
          const map = new Map<string, Employee>();
          DEFAULT_EMPLOYEES.forEach((d) => map.set(normalizePhone(d.mobileNumber), d));
          cloudEmployees.forEach((c) => map.set(normalizePhone(c.mobileNumber), c));
          const merged = Array.from(map.values());
          EmployeeService.saveEmployees(merged);
          onUpdated(merged);
        } else {
          // Push default employees to Firestore if collection is empty
          DEFAULT_EMPLOYEES.forEach((emp) => {
            setDoc(doc(db, EMPLOYEES_COLLECTION, emp.id), emp).catch(() => {});
          });
          onUpdated(DEFAULT_EMPLOYEES);
        }
      },
      (error) => {
        console.warn('Real-time employees listener notice:', error);
        onUpdated(EmployeeService.getEmployees());
      }
    );
  }

  public static addEmployee(newEmp: Omit<Employee, 'id' | 'createdAt'>): Employee[] {
    const employees = EmployeeService.getEmployees();
    const created: Employee = {
      ...newEmp,
      id: `emp-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      createdAt: Date.now(),
    };
    const updated = [created, ...employees];
    EmployeeService.saveEmployees(updated);

    // Sync to Firestore
    setDoc(doc(db, EMPLOYEES_COLLECTION, created.id), created).catch((err) =>
      console.warn('Firestore employee save note:', err)
    );

    return updated;
  }

  public static registerSalesEmployee(name: string, mobileNumber: string, state: string = 'Telangana'): Employee {
    const cleanNumber = mobileNumber.startsWith('+91')
      ? mobileNumber
      : `+91 ${normalizePhone(mobileNumber)}`;
    const newEmp: Employee = {
      id: `emp-sales-${Date.now()}`,
      name: name.trim() || 'Sales Executive',
      mobileNumber: cleanNumber,
      employeeCode: `SC-EMP-${Math.floor(100 + Math.random() * 900)}`,
      designation: 'Sales Executive',
      assignedState: state,
      assignedDistrict: 'All Districts',
      joiningDate: new Date().toISOString().split('T')[0],
      status: 'Active',
      role: 'sales', // Employees can only register as sales, never admin
      email: `${name.toLowerCase().replace(/\s+/g, '') || 'sales'}@scraft.in`,
      createdAt: Date.now(),
    };

    const current = EmployeeService.getEmployees();
    const updated = [newEmp, ...current];
    EmployeeService.saveEmployees(updated);

    setDoc(doc(db, EMPLOYEES_COLLECTION, newEmp.id), newEmp).catch((err) =>
      console.warn('Firestore sales employee registration note:', err)
    );

    return newEmp;
  }

  public static updateEmployee(updatedEmp: Employee): Employee[] {
    const employees = EmployeeService.getEmployees();
    const updated = employees.map((e) => (e.id === updatedEmp.id ? updatedEmp : e));
    EmployeeService.saveEmployees(updated);

    setDoc(doc(db, EMPLOYEES_COLLECTION, updatedEmp.id), updatedEmp).catch((err) =>
      console.warn('Firestore employee update note:', err)
    );

    return updated;
  }

  public static deleteEmployeeLocally(id: string): Employee[] {
    const employees = EmployeeService.getEmployees();
    const updated = employees.filter((e) => e.id !== id);
    EmployeeService.saveEmployees(updated);
    return updated;
  }
}
