import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { AppUser, saveExecutiveUser, getStoredExecutiveUser } from '../services/firebaseAuth';
import { EmployeeService, DEFAULT_EMPLOYEES } from '../services/employeeService';

export interface User {
  id: string;
  name: string;
  email: string;
  mobileNumber: string;
  role: 'admin' | 'sales';
  status: 'Active' | 'Inactive' | 'Resigned';
  employeeCode?: string;
  designation?: string;
  displayName?: string;
  photoURL?: string | null;
  assignedState?: string;
  assignedDistrict?: string;
  uid?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (challengeId: string) => Promise<void>;
  demoLogin: (userType: 'admin' | 'nagarjuna' | 'rajesh') => Promise<User>;
  loginWithMobileOtp: (mobile: string, otp: string) => Promise<User>;
  setUserDirectly: (user: User | null) => void;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const checkAuth = async () => {
    try {
      const response = await axios.get('/api/auth/me');
      if (response.data?.user) {
        const u = response.data.user;
        const mappedUser: User = {
          id: u.id || u.uid,
          uid: u.id || u.uid,
          name: u.name || u.displayName || 'Raviraja Master Admin',
          displayName: u.name || u.displayName || 'Raviraja Master Admin',
          email: u.email,
          mobileNumber: u.mobileNumber,
          role: u.role || 'admin',
          status: u.status || 'Active',
          employeeCode: u.employeeCode,
          designation: u.designation,
          assignedState: u.assignedState,
          assignedDistrict: u.assignedDistrict,
          photoURL: u.photoURL || null,
        };
        setUser(mappedUser);
        saveExecutiveUser(mappedUser as AppUser);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.warn('Backend /api/auth/me check fallback to local session:', error);
    }

    // Fallback to local stored session if available
    const stored = getStoredExecutiveUser();
    if (stored && stored.status !== 'Resigned' && stored.status !== 'Inactive') {
      setUser({
        id: stored.uid,
        uid: stored.uid,
        name: stored.displayName || 'Raviraja Admin',
        displayName: stored.displayName || 'Raviraja Admin',
        email: stored.email || 'ravirajaindustries@gmail.com',
        mobileNumber: stored.mobileNumber || '+91 98250 00000',
        role: stored.role,
        status: (stored.status as any) || 'Active',
        employeeCode: stored.employeeCode,
        designation: stored.designation,
        assignedState: stored.assignedState,
        photoURL: stored.photoURL,
      });
    } else {
      // Default Master Admin
      const defaultAdmin: User = {
        id: 'emp-admin-01',
        uid: 'emp-admin-01',
        name: 'Raviraja Master Admin',
        displayName: 'Raviraja Master Admin',
        email: 'ravirajaindustries@gmail.com',
        mobileNumber: '+91 98250 00000',
        role: 'admin',
        status: 'Active',
        employeeCode: 'SC-ADM-001',
        designation: 'Managing Director & Administrator',
        assignedState: 'All-India',
      };
      setUser(defaultAdmin);
      saveExecutiveUser(defaultAdmin as AppUser);
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (challengeId: string) => {
    const response = await axios.post('/api/auth/complete-login', { challengeId });
    const u = response.data.user;
    const mappedUser: User = {
      id: u.id || u.uid,
      uid: u.id || u.uid,
      name: u.name || u.displayName,
      displayName: u.name || u.displayName,
      email: u.email,
      mobileNumber: u.mobileNumber,
      role: u.role,
      status: u.status,
      employeeCode: u.employeeCode,
      designation: u.designation,
      assignedState: u.assignedState,
      assignedDistrict: u.assignedDistrict,
      photoURL: u.photoURL,
    };
    setUser(mappedUser);
    saveExecutiveUser(mappedUser as AppUser);
  };

  const demoLogin = async (userType: 'admin' | 'nagarjuna' | 'rajesh'): Promise<User> => {
    try {
      const response = await axios.post('/api/auth/demo-login', { role: userType });
      if (response.data?.user) {
        const u = response.data.user;
        const mappedUser: User = {
          id: u.id || u.uid,
          uid: u.id || u.uid,
          name: u.name || u.displayName,
          displayName: u.name || u.displayName,
          email: u.email,
          mobileNumber: u.mobileNumber,
          role: u.role,
          status: u.status || 'Active',
          employeeCode: u.employeeCode,
          designation: u.designation,
          assignedState: u.assignedState,
          assignedDistrict: u.assignedDistrict,
          photoURL: u.photoURL,
        };
        setUser(mappedUser);
        saveExecutiveUser(mappedUser as AppUser);
        return mappedUser;
      }
    } catch (e) {
      console.warn('Backend demo-login failed, falling back to local preset:', e);
    }

    // Direct local preset fallback
    let preset: User;
    if (userType === 'nagarjuna') {
      preset = {
        id: 'emp-sales-nagarjuna',
        uid: 'emp-sales-nagarjuna',
        name: 'nagarjuna',
        displayName: 'nagarjuna',
        email: 'nagarjuna@scraft.in',
        mobileNumber: '+91 9440042407',
        employeeCode: 'SC-EMP-436',
        designation: 'Sales Executive',
        role: 'sales',
        assignedState: 'Telangana',
        assignedDistrict: 'Hyderabad',
        status: 'Active',
      };
    } else if (userType === 'rajesh') {
      preset = {
        id: 'emp-sales-01',
        uid: 'emp-sales-01',
        name: 'Rajeshbhai Patel',
        displayName: 'Rajeshbhai Patel',
        email: 'rajesh.patel@scraft.in',
        mobileNumber: '+91 98240 55123',
        employeeCode: 'SC-EMP-001',
        designation: 'Senior Sales Executive (Gujarat)',
        role: 'sales',
        assignedState: 'Gujarat',
        assignedDistrict: 'Surat',
        status: 'Active',
      };
    } else {
      preset = {
        id: 'emp-admin-01',
        uid: 'emp-admin-01',
        name: 'Raviraja Master Admin',
        displayName: 'Raviraja Master Admin',
        email: 'ravirajaindustries@gmail.com',
        mobileNumber: '+91 98250 00000',
        employeeCode: 'SC-ADM-001',
        designation: 'Managing Director & Administrator',
        role: 'admin',
        assignedState: 'All-India',
        status: 'Active',
      };
    }

    setUser(preset);
    saveExecutiveUser(preset as AppUser);
    return preset;
  };

  const loginWithMobileOtp = async (mobile: string, otp: string): Promise<User> => {
    const cleanMobile = mobile.replace(/\D/g, '').slice(-10);
    try {
      const response = await axios.post('/api/auth/verify-mobile-otp', { mobile: cleanMobile, otp });
      if (response.data?.user) {
        const u = response.data.user;
        const mappedUser: User = {
          id: u.id || u.uid,
          uid: u.id || u.uid,
          name: u.name || u.displayName,
          displayName: u.name || u.displayName,
          email: u.email,
          mobileNumber: u.mobileNumber,
          role: u.role,
          status: u.status || 'Active',
          employeeCode: u.employeeCode,
          designation: u.designation,
          assignedState: u.assignedState,
          assignedDistrict: u.assignedDistrict,
          photoURL: u.photoURL,
        };
        setUser(mappedUser);
        saveExecutiveUser(mappedUser as AppUser);
        return mappedUser;
      }
    } catch (e: any) {
      console.warn('API verification error, attempting directory match:', e);
    }

    // Match with employee directory
    const employees = EmployeeService.getEmployees();
    const emp = EmployeeService.findEmployeeByPhone(cleanMobile, employees);
    if (!emp) {
      throw new Error(`Mobile number +91 ${cleanMobile} is not registered in SCRAFT employee directory.`);
    }

    if (emp.status === 'Resigned' || emp.status === 'Inactive') {
      throw new Error(`This account is ${emp.status}. Contact administrator.`);
    }

    const appUser: User = {
      id: emp.id,
      uid: emp.id,
      name: emp.name,
      displayName: emp.name,
      email: emp.email || 'ravirajaindustries@gmail.com',
      mobileNumber: emp.mobileNumber,
      role: emp.role,
      status: emp.status,
      employeeCode: emp.employeeCode,
      designation: emp.designation,
      assignedState: emp.assignedState,
      assignedDistrict: emp.assignedDistrict,
    };

    setUser(appUser);
    saveExecutiveUser(appUser as AppUser);
    return appUser;
  };

  const setUserDirectly = (newUser: User | null) => {
    setUser(newUser);
    saveExecutiveUser(newUser as AppUser | null);
  };

  const logout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (e) {
      console.warn('Logout request warning:', e);
    }
    setUser(null);
    saveExecutiveUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        demoLogin,
        loginWithMobileOtp,
        setUserDirectly,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
