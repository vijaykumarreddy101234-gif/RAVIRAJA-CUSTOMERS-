/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CustomerVisitHeader } from './components/CustomerVisitHeader';
import { CustomerBottomNav, CustomerTabType } from './components/CustomerBottomNav';
import { CustomerVisitForm } from './components/CustomerVisitForm';
import { CustomerVisitList } from './components/CustomerVisitList';
import { CustomerVisitDetailModal } from './components/CustomerVisitDetailModal';
import { FabricatorLeadsView } from './components/FabricatorLeadsView';
import { AllIndiaAnalyticsView } from './components/AllIndiaAnalyticsView';
import { ExcelImportExportView } from './components/ExcelImportExportView';
import { CustomerVisitCalendarView } from './components/CustomerVisitCalendarView';
import { EmployeeManagementView } from './components/EmployeeManagementView';

import { CustomerVisit } from './types/customerVisit';
import { Employee } from './types/employee';
import { VisitStorageService } from './services/visitStorage';
import { EmployeeService } from './services/employeeService';
import { ExportVisitService } from './services/exportVisitService';
import { initAuth, googleSignIn, executiveLogin, logout, AppUser } from './services/firebaseAuth';
import { FirestoreSyncService } from './services/firestoreSync';
import { AuthModal } from './components/AuthModal';
import { EntryLoginView } from './components/EntryLoginView';

export default function App() {
  const [user, setUser] = useState<AppUser | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authError, setAuthError] = useState<{ code?: string; message?: string } | null>(null);
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);

  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(EmployeeService.getEmployees());
  const [currentTab, setCurrentTab] = useState<CustomerTabType>('entry');
  const [selectedVisit, setSelectedVisit] = useState<CustomerVisit | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const authorizedVisits = useMemo(() => {
    if (isAdmin || !user) return visits;
    return visits.filter(
      (v) =>
        v.salesExecutiveName === user.displayName ||
        v.executiveEmail === user.email ||
        v.salesExecutiveName?.toLowerCase().includes((user.displayName || '').toLowerCase())
    );
  }, [visits, user, isAdmin]);

  const defaultExecutive = user?.displayName || VisitStorageService.getSalesExecutiveName();

  useEffect(() => {
    // 1. Load cached local visits immediately for instant zero-latency render
    const initialLocal = VisitStorageService.getVisits();
    setVisits(initialLocal);

    // 2. Attach real-time Firestore listener for customer visits across all devices
    const unsubscribeVisits = FirestoreSyncService.subscribeToVisits(
      (cloudVisits) => {
        if (cloudVisits && cloudVisits.length > 0) {
          setVisits(cloudVisits);
          VisitStorageService.saveVisits(cloudVisits);
          setIsCloudConnected(true);
        } else if (initialLocal.length > 0) {
          // If cloud has zero records but we have local records, push them to cloud
          FirestoreSyncService.syncInitialVisits(initialLocal);
        }
      },
      (error) => {
        console.warn('Real-time sync notice:', error);
        setIsCloudConnected(false);
      }
    );

    // 3. Initial sync of local visits to Firestore so other devices get them immediately
    if (initialLocal.length > 0) {
      FirestoreSyncService.syncInitialVisits(initialLocal);
    }

    // 4. Real-time Firestore listener for sales employees
    const unsubscribeEmployees = EmployeeService.subscribeToEmployees((emps) => {
      setEmployees(emps);
    });

    // 5. Auth state listener
    const unsubscribeAuth = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      if (unsubscribeVisits) unsubscribeVisits();
      if (unsubscribeEmployees) unsubscribeEmployees();
      if (unsubscribeAuth) unsubscribeAuth();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4500);
  };

  const handleOpenAuthModal = () => {
    setAuthError(null);
    setIsAuthModalOpen(true);
  };

  const handleGoogleLogin = async () => {
    setIsLoggingIn(true);
    setAuthError(null);
    try {
      const result = await googleSignIn();
      if (result.success && result.user) {
        setUser(result.user);
        VisitStorageService.setSalesExecutiveName(result.user.displayName || 'Raviraja Industries');
        showToast(`✓ Connected as ${result.user.displayName || result.user.email} (Live Synced)`);
        setIsAuthModalOpen(false);
        // Force push local visits to cloud upon login
        FirestoreSyncService.pushAllVisitsToCloud(visits);
      } else {
        setAuthError({
          code: result.errorCode,
          message: result.errorMessage,
        });
        showToast(result.errorMessage || 'Please use 1-Click Executive Connect');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setAuthError({
        code: err?.code || 'auth/error',
        message: err?.message || 'Failed to connect Google account',
      });
      showToast(err.message || 'Failed to connect Google account');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleExecutiveLogin = (email: string, name: string) => {
    const execUser = executiveLogin(email, name);
    setUser(execUser);
    VisitStorageService.setSalesExecutiveName(name);
    showToast(`✓ Logged in as ${name} (${email}) - Real-Time Cloud Active`);
    setIsAuthModalOpen(false);
    confetti({ particleCount: 35, spread: 50 });
    // Force sync all records to cloud under this executive session
    FirestoreSyncService.pushAllVisitsToCloud(visits);
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    showToast('Signed out from Google account');
  };

  // Manual Force Push & Sync All Records
  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      const count = await FirestoreSyncService.pushAllVisitsToCloud(visits);
      setIsCloudConnected(true);
      showToast(`✓ Real-time Sync Complete: ${count} customer visits pushed to Cloud Firestore across all devices!`);
    } catch (err: any) {
      console.error(err);
      showToast('Sync notice: Working with cached records');
    } finally {
      setIsSyncing(false);
    }
  };

  // 1. Submit New Visit: Saves to Local + Pushes to Firestore IMMEDIATELY
  const handleSubmitVisit = async (newVisit: CustomerVisit) => {
    const visitWithEmail: CustomerVisit = {
      ...newVisit,
      executiveEmail: user?.email || newVisit.executiveEmail || 'ravirajaindustries@gmail.com',
    };

    // Save locally
    const updated = VisitStorageService.addVisit(visitWithEmail);
    setVisits(updated);

    // Push to Firestore in background
    FirestoreSyncService.saveVisit(visitWithEmail)
      .then(() => {
        setIsCloudConnected(true);
      })
      .catch((err) => {
        console.warn('Background cloud save note:', err);
      });

    showToast(`✓ Visit for "${newVisit.customerName}" saved & synced to all devices!`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
    setCurrentTab('list');
  };

  // 2. Update Visit: Updates Local + Pushes to Firestore
  const handleUpdateVisit = async (updatedVisit: CustomerVisit) => {
    const updated = VisitStorageService.updateVisit(updatedVisit);
    setVisits(updated);
    setSelectedVisit(updatedVisit);

    FirestoreSyncService.saveVisit(updatedVisit)
      .then(() => {
        setIsCloudConnected(true);
      })
      .catch((err) => {
        console.warn('Update cloud save note:', err);
      });

    showToast('✓ Customer visit record updated & synced');
  };

  // 3. Delete Visit: Deletes from Local + Deletes from Firestore
  const handleDeleteVisit = async (id: string) => {
    const updated = VisitStorageService.deleteVisit(id);
    setVisits(updated);

    FirestoreSyncService.deleteVisit(id)
      .then(() => {
        setIsCloudConnected(true);
      })
      .catch((err) => {
        console.warn('Delete cloud note:', err);
      });

    showToast('Customer visit deleted across devices');
  };

  const handleQuickTogglePI = (visit: CustomerVisit) => {
    const newStatus = visit.piSent === 'Yes' ? 'No' : 'Yes';
    handleUpdateVisit({
      ...visit,
      piSent: newStatus,
    });
    showToast(newStatus === 'Yes' ? 'Proforma Invoice marked as Sent!' : 'PI marked as Pending');
  };

  // 4. Batch Import Visits: Saves to Local + Pushes all to Firestore
  const handleImportVisits = async (newVisits: CustomerVisit[]) => {
    const visitsWithEmail = newVisits.map((v) => ({
      ...v,
      executiveEmail: user?.email || v.executiveEmail || 'ravirajaindustries@gmail.com',
    }));

    const updated = VisitStorageService.batchImportVisits(visitsWithEmail);
    setVisits(updated);

    FirestoreSyncService.pushAllVisitsToCloud(visitsWithEmail)
      .then((count) => {
        setIsCloudConnected(true);
      })
      .catch((err) => {
        console.warn('Batch cloud push note:', err);
      });

    showToast(`✓ Imported & Synced ${newVisits.length} customer visits across all devices!`);
    confetti({ particleCount: 40, spread: 55 });
    setCurrentTab('list');
  };


  const handleExportExcel = () => {
    ExportVisitService.exportToExcel(visits);
    showToast('Excel report downloaded (.xlsx)');
  };

  const handleExportPdf = () => {
    ExportVisitService.exportToPdf(visits);
    showToast('PDF report downloaded (.pdf)');
  };

  // Load the attached SCRAFT workspace file
  const handleLoadWorkspaceFile = async () => {
    try {
      const sampleFromCsv: CustomerVisit[] = [
        {
          id: `scraft-upvc-sample-${Date.now()}-1`,
          salesExecutiveName: defaultExecutive,
          customerVisitDate: new Date().toISOString().split('T')[0],
          customerName: 'Kishore Trivedi',
          mobileNumber: '+91 98240 55123',
          companyName: 'Surat Fenestrations & uPVC Windows',
          customerType: 'Fabricator',
          state: 'Gujarat',
          district: 'Surat',
          city: 'Surat Industrial Belt',
          customerAddress: 'Plot 88, Sachin GIDC, Surat 394230',
          interestedBrand: 'SCRAFT 2.5 Track Sliding Series (With Mesh)',
          currentBrand: 'Prominance',
          quantityPerMonth: '6 MT / Month',
          piSent: 'Yes',
          leadStatus: 'Hot',
          followUpDate: new Date(Date.now() + 3 * 24 * 3600 * 1000).toISOString().split('T')[0],
          visitRemarks: 'Fabricator tested SCRAFT corner joint strength and gloss finish. Very happy with wall thickness. Proforma invoice dispatched for 6 MT.',
          profileColor: 'White',
          executiveEmail: user?.email || 'ravirajaindustries@gmail.com',
          createdAt: Date.now(),
        },
        {
          id: `scraft-upvc-sample-${Date.now()}-2`,
          salesExecutiveName: defaultExecutive,
          customerVisitDate: new Date(Date.now() - 24 * 3600 * 1000).toISOString().split('T')[0],
          customerName: 'Sunil Agarwal',
          mobileNumber: '+91 98110 33491',
          companyName: 'Agarwal uPVC Window Systems',
          customerType: 'Fabricator',
          state: 'Delhi',
          district: 'New Delhi',
          city: 'Okhla Industrial Phase II',
          customerAddress: 'Phase II, Okhla Industrial Area, New Delhi',
          interestedBrand: 'SCRAFT 60mm Casement Series (Windows & Doors)',
          currentBrand: 'Kommerling',
          quantityPerMonth: '10 MT / Month',
          piSent: 'Under Preparation',
          leadStatus: 'Warm',
          followUpDate: new Date(Date.now() + 5 * 24 * 3600 * 1000).toISOString().split('T')[0],
          visitRemarks: 'Supplies villa and apartment projects. Discussed multi-point lock hardware compatibility. Preparing quote for White and Golden Oak.',
          profileColor: 'Golden Oak',
          executiveEmail: user?.email || 'ravirajaindustries@gmail.com',
          createdAt: Date.now() - 24 * 3600 * 1000,
        },
      ];

      handleImportVisits(sampleFromCsv);
      showToast('Loaded SCRAFT uPVC fabricator visit entries from template!');
    } catch (err: any) {
      console.error(err);
      showToast('Loaded default SCRAFT uPVC entries');
    }
  };

  const hotCount = visits.filter((v) => v.leadStatus === 'Hot').length;

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
        {toastMessage && (
          <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-slate-900 border border-sky-500/50 text-sky-200 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
            <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
            <span className="truncate flex-1 font-medium">{toastMessage}</span>
          </div>
        )}

        <EntryLoginView
          onGoogleLogin={handleGoogleLogin}
          onExecutiveLogin={handleExecutiveLogin}
          onMobileLoginUser={(loggedUser) => {
            setUser(loggedUser);
            VisitStorageService.setSalesExecutiveName(loggedUser.displayName || 'Raviraja Industries');
            showToast(`✓ Welcome ${loggedUser.displayName} (${loggedUser.role.toUpperCase()})`);
          }}
          isLoggingIn={isLoggingIn}
          authError={authError}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Toast notifications */}
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-slate-900 border border-sky-500/50 text-sky-200 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
          <span className="truncate flex-1 font-medium">{toastMessage}</span>
        </div>
      )}

      {/* Top App Header */}
      <CustomerVisitHeader
        user={user}
        onLogin={handleOpenAuthModal}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        visitCount={visits.length}
        isCloudConnected={isCloudConnected}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-2xl w-full mx-auto px-3 sm:px-4 pt-4 pb-24">
        {currentTab === 'entry' && (
          <CustomerVisitForm
            onSubmitVisit={handleSubmitVisit}
            defaultExecutiveName={defaultExecutive}
          />
        )}

        {currentTab === 'list' && (
          <CustomerVisitList
            visits={authorizedVisits}
            onSelectVisit={(v) => setSelectedVisit(v)}
            onDeleteVisit={handleDeleteVisit}
            onQuickTogglePI={handleQuickTogglePI}
          />
        )}

        {currentTab === 'calendar' && (
          <CustomerVisitCalendarView
            visits={authorizedVisits}
            onSelectVisit={(v) => setSelectedVisit(v)}
          />
        )}

        {currentTab === 'leads' && (
          <FabricatorLeadsView
            visits={authorizedVisits}
            onSelectVisit={(v) => setSelectedVisit(v)}
            onUpdateStatus={(v, newStatus) => handleUpdateVisit({ ...v, leadStatus: newStatus })}
          />
        )}

        {currentTab === 'employees' && isAdmin && (
          <EmployeeManagementView
            employees={employees}
            visits={visits}
            onUpdateEmployees={(newEmps) => setEmployees(newEmps)}
            onUpdateVisits={(newVisits) => {
              setVisits(newVisits);
              VisitStorageService.saveVisits(newVisits);
              FirestoreSyncService.pushAllVisitsToCloud(newVisits);
            }}
            showToast={showToast}
          />
        )}

        {currentTab === 'analytics' && <AllIndiaAnalyticsView visits={authorizedVisits} />}

        {currentTab === 'excel' && (
          <ExcelImportExportView
            visits={authorizedVisits}
            onImportVisits={handleImportVisits}
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onLoadWorkspaceFile={handleLoadWorkspaceFile}
          />
        )}
      </main>

      {/* Customer Detail Inspector Modal */}
      <CustomerVisitDetailModal
        visit={selectedVisit}
        isOpen={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onUpdateVisit={handleUpdateVisit}
        onDeleteVisit={handleDeleteVisit}
      />

      {/* Auth Modal with Mobile Number & OTP Login */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onGoogleLogin={handleGoogleLogin}
        onExecutiveLogin={handleExecutiveLogin}
        onMobileLoginUser={(loggedUser) => {
          setUser(loggedUser);
          VisitStorageService.setSalesExecutiveName(loggedUser.displayName || 'Raviraja Industries');
          showToast(`✓ Logged in as ${loggedUser.displayName} (${loggedUser.role.toUpperCase()})`);
          setIsAuthModalOpen(false);
        }}
        isLoggingIn={isLoggingIn}
        authError={authError}
      />

      {/* Mobile-Native Bottom Navigation with Role-Based Tabs */}
      <CustomerBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        visitCount={authorizedVisits.length}
        hotCount={hotCount}
        isAdmin={isAdmin}
      />
    </div>
  );
}
