import React from 'react';
import { Flame, Zap, Snowflake, Trophy, Phone, MessageCircle, Building } from 'lucide-react';
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
          Track fabricator inquiries from uPVC profile sample testing to confirmed production orders.
        </p>
      </div>

      <div className="space-y-4">
        {columns.map((col) => {
          const ColIcon = col.icon;
          const colVisits = visits.filter((v) => v.leadStatus === col.status);

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

                      <div className="flex items-center justify-between text-[11px] text-slate-300">
                        <span className="text-sky-300 font-medium truncate">{v.interestedBrand}</span>
                        <span className="font-bold text-white shrink-0">{v.quantityPerMonth}</span>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-slate-500 mt-2 pt-1.5 border-t border-slate-800">
                        <span>{v.customerName} ({v.customerType})</span>
                        <span className={v.piSent === 'Yes' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
                          PI: {v.piSent}
                        </span>
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
