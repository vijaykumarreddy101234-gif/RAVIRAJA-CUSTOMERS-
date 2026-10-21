import React from 'react';
import { LayoutDashboard, Receipt, Target, BarChart3, Mail, RefreshCw } from 'lucide-react';

export type TabType = 'dashboard' | 'expenses' | 'budgets' | 'analytics' | 'sync';

interface BottomNavProps {
  currentTab: TabType;
  onSelectTab: (tab: TabType) => void;
  expenseCount: number;
  isSyncing: boolean;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onSelectTab,
  expenseCount,
  isSyncing,
}) => {
  const tabs = [
    { id: 'dashboard' as TabType, label: 'Overview', icon: LayoutDashboard },
    { id: 'expenses' as TabType, label: 'Expenses', icon: Receipt, badge: expenseCount },
    { id: 'budgets' as TabType, label: 'Budgets', icon: Target },
    { id: 'analytics' as TabType, label: 'Reports', icon: BarChart3 },
    { id: 'sync' as TabType, label: 'Gmail', icon: isSyncing ? RefreshCw : Mail, isSyncTab: true },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe">
      <div className="max-w-md mx-auto grid grid-cols-5 px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-1 rounded-xl transition-all duration-200 ${
                isActive
                  ? 'text-emerald-400 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-emerald-400' : ''
                  } ${tab.isSyncTab && isSyncing ? 'animate-spin text-emerald-400' : ''}`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-emerald-500 text-[10px] font-bold text-slate-950 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
                {tab.isSyncTab && !isSyncing && (
                  <span className="absolute -top-0.5 -right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-slate-900"></span>
                )}
              </div>
              <span className="text-[10px] mt-1 tracking-tight">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 w-6 h-0.5 rounded-full bg-emerald-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
