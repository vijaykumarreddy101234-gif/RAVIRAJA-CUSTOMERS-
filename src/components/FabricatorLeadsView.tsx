import React, { useState, useMemo } from 'react';
import { Flame, Zap, Snowflake, Trophy, Phone, MessageCircle, Building, User, RotateCcw } from 'lucide-react';
import { CustomerVisit, LeadStatus } from '../types/customerVisit';

interface FabricatorLeadsViewProps {
  visits: CustomerVisit[];
  onSelectVisit: (visit: CustomerVisit) => void;
  onUpdateStatus: (visit: CustomerVisit, newStatus: LeadStatus) => void;
}

export const FabricatorLeadsView: React.FC<FabricatorLeadsViewProps> = ({
  visits,
  onSelectVisit,
  onUpdateStatus,
}) => {
  const [selectedExecutive, setSelectedExecutive] = useState<string>('All');

  // Extract unique sales executives dynamically
  const uniqueExecutives = useMemo(() => {
    const set = new Set<string>();
    visits.forEach((v) => {
      if (v.salesExecutiveName && v.salesExecutiveName.trim()) {
        set.add(v.salesExecutiveName.trim());
      }
    });
    return Array.from(set).sort();
  }, [visits]);

  // Filter visits by executive
  const executiveFilteredVisits = useMemo(() => {
    if (selectedExecutive === 'All') return visits;
    return visits.filter((v) => v.salesExecutiveName === selectedExecutive);
  }, [visits, selectedExecutive]);

  const columns: {
    status: LeadStatus;
    title: string;
    icon: any;
    color: string;
    bgColor: string;
    borderColor: string;
  }[] = [
    {
      status: 'Hot',
      title: 'Hot Leads',
      icon: Flame,
      color: 'text-rose-400',
      bgColor: 'bg-rose-950/20',
      borderColor: 'border-rose-500/30',
    },
    {
      status: 'Warm',
      title: 'Warm Leads',
      icon: Zap,
      color: 'text-amber-400',
      bgColor: 'bg-amber-950/20',
      borderColor: 'border-amber-500/30',
    },
    {
      status: 'Won / Closed',
      title: 'Converted Deals',
      icon: Trophy,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-950/20',
      borderColor: 'border-emerald-500/30',
    },
    {
      status: 'Cold',
      title: 'Cold / Inactive',
      icon: Snowflake,
      color: 'text-sky-400',
      bgColor: 'bg-sky-950/20',
      borderColor: 'border-sky-500/30',
    },
  ];

  return (
    <div className="space-y-4 pb-8">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">
            uPVC FABRICATOR CONVERSION
          </span>
        </div>
        <h2 className="text-xl font-extrabold text-white tracking-tight">uPVC Fabricator Leads</h2>
        <p className="text-xs text-slate-400">
          {executiveFilteredVisits.length} of {visits.length} leads • Conversion pipeline by sales executive
        </p>
      </div>

      {/* Simplified, Non-Clumsy Sales Executive Selector Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-4 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-2">
            <User className="w-4 h-4 text-sky-400 shrink-0" />
            <span className="font-bold text-slate-300">Sales Executive:</span>
          </div>
          <select
            value={selectedExecutive}
            onChange={(e) => setSelectedExecutive(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-white text-xs rounded-xl px-4 py-2 focus:border-sky-500 outline-none font-bold cursor-pointer transition-all"
          >
            <option value="All">All Executives ({visits.length})</option>
            {uniqueExecutives.map((exec) => {
              const count = visits.filter((v) => v.salesExecutiveName === exec).length;
              return (
                <option key={exec} value={exec}>
                  {exec} ({count})
                </option>
              );
            })}
          </select>
        </div>

        {selectedExecutive !== 'All' && (
          <button
            type="button"
            onClick={() => setSelectedExecutive('All')}
            className="text-[10px] font-bold text-sky-400 hover:text-white flex items-center gap-1 transition bg-sky-950/40 border border-sky-800/40 px-3 py-1.5 rounded-xl"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset to All</span>
          </button>
        )}
      </div>

      <div className="space-y-4">
        {columns.map((col) => {
          const ColIcon = col.icon;
          const colVisits = executiveFilteredVisits.filter((v) => v.leadStatus === col.status);

          return (
            <div
              key={col.status}
              className={`rounded-2xl border ${col.borderColor} ${col.bgColor} p-3.5 space-y-2.5 shadow-sm`}
            >
              {/* Column Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ColIcon className={`w-4 h-4 ${col.color}`} />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">{col.title}</h3>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${col.color} bg-slate-900 border border-slate-700`}>
                  {colVisits.length} Records
                </span>
              </div>

              {/* Cards in column */}
              {colVisits.length === 0 ? (
                <div className="text-center py-4 bg-slate-900/40 rounded-xl border border-slate-800/80 text-[11px] text-slate-500">
                  No visits currently in this stage
                </div>
              ) : (
                <div className="space-y-2">
                  {colVisits.map((v) => (
                    <div
                      key={v.id}
                      onClick={() => onSelectVisit(v)}
                      className="bg-slate-900/90 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl p-3 cursor-pointer transition shadow-sm"
                    >
                      <div className="flex items-baseline justify-between gap-2 mb-1">
                        <h4 className="text-xs font-bold text-white truncate">
                          {v.companyName || v.customerName}
                        </h4>
                        <span className="text-[10px] text-slate-400 font-mono shrink-0">
                          {v.city}, {v.state}
                        </span>
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-slate-300 gap-1.5 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span
                            className={`px-1.5 py-0.2 rounded text-[9px] font-bold shrink-0 ${
                              v.brand === 'SMART' || v.interestedBrand.includes('SMART')
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                                : v.brand === 'OTHERS'
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                                : 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                            }`}
                          >
                            {v.brand || (v.interestedBrand.includes('SMART') ? 'SMART' : 'S CRAFT')}
                          </span>
                          <span className="text-slate-200 font-medium truncate">
                            {v.interestedSeries || v.interestedBrand}
                          </span>
                        </div>
                        <span className="font-bold text-white shrink-0 text-[10px]">{v.quantityPerMonth}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800">
                        <span className="truncate">{v.customerName} ({v.customerType})</span>
                        <div className="flex items-center gap-1 shrink-0">
                          {v.gpsLocationLink && (
                            <span className="text-[9px] font-bold text-rose-400 bg-rose-500/10 px-1 py-0.2 rounded border border-rose-500/20">
                              📍 GPS
                            </span>
                          )}
                          <span className={v.piSent === 'Yes' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                            PI: {v.piSent}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
