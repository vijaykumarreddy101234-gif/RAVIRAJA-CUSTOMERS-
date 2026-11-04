import React, { useState, useEffect, useMemo } from 'react';
import confetti from 'canvas-confetti';
import { CustomerVisitHeader } from './components/CustomerVisitHeader';
import { CustomerBottomNav, CustomerTabType } from './components/CustomerBottomNav';
import { CustomerVisitManagementView } from './components/CustomerVisitManagementView';
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
import { FirestoreSyncService } from './services/firestoreSync';
import { useAuth } from './contexts/AuthContext';
import { DemoLoginModal } from './components/DemoLoginModal';
import { Loader2 } from 'lucide-react';

export default function App() {
  const { user, loading, logout } = useAuth();
  const [isCloudConnected, setIsCloudConnected] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [employees, setEmployees] = useState<Employee[]>(EmployeeService.getEmployees());
  const [currentTab, setCurrentTab] = useState<CustomerTabType>('entry');
  const [selectedVisit, setSelectedVisit] = useState<CustomerVisit | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const isAdmin = user?.role === 'admin';
  const authorizedVisits = useMemo(() => {
    if (!user) return [];
    if (isAdmin) return visits;
    const uName = (user.name || '').toLowerCase().trim();
    const uEmail = (user.email || '').toLowerCase().trim();
    return visits.filter((v) => {
      const vName = (v.salesExecutiveName || '').toLowerCase().trim();
      const vEmail = (v.executiveEmail || '').toLowerCase().trim();
      const vAssigned = (v.assignedSalesperson || '').toLowerCase().trim();
      return (
        (uName && (vName === uName || vName.includes(uName) || uName.includes(vName))) ||
        (uEmail && vEmail === uEmail) ||
        (v.userId && v.userId === user.id) ||
        (uName && vAssigned.includes(uName))
      );
    });
  }, [visits, user, isAdmin]);

  const defaultExecutive = user?.name || VisitStorageService.getSalesExecutiveName();

  useEffect(() => {
    const unsubscribeEmployees = EmployeeService.subscribeToEmployees((emps) => {
      setEmployees(emps);
    });
    return () => {
      if (unsubscribeEmployees) unsubscribeEmployees();
    };
  }, []);

  useEffect(() => {
    if (!user) {
      setVisits([]);
      return;
    }

    const initialLocal = VisitStorageService.getVisits(
      user.id,
      user.role,
      user.name || undefined
    );
    setVisits(initialLocal);

    // Attach real-time sync
    const unsubscribeVisits = FirestoreSyncService.subscribeToVisits(
      user as any,
      (cloudVisits) => {
        if (cloudVisits && cloudVisits.length > 0) {
          setVisits(cloudVisits);
          VisitStorageService.saveVisits(cloudVisits, user.id, user.role);
          setIsCloudConnected(true);
        }
      },
      (error) => {
        console.warn('Sync notice:', error);
        setIsCloudConnected(false);
      }
    );

    return () => {
      if (unsubscribeVisits) unsubscribeVisits();
    };
  }, [user]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4500);
  };

  const handleLogout = async () => {
    const currentUid = user?.id;
    await logout();
    setVisits([]);
    if (currentUid) VisitStorageService.clearSessionData(currentUid);
    setShowAuthModal(true);
    showToast('Signed out. Choose a demo login or verify via Mobile OTP.');
  };

  const handleForceSync = async () => {
    setIsSyncing(true);
    try {
      await FirestoreSyncService.pushAllVisitsToCloud(authorizedVisits, user as any);
      setIsCloudConnected(true);
      showToast('✓ Cloud Sync Complete');
    } catch (err: any) {
      showToast('Sync notice: Using local cache');
    } finally {
      setIsSyncing(false);
    }
  };

  const handleSubmitVisit = async (newVisit: CustomerVisit) => {
    const now = new Date();
    const formattedSubmitTime = now.toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' });

    const visitWithAuth: CustomerVisit = {
      ...newVisit,
      salesExecutiveName: user?.name || newVisit.salesExecutiveName || defaultExecutive,
      executiveEmail: user?.email || newVisit.executiveEmail,
      userId: user?.id,
      submittedAt: newVisit.submittedAt || formattedSubmitTime,
    };

    const updated = VisitStorageService.addVisit(visitWithAuth, user?.id, user?.role);
    setVisits(updated);

    FirestoreSyncService.saveVisit(visitWithAuth, user as any)
      .then(() => setIsCloudConnected(true))
      .catch(err => console.warn('Cloud save note:', err));

    showToast(`✓ Visit for "${newVisit.customerName}" recorded!`);
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
    setCurrentTab('list');
  };

  const handleUpdateVisit = async (updatedVisit: CustomerVisit) => {
    const updated = VisitStorageService.updateVisit(updatedVisit, user?.id, user?.role);
    setVisits(updated);
    setSelectedVisit(updatedVisit);
    FirestoreSyncService.saveVisit(updatedVisit, user as any);
    showToast('✓ Record updated');
  };

  const handleDeleteVisit = async (id: string) => {
    if (user?.role !== 'admin') {
      showToast('Restricted to administrators');
      return;
    }
    const updated = VisitStorageService.deleteVisit(id, user?.id, user?.role, user?.name);
    setVisits(updated);
    FirestoreSyncService.deleteVisit(id);
    showToast('Record deleted');
  };

  const handleQuickTogglePI = (visit: CustomerVisit) => {
    const newStatus = visit.piSent === 'Yes' ? 'No' : 'Yes';
    handleUpdateVisit({ ...visit, piSent: newStatus });
  };

  const handleImportVisits = async (newVisits: CustomerVisit[]) => {
    const visitsWithAuth = newVisits.map((v) => ({
      ...v,
      salesExecutiveName: user?.role === 'sales' ? user.name : v.salesExecutiveName,
      executiveEmail: user?.email || v.executiveEmail,
      userId: user?.id,
    }));
    const updated = VisitStorageService.batchImportVisits(visitsWithAuth, user?.id, user?.role);
    setVisits(updated);
    FirestoreSyncService.pushAllVisitsToCloud(visitsWithAuth, user as any);
    showToast(`✓ Imported ${newVisits.length} records`);
    setCurrentTab('list');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#020617] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Open App: No login screen

  return (
    <div className="min-h-screen bg-[#020617] text-slate-100 flex flex-col font-sans antialiased">
      {toastMessage && (
        <div className="fixed top-14 left-1/2 -translate-x-1/2 z-50 w-11/12 max-w-md bg-slate-900 border border-sky-500/50 text-sky-200 text-xs px-4 py-2.5 rounded-2xl shadow-2xl flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-sky-400 shrink-0"></span>
          <span className="truncate flex-1 font-medium">{toastMessage}</span>
        </div>
      )}

      <CustomerVisitHeader
        user={user as any}
        onLogin={() => setShowAuthModal(true)}
        onOpenDemoLogin={() => setShowAuthModal(true)}
        onLogout={handleLogout}
        isLoggingIn={false}
        onExportExcel={() => ExportVisitService.exportToExcel(authorizedVisits, 'Raviraja_Visits')}
        onExportPdf={() => ExportVisitService.exportToPdf(authorizedVisits)}
        visitCount={authorizedVisits.length}
        isCloudConnected={isCloudConnected}
        onForceSync={handleForceSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-4 pt-4 pb-24">
        {currentTab === 'entry' && (
          <CustomerVisitManagementView
            onSubmitVisit={handleSubmitVisit}
            onUpdateVisit={handleUpdateVisit}
            onSelectVisit={(v) => setSelectedVisit(v)}
            defaultExecutiveName={defaultExecutive}
            user={user as any}
            visits={authorizedVisits}
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
            onExportExcel={() => ExportVisitService.exportToExcel(authorizedVisits, 'Raviraja_Visits')}
            onExportPdf={() => ExportVisitService.exportToPdf(authorizedVisits)}
            onLoadWorkspaceFile={() => {}}
          />
        )}
      </main>

      <CustomerVisitDetailModal
        visit={selectedVisit}
        isOpen={!!selectedVisit}
        onClose={() => setSelectedVisit(null)}
        onUpdateVisit={handleUpdateVisit}
        onDeleteVisit={handleDeleteVisit}
      />

      <DemoLoginModal
        isOpen={showAuthModal || !user}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(loggedUser) => {
          setShowAuthModal(false);
          showToast(`✓ Logged in as ${loggedUser.name} (${loggedUser.role.toUpperCase()})`);
        }}
      />

      <CustomerBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        visitCount={authorizedVisits.length}
        hotCount={visits.filter((v) => v.leadStatus === 'Hot').length}
        isAdmin={isAdmin}
      />
    </div>
  );
}
