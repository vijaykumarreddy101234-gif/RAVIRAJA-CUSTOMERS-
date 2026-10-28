export type UserRole = 'admin' | 'sales';
export type EmployeeStatus = 'Active' | 'Inactive' | 'Resigned';

export interface Employee {
  id: string;
  name: string;
  mobileNumber: string; // e.g. +91 98250 00000
  employeeCode: string; // e.g. SC-EMP-001
  designation: string; // e.g. Senior Sales Executive, Regional Manager
  assignedState: string; // e.g. Gujarat or All-India
  assignedDistrict: string; // e.g. Surat or All
  joiningDate: string; // YYYY-MM-DD
  status: EmployeeStatus;
  role: UserRole;
  email?: string;
  createdAt: number;
}
