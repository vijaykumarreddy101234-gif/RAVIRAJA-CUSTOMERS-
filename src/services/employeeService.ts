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
const STORAGE_KEY = 'scraft_employees_v2';

const DEFAULT_EMPLOYEES: Employee[] = [
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
    createdAt: Date.now(),
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
    createdAt: Date.now(),
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
    createdAt: Date.now(),
  },
];

export class EmployeeService {
  public static getEmployees(): Employee[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
    } catch (e) {
      console.warn('Error reading stored employees:', e);
    }
    // Default fallback
    localStorage.setItem(STORAGE_KEY, JSON.stringify(DEFAULT_EMPLOYEES));
    return DEFAULT_EMPLOYEES;
  }

  public static saveEmployees(employees: Employee[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(employees));
    } catch (e) {
      console.error('Error saving employees:', e);
    }
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
