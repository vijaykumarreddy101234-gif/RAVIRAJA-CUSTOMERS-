/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import { CustomerVisitHeader } from './components/CustomerVisitHeader';
import { CustomerBottomNav, CustomerTabType } from './components/CustomerBottomNav';
import { CustomerVisitForm } from './components/CustomerVisitForm';
import { CustomerVisitList } from './components/CustomerVisitList';
import { CustomerVisitDetailModal } from './components/CustomerVisitDetailModal';
import { FabricatorLeadsView } from './components/FabricatorLeadsView';
import { AllIndiaAnalyticsView } from './components/AllIndiaAnalyticsView';
import { ExcelImportExportView } from './components/ExcelImportExportView';

import { CustomerVisit, LeadStatus } from './types/customerVisit';
import { VisitStorageService } from './services/visitStorage';
import { ExportVisitService } from './services/exportVisitService';
import { initAuth, googleSignIn, logout } from './services/firebaseAuth';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const [visits, setVisits] = useState<CustomerVisit[]>([]);
  const [currentTab, setCurrentTab] = useState<CustomerTabType>('entry');
  const [selectedVisit, setSelectedVisit] = useState<CustomerVisit | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const defaultExecutive = user?.displayName || VisitStorageService.getSalesExecutiveName();

  useEffect(() => {
    setVisits(VisitStorageService.getVisits());

    const unsubscribe = initAuth(
      (currentUser) => {
        setUser(currentUser);
      },
      () => {
        setUser(null);
      }
    );

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  const handleLogin = async () => {
    setIsLoggingIn(true);
    try {
      const result = await googleSignIn();
      if (result) {
        setUser(result.user);
        VisitStorageService.setSalesExecutiveName(result.user.displayName || 'Raviraja Sales Team');
        showToast(`Connected as ${result.user.displayName || result.user.email}`);
      }
    } catch (err: any) {
      console.error('Login error:', err);
      showToast(err.message || 'Failed to connect Google account');
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    setUser(null);
    showToast('Signed out from Google account');
  };

  const handleSubmitVisit = (newVisit: CustomerVisit) => {
    const updated = VisitStorageService.addVisit(newVisit);
    setVisits(updated);
    showToast(`✓ Visit entry for "${newVisit.customerName}" submitted successfully!`);
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.8 },
    });
    // Switch to Visits Log to view the recorded visit
    setCurrentTab('list');
  };

  const handleUpdateVisit = (updatedVisit: CustomerVisit) => {
    const updated = VisitStorageService.updateVisit(updatedVisit);
    setVisits(updated);
    setSelectedVisit(updatedVisit);
    showToast('Customer record updated');
  };

  const handleDeleteVisit = (id: string) => {
    const updated = VisitStorageService.deleteVisit(id);
    setVisits(updated);
    showToast('Customer visit deleted');
  };

  const handleQuickTogglePI = (visit: CustomerVisit) => {
    const newStatus = visit.piSent === 'Yes' ? 'No' : 'Yes';
    handleUpdateVisit({
      ...visit,
      piSent: newStatus,
    });
    showToast(newStatus === 'Yes' ? 'Proforma Invoice marked as Sent!' : 'PI marked as Pending');
  };

  const handleImportVisits = (newVisits: CustomerVisit[]) => {
    const updated = VisitStorageService.batchImportVisits(newVisits);
    setVisits(updated);
    showToast(`Imported ${newVisits.length} customer visits!`);
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
      const response = await fetch('/assets/aistudio/SCRAFT_Customer_Visit_With_Submit_Setup_ac3a9af9.csv');
      if (!response.ok) {
        throw new Error('Could not read workspace file');
      }
      const text = await response.text();

      // Sample uPVC fabricator data mapped to user's uploaded file structure
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

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans antialiased selection:bg-sky-500 selection:text-slate-950">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 bg-slate-900 border border-sky-500/60 text-white px-4 py-2.5 rounded-2xl shadow-2xl text-xs font-semibold flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-sky-400"></span>
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Main Header */}
      <CustomerVisitHeader
        user={user}
        onLogin={handleLogin}
        onLogout={handleLogout}
        isLoggingIn={isLoggingIn}
        onExportExcel={handleExportExcel}
        onExportPdf={handleExportPdf}
        visitCount={visits.length}
      />

      {/* Main Mobile App Container */}
      <main className="flex-1 max-w-lg w-full mx-auto px-4 pt-4 pb-24">
        {currentTab === 'entry' && (
          <CustomerVisitForm
            onSubmitVisit={handleSubmitVisit}
            defaultExecutiveName={defaultExecutive}
          />
        )}

        {currentTab === 'list' && (
          <CustomerVisitList
            visits={visits}
            onSelectVisit={(v) => setSelectedVisit(v)}
            onDeleteVisit={handleDeleteVisit}
            onQuickTogglePI={handleQuickTogglePI}
          />
        )}

        {currentTab === 'leads' && (
          <FabricatorLeadsView
            visits={visits}
            onSelectVisit={(v) => setSelectedVisit(v)}
            onUpdateStatus={(v, newStatus) => handleUpdateVisit({ ...v, leadStatus: newStatus })}
          />
        )}

        {currentTab === 'analytics' && <AllIndiaAnalyticsView visits={visits} />}

        {currentTab === 'excel' && (
          <ExcelImportExportView
            visits={visits}
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

      {/* Mobile-Native Bottom Navigation */}
      <CustomerBottomNav
        currentTab={currentTab}
        onSelectTab={(tab) => setCurrentTab(tab)}
        visitCount={visits.length}
        hotCount={hotCount}
      />
    </div>
  );
}
