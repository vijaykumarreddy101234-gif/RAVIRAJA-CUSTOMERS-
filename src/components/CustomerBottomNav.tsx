import React from 'react';
import {
  ClipboardEdit,
  Users,
  Flame,
  MapPin,
  FileSpreadsheet,
} from 'lucide-react';

export type CustomerTabType =
  | 'entry'
  | 'list'
  | 'leads'
  | 'analytics'
  | 'excel';

interface CustomerBottomNavProps {
  currentTab: CustomerTabType;
  onSelectTab: (tab: CustomerTabType) => void;
  visitCount: number;
  hotCount: number;
}

export const CustomerBottomNav: React.FC<CustomerBottomNavProps> = ({
  currentTab,
  onSelectTab,
  visitCount,
  hotCount,
}) => {
  const tabs = [
    { id: 'entry' as CustomerTabType, label: 'New Visit', icon: ClipboardEdit },
    { id: 'list' as CustomerTabType, label: 'Visits', icon: Users, badge: visitCount },
    { id: 'leads' as CustomerTabType, label: 'uPVC Leads', icon: Flame, hotBadge: hotCount },
    { id: 'analytics' as CustomerTabType, label: 'All-India', icon: MapPin },
    { id: 'excel' as CustomerTabType, label: 'Excel/Sync', icon: FileSpreadsheet },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 bg-slate-900/95 backdrop-blur-lg border-t border-slate-800 pb-safe shadow-2xl">
      <div className="max-w-lg mx-auto grid grid-cols-5 px-1 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onSelectTab(tab.id)}
              className={`relative flex flex-col items-center justify-center py-1.5 px-0.5 rounded-xl transition-all duration-200 ${
                isActive ? 'text-sky-400 font-semibold' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <div className="relative">
                <Icon
                  className={`w-5 h-5 transition-transform duration-200 ${
                    isActive ? 'scale-110 text-sky-400' : ''
                  }`}
                />
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-sky-500 text-[9px] font-bold text-slate-950 flex items-center justify-center">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                )}
                {tab.hotBadge !== undefined && tab.hotBadge > 0 && (
                  <span className="absolute -top-1.5 -right-2.5 min-w-[15px] h-3.5 px-1 rounded-full bg-rose-500 text-[9px] font-bold text-white flex items-center justify-center">
                    {tab.hotBadge}
                  </span>
                )}
              </div>
              <span className="text-[9px] mt-1 tracking-tight truncate max-w-[60px]">
                {tab.label}
              </span>
              {isActive && (
                <span className="absolute bottom-0 w-5 h-0.5 rounded-full bg-sky-400"></span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
